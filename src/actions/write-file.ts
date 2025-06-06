import path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils";
import { ActionDefinition } from ".";

export type WriteFileActionEvent = {
  type: "write-file";
  fileContents: string;
  fileNamePath: string;
};

export const writeFile: ActionDefinition<WriteFileActionEvent> = {
  type: "write-file",
  async execute(action: WriteFileActionEvent): Promise<void> {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, action.fileContents);
    } catch (error) {
      console.error(`Error creating file ${action.fileNamePath}:`, error);
    }
  },

  promptActionDefinition: `
    // Action type: Write file (use when creating or updating a file)
    // Note: NEVER write to an existing file unless you have read the file contents first
    {
      type: "write-file",
      fileContents: string,
      fileNamePath: string
    }
  `,
};
