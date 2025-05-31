#!/usr/bin/env node

import { actions } from "./actions";
import * as utils from "./utils";
import { executePrompt } from "./models/index";
import { ActionEvent } from "./actions";

type FileContent = {
  fileNamePath: string;
  contents: string;
};

async function getPrompt(
  userInput: string,
  fileContents?: FileContent[]
): Promise<string> {
  const currentDirectory = utils.getCurrentDir();
  const directoryTree = await utils.readDirectoryString(currentDirectory);

  const actionDefinitions = Object.values(actions)
    .map((action) => `${action.promptActionDefinition}\n`)
    .join("");

  const fileContentsString = fileContents
    ? fileContents
        .map(
          (file) =>
            `//${file.fileNamePath}
${file.contents}
  `
        )
        .join("\n")
    : "";

  return `
Based on this query:
"${userInput}"

Action definitions (YOU MUST ALWAYS choose either read-file or create-file per fileNamePath)
${actionDefinitions}

Output this format:
{actions: [Actions here]}

This is the current directory structure:
${directoryTree}

${fileContentsString}
  `;
}

async function executeActions(
  actionEvents: ActionEvent[]
): Promise<{ files: FileContent[] }> {
  const files: FileContent[] = [];

  for (const actionEvent of actionEvents) {
    switch (actionEvent.type) {
      case "create-directory":
        await actions.createDirectory.execute(actionEvent);
        break;

      case "create-file":
        await actions.createFile.execute(actionEvent);
        break;

      case "create-image":
        if (
          "createImage" in actions &&
          typeof actions.createImage !== "undefined"
        ) {
          await actions.createImage.execute(actionEvent);
        }
        break;

      case "read-file":
        const fileContents = await actions.readFile.execute(actionEvent);
        if (fileContents) {
          files.push({
            fileNamePath: actionEvent.fileNamePath!,
            contents: fileContents,
          });
        }
        break;

      default:
        console.error("Invalid action type:", (actionEvent as any).type);
        break;
    }
  }

  return { files };
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const userInput = args.join(" ");
  const prompt = await getPrompt(userInput);
  const actionEvents = await executePrompt(prompt);
  const actionReturns = await executeActions(actionEvents);

  if (actionReturns.files.length > 0) {
    const newPrompt = await getPrompt(userInput, actionReturns.files);
    const newActionEvents = await executePrompt(newPrompt);
    await executeActions(newActionEvents);
  }
}

run().catch((err) => {
  console.error("Error running CLI:", err);
});
