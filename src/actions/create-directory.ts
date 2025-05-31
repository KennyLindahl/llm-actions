import * as path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils.js";
import { ActionDefinition } from "./index.js";

export type CreateDirectoryActionEvent = {
  type: "create-directory";
  path: string;
};

export const createDirectory: ActionDefinition<CreateDirectoryActionEvent> = {
  async execute(action: CreateDirectoryActionEvent): Promise<void> {
    try {
      const currentDir = utils.getCurrentDir();
      const directoryPath = path.join(currentDir, action.path);
      await fs.mkdir(directoryPath, { recursive: true });
      console.log(`Created directory: ${directoryPath}`);
    } catch (error) {
      console.error(`Error creating directory ${action.path}:`, error);
    }
  },

  promptActionDefinition: `
    // Action type: Create directory
    {
      type: "create-directory",
      path: string
    }
  `,
};
