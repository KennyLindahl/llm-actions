import { Ollama } from "ollama";
import { config } from "../config";
import { ParsedContent, SYSTEM_PROMPT } from ".";

const ollama = new Ollama({
  host: config.ollama.host,
});

export async function executePrompt(prompt: string): Promise<ParsedContent> {
  try {
    const response = await ollama.chat({
      model: config.ollama.model as string,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
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
    return parsedContent;
  } catch (error) {
    console.error("Error executing prompt with Ollama:", error);
    throw error;
  }
}
