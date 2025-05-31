import * as path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils";
import { ActionDefinition } from ".";

export type ReadFileActionEvent = {
  type: "read-file";
  fileNamePath: string;
};

export type ReadFileActioEventReturn = string | undefined;

export const readFile: ActionDefinition<
  ReadFileActionEvent,
  ReadFileActioEventReturn
> = {
  async execute(action: ReadFileActionEvent): Promise<string | undefined> {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const fileContents = await fs.readFile(filePath, "utf8");
      console.log(`Read file: ${filePath}`);
      return fileContents;
    } catch (error) {
      console.error(`Error reading file ${action.fileNamePath}:`, error);
    }
  },

  promptActionDefinition: `
    // Action type: Read file
    {
      type: "read-file",
      fileNamePath: string
    }
  `,
};
