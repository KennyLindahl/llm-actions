import * as path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils";
import { ActionDefinition } from ".";

export type ReadFileActionEvent = {
  type: "read-file";
  fileNamePath: string;
};

export type FileContent = {
  fileNamePath: string;
  contents: string;
};

export type ReadFileActioEventReturn = FileContent | undefined;

export const readFile: ActionDefinition<
  ReadFileActionEvent,
  ReadFileActioEventReturn
> = {
  type: "read-file",
  async execute(action: ReadFileActionEvent): Promise<FileContent | undefined> {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const contents = await fs.readFile(filePath, "utf8");

      return {
        fileNamePath: action.fileNamePath,
        contents,
      };
    } catch (error) {
      console.error(`Error reading file ${action.fileNamePath}:`, error);
    }
  },

  promptActionDefinition: `
    // Action type: Read file
    // Note: Always use this action first if you want to write to an existing file
    {
      type: "read-file",
      fileNamePath: string
    }
  `,
};
