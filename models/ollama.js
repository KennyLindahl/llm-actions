const { Ollama } = require("ollama");
const dotenv = require("dotenv");
const path = require("path");
const scriptDir = __dirname;
const envPath = path.join(scriptDir, "../.env");

dotenv.config({ path: envPath });

const ollama = new Ollama({
  model: process.env.OLLAMA_MODEL,
});

async function executePrompt(prompt) {
  try {
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL, // Ensure the model is provided in the .env file
      messages: [
        {
          role: "system",
          content: "Answer in JSON format",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the content from the response
    let content = response.message.content;

    // Use regex to extract only the JSON portion
    const jsonMatch = content.match(/\{.*\}|\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No valid JSON or array found in the response");
    }

    content = jsonMatch[0];

    // Parse the JSON content from the response
    const parsedContent = JSON.parse(content);

    if (parsedContent && Array.isArray(parsedContent.actions)) {
      return parsedContent.actions;
    }

    return parsedContent?.actions ? [parsedContent.actions] : [];
  } catch (error) {
    console.error("Error executing prompt with Ollama:", error);
    throw error;
  }
}

module.exports = { executePrompt };
