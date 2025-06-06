import * as path from "path";
import { promises as fs } from "fs";
import * as utils from "../utils.js";
import { ActionDefinition } from "./index.js";

export type CreateDirectoryActionEvent = {
  type: "create-directory";
  path: string;
};

export const createDirectory: ActionDefinition<CreateDirectoryActionEvent> = {
  type: "create-directory",
  async execute(action: CreateDirectoryActionEvent): Promise<void> {
    try {
      const currentDir = utils.getCurrentDir();
      const directoryPath = path.join(currentDir, action.path);
      await fs.mkdir(directoryPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${action.path}:`, error);
    }
  },

  // Could be done with Zod to:
  // - Generate TS type
  // - Turn into string for below
  promptActionDefinition: `
    // Action type: Create directory
    {
      type: "create-directory",
      path: string
    }
  `,
};
