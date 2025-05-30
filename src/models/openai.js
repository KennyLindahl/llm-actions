const path = require("path");
const dotenv = require("dotenv");
const scriptDir = __dirname;
const envPath = path.join(scriptDir, "../.env");
const { config } = require("../config.js");

dotenv.config({ path: envPath });

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: config.openAi.apiKey,
});

async function executePrompt(prompt) {
  try {
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
  } catch (error) {
    console.error("Error executing prompt with OpenAI:", error);
    throw error;
  }
}

module.exports = { openai, executePrompt };
