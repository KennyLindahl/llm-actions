import {
  createDirectory,
  CreateDirectoryActionEvent,
} from "./create-directory";
import { writeFile, type WriteFileActionEvent } from "./write-file";
import { createImage, type CreateImageActionEvent } from "./create-image";
import {
  readFile,
  ReadFileActioEventReturn,
  type ReadFileActionEvent,
} from "./read-file";
import { config } from "../config";

export type ActionEvent =
  | CreateDirectoryActionEvent
  | WriteFileActionEvent
  | CreateImageActionEvent
  | ReadFileActionEvent;

type BaseAction = {
  type: string;
};

export type ActionDefinition<
  Action extends BaseAction = ActionEvent,
  ActionReturn = void,
> = {
  type: Action["type"];
  execute: (action: Action) => Promise<ActionReturn>;
  promptActionDefinition: string;
};

export type Action =
  | ActionDefinition
  | ActionDefinition<CreateDirectoryActionEvent>
  | ActionDefinition<WriteFileActionEvent>
  | ActionDefinition<CreateImageActionEvent>
  | ActionDefinition<ReadFileActionEvent, ReadFileActioEventReturn>;

export const actions: Record<string, Action> = {
  createDirectory,
  writeFile,
  readFile,
  ...(createImage ? { createImage } : {}),
};
