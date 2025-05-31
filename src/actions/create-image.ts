import path from "path";
import axios from "axios";
import { promises as fs } from "fs";
import { openai } from "../models/openai";
import { config } from "../config";
import * as utils from "../utils";
import OpenAI from "openai";

// Infer ImageSize type directly from the OpenAI SDK
type ImageSize = Parameters<OpenAI["images"]["generate"]>[0]["size"];

// Define the structure of the action payload
export type CreateImageActionEvent = {
  type: "create-image";
  fileNamePath: string;
  prompt: string;
  size: ImageSize;
};

// Define the module as a named export for cleaner imports elsewhere
export const createImage = {
  async execute(action: CreateImageActionEvent): Promise<void> {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const dirPath = path.dirname(filePath);

      await fs.mkdir(dirPath, { recursive: true });

      const response = await openai.images.generate({
        model: config.openAi.imageModel,
        prompt: action.prompt,
        n: 1,
        size: action.size,
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        throw new Error("Image URL not returned by OpenAI.");
      }

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      await fs.writeFile(filePath, imageResponse.data);
      console.log(`Created image: ${filePath}`);
    } catch (error) {
      console.error(`Error creating image ${action.fileNamePath}:`, error);
    }
  },

  // Documentation string, not parsed or enforced — for dev clarity only
  promptActionDefinition: `
    // Action type: Create image
    {
      type: "create-image",
      fileNamePath: string,
      prompt: string,
      size: enum string, any of: '256x256', '512x512', '1024x1024'
    }
  `,
};
