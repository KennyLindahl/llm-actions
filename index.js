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

  const content = extractContent(response.choices[0].message.content);

  return content ? JSON.parse(content) : null;
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

function getPrompt(userInput) {
  const actionDefinitions = Object.values(actions)
    .map((action) => `${action.promptActionDefinition}\n`)
    .join("");
  return `
  Based on this query:
  "${userInput}"

  ${actionDefinitions}

  Output this format: [Actions here]
  `;
}

async function executeActions(actionEvents) {
  for (const actionEvent of actionEvents) {
    switch (actionEvent.type) {
      case "create-directory":
        await actions.createDirectory.execute(actionEvent);
        break;

      case "create-file":
        await actions.createFile.execute(actionEvent);
        break;

      default:
        console.error("Invalid action type:", actionEvent.type);
        break;
    }
  }
}

async function run() {
  const args = process.argv.slice(2);
  const userInput = args.join(" ");
  const prompt = getPrompt(userInput);
  const actionEvents = await executePrompt(prompt);
  await executeActions(actionEvents);
}

(async () => {
  await run();
})();
