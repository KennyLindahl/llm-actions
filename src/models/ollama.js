const { Ollama } = require("ollama");
const { config } = require("../config");

const ollama = new Ollama({
  host: config.ollama.host,
});

async function executePrompt(prompt) {
  try {
    const response = await ollama.chat({
      model: config.ollama.model,
      messages: [
        {
          role: "system",
          content:
            "Always exclusively always answer in in JSON format: {actions: [Actions here]}",
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
