import { Ollama } from "ollama";
import { config } from "../config";

interface ParsedContent {
  actions?: unknown[] | unknown;
}

const ollama = new Ollama({
  host: config.ollama.host,
});

export async function executePrompt(prompt: string): Promise<unknown[]> {
  try {
    const response = await ollama.chat({
      model: config.ollama.model as string,
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

    let content = response.message.content;

    const jsonMatch = content.match(/\{.*\}|\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("No valid JSON or array found in the response");
    }

    content = jsonMatch[0];

    const parsedContent: ParsedContent = JSON.parse(content);

    if (parsedContent && Array.isArray(parsedContent.actions)) {
      return parsedContent.actions;
    }

    return parsedContent?.actions ? [parsedContent.actions] : [];
  } catch (error) {
    console.error("Error executing prompt with Ollama:", error);
    throw error;
  }
}
