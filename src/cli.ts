#!/usr/bin/env node
import { LlmActions, PromptReturnValue, actions } from ".";
import { type ActionEvent } from "./actions";

// Move to index.ts
async function passReadFileContents({
  userInput,
  actionEvents,
  actionReturnValues,
  instance,
}: PromptReturnValue) {
  console.log("Previous action events:", JSON.stringify(actionEvents, null, 2));
  const readFileValues = await Promise.all(
    (
      actionReturnValues.filter((event) => event.type === "read-file") || []
    ).map((event) => event.returnValue),
  );

  if (readFileValues) {
    console.log("readFileValues:", readFileValues);
    const fileContentsString = readFileValues
      ? readFileValues
          .map((file) => `//${file.fileNamePath}\n${file.contents}\n`)
          .join("\n")
      : "";

    // - Main prompt should have the previous actions passed together with the return values ()
    // - The action should choose how to format the return values for the upcoming prompt (should be possible to override?)

    // CONTINUE HERE LATER! <--------------------------------------------------------------------------------------------
    // Maybe every action that returns a value should have a `toPromptString` method?
    // - Then this could be automatically passed to the next iteration

    // It could be done even further:
    // - In the first iteration:
    //   - The LLM comes up with a plan (only if there is further steps needed)
    //   - Executes the first step
    // - Second iteration:
    //   - Plan may be altered
    //   - Indicate that the first step is done and the intention behind it
    //   - Contains
    const mainPrompt = await instance.getPrompt(userInput);

    const newPrompt = `${mainPrompt}
${fileContentsString}`;
    const newActionEvents = await instance.executePrompt(newPrompt);
    await instance.executeActions(newActionEvents);
  }
}

// This part should be moved to cli.ts (then this should be )
async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const userInput = args.join(" ");
  // When designing this API we should cover two different scenarios
  // - Base flow read files -> Write files (This is what the CLI does)
  // - Custom flow (user defined)
  const test = new LlmActions({
    actions: [actions.readFile, actions.writeFile, actions.createDirectory],
  });

  test.onEvent((actionEvent: ActionEvent) => {
    switch (actionEvent.type) {
      case "read-file":
        console.log(`Read file: ${actionEvent.fileNamePath}`);
        break;
      case "create-directory":
        console.log(`Created directory: ${actionEvent.path}`);
        break;
      case "write-file":
        console.log(`Created file: ${actionEvent.fileNamePath}`);
        break;
      case "create-image":
        console.log(`Created image: ${actionEvent.fileNamePath}`);
        break;
      default:
        throw Error("Unknown event type:", (actionEvent as any).type);
    }
  });

  // Todo: Likely the default flow (anonynmous function) should be moved to the class
  test.prompt(userInput).then(passReadFileContents);
}

// Add examples in Readme of
// - How to create a custom event
// - How to define a custom flow

run().catch((err) => {
  console.error("Error running CLI:", err);
});
