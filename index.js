#!/usr/bin/env node

const { OpenAI } = require("openai");
const path = require("path");
const actions = require("./actions");
const dotenv = require("dotenv");
const utils = require("./utils.js");

const scriptDir = __dirname;
const envPath = path.join(scriptDir, ".env");
dotenv.config({ path: envPath });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function executePrompt(prompt) {
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Answer in json format",
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  const parsedContent = JSON.parse(content).actions;

  return Array.isArray(parsedContent) ? parsedContent : [parsedContent];
}

function extractContent(input) {
  const startBracketIndex = input.indexOf("[");
  const endBracketIndex = input.lastIndexOf("]");

  if (
    startBracketIndex === -1 ||
    endBracketIndex === -1 ||
    endBracketIndex <= startBracketIndex
  ) {
    return null; // No valid JSON array found
  }

  const jsonArrayString = input.substring(
    startBracketIndex,
    endBracketIndex + 1,
  );
  return jsonArrayString.trim();
}

async function getPrompt(userInput, fileContents) {
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
  `,
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

async function executeActions(actionEvents) {
  const files = [];
  for (const actionEvent of actionEvents) {
    switch (actionEvent.type) {
      case "create-directory":
        await actions.createDirectory.execute(actionEvent);
        break;

      case "create-file":
        await actions.createFile.execute(actionEvent);
        break;

      case "read-file":
        const fileContents = await actions.readFile.execute(actionEvent);
        files.push({
          fileNamePath: actionEvent.fileNamePath,
          contents: fileContents,
        });
        break;

      default:
        console.error("Invalid action type:", actionEvent.type);
        break;
    }
  }

  return {
    files,
  };
}

async function run() {
  const args = process.argv.slice(2);
  const userInput = args.join(" ");
  const prompt = await getPrompt(userInput);
  const actionEvents = await executePrompt(prompt);
  const actionReturns = await executeActions(actionEvents);

  // Maybe make this into a loop later?
  if (actionReturns.files.length > 0) {
    const newPrompt = await getPrompt(userInput, actionReturns.files);
    const newActionEvents = await executePrompt(newPrompt);
    await executeActions(newActionEvents);
  }
}

(async () => {
  await run();
})();
