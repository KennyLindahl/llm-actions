import { config } from "../config";
import OpenAI from "openai";
import { ParsedContent, SYSTEM_PROMPT } from ".";

export const openai = new OpenAI({
  apiKey: config.openAi.apiKey,
});

export async function executePrompt(prompt: string): Promise<ParsedContent> {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        { role: "user", content: prompt },
      ],
      model: config.openAi.model as string,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsedContent: ParsedContent = JSON.parse(content ?? "{}");
    return parsedContent;
  } catch (error) {
    console.error("Error executing prompt with OpenAI:", error);
    throw error;
  }
}
