import {
  createDirectory,
  CreateDirectoryActionEvent,
} from "./create-directory";
import { createFile, type CreateFileActionEvent } from "./create-file";
import { createImage, type CreateImageActionEvent } from "./create-image";
import {
  readFile,
  ReadFileActioEventReturn,
  type ReadFileActionEvent,
} from "./read-file";
import { config } from "../config";

export type ActionEvent =
  | CreateDirectoryActionEvent
  | CreateFileActionEvent
  | CreateImageActionEvent
  | ReadFileActionEvent;

export type ActionDefinition<Action = ActionEvent, ActionReturn = void> = {
  execute: (action: Action) => Promise<ActionReturn>;
  promptActionDefinition: string;
};

type Actions = {
  createDirectory: ActionDefinition<CreateDirectoryActionEvent>;
  createFile: ActionDefinition<CreateFileActionEvent>;
  createImage?: ActionDefinition<CreateImageActionEvent>;
  readFile: ActionDefinition<ReadFileActionEvent, ReadFileActioEventReturn>;
};

export const actions: Actions = {
  createDirectory,
  createFile,
  readFile,
  ...(config.openAi.apiKey && config.openAi.imageModel ? { createImage } : {}),
};

