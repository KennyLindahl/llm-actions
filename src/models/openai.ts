import { config } from "../config";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: config.openAi.apiKey,
});

type Action = {
  [key: string]: any;
};

export async function executePrompt(prompt: string): Promise<Action[]> {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Answer in json format",
        },
        { role: "user", content: prompt },
      ],
      model: config.openAi.model as string,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content ?? "{}").actions;

    return Array.isArray(parsedContent) ? parsedContent : [parsedContent];
  } catch (error) {
    console.error("Error executing prompt with OpenAI:", error);
    throw error;
  }
}
