import path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils";
import { ActionDefinition } from ".";

export type CreateFileActionEvent = {
  type: "create-file";
  fileContents: string;
  fileNamePath: string;
};

export const createFile: ActionDefinition<CreateFileActionEvent> = {
  async execute(action: CreateFileActionEvent): Promise<void> {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, action.fileContents);
      console.log(`Created file: ${filePath}`);
    } catch (error) {
      console.error(`Error creating file ${action.fileNamePath}:`, error);
    }
  },

  promptActionDefinition: `
    // Action type: Create file
    {
      type: "create-file",
      fileContents: string,
      fileNamePath: string
    }
  `,
};
