#!/usr/bin/env node

const { OpenAI } = require("openai");
const path = require("path");
const fs = require("fs").promises;
const { execSync } = require("child_process");
const dotenv = require("dotenv");

const scriptDir = __dirname;
const envPath = path.join(scriptDir, ".env");
dotenv.config({ path: envPath });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function executePrompt(prompt) {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    temperature: 0.7,
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

// Could probably be done in a better way
function getCurrentDirectory() {
  try {
    const pwd = execSync("pwd").toString().trim();
    return pwd;
  } catch (error) {
    console.error("Error retrieving current directory:", error);
    process.exit(1);
  }
}

// // Action type: Search
// {
//   type: “search”,
//   searchPhrase: string
//   Id: string
// }
function getPrompt(userInput) {
  return `
  Based on this query:
  "${userInput}"

  // Action type: Create directory
  {
    type: “create-directory”,
    path: string
  }

  // Action type: Create file
  {
    type: “create-file”,
    fileContents: string,
    fileNamePath: string
  }

  Output this format: [Actions here]
  `;
}

async function executeActions(actions) {
  const currentDir = getCurrentDirectory();

  for (const action of actions) {
    switch (action.type) {
      case "create-directory":
        try {
          const directoryPath = path.join(currentDir, action.path);
          await fs.mkdir(directoryPath, { recursive: true });
          console.log(`Created directory: ${directoryPath}`);
        } catch (error) {
          console.error(`Error creating directory ${action.path}:`, error);
        }
        break;

      case "create-file":
        try {
          const filePath = path.join(currentDir, action.fileNamePath);
          await fs.writeFile(filePath, action.fileContents);
          console.log(`Created file: ${filePath}`);
        } catch (error) {
          console.error(`Error creating file ${action.fileNamePath}:`, error);
        }
        break;

      default:
        console.error("Invalid action type:", action.type);
        break;
    }
  }
}

async function run() {
  const args = process.argv.slice(2);
  const userInput = args.join(" ");
  const prompt = getPrompt(userInput);
  const actions = await executePrompt(prompt);
  await executeActions(actions);
}

(async () => {
  await run();
})();
