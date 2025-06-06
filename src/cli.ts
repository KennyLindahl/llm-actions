#!/usr/bin/env node
import { LlmActions, actions } from ".";
import { type ActionEvent } from "./actions";

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
  test.prompt(userInput).then(async ({ actionReturnValues, instance }) => {
    const readFileValues = await Promise.all(
      (
        actionReturnValues.filter((event) => event.type === "read-file") || []
      ).map((event) => event.returnValue),
    );

    if (readFileValues) {
      console.log("readFileValues:", readFileValues);
      const newPrompt = await instance.getPrompt(userInput, readFileValues);
      const newActionEvents = await instance.executePrompt(newPrompt);
      await instance.executeActions(newActionEvents);
    }
  });
}

// Add examples in Readme of 
// - How to create a custom event 
// - How to define a custom flow 

run().catch((err) => {
  console.error("Error running CLI:", err);
});
