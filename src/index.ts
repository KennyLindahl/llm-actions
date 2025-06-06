import {
  type Action,
  type ActionEvent,
  actions as defaultActions,
} from "./actions";
import { ModelProvider } from "./models";
import * as utils from "./utils";
import { executePrompt } from "./models/index";

type LlmActionsOptions = {
  // We need to accept array of
  // - Any of the default actions
  // - Custom actions: ActionDefinition<{type: string}> should at least have type in the action
  // actions?: Partial<typeof defaultActions>;
  // -----------------------------------------
  // TODO: DO we really need this to be optional?
  actions?: Action[];
};

export type PromptReturnValue = {
  userInput: string;
  actionEvents: ActionEvent[];
  actionReturnValues: {
    type: string;
    returnValue: Promise<any>;
  }[];
  instance: LlmActions;
};

export const actions = defaultActions;

export class LlmActions {
  private actions: Action[];
  executePrompt: ModelProvider["executePrompt"];
  private eventCallbacks: ((
    event: ActionEvent,
    returnValue: Promise<any>,
  ) => void)[] = [];

  constructor(options: LlmActionsOptions = {}) {
    this.actions = options.actions || Object.values(defaultActions);
    // Todo: provider should be passed in the constructor
    this.executePrompt = executePrompt;
  }

  onEvent(callback: (event: ActionEvent) => void) {
    this.eventCallbacks.push(callback);
  }

  private emit(event: ActionEvent, returnValue: Promise<any>) {
    for (const cb of this.eventCallbacks) {
      cb(event, returnValue);
    }
  }

  // Was private (remove comment if we dont need it to be private)
  async getPrompt(userInput: string): Promise<string> {
    const currentDirectory = utils.getCurrentDir();
    const directoryTree = await utils.readDirectoryString(currentDirectory);

    const actionDefinitions = Object.values(this.actions)
      .map((action) => `${action.promptActionDefinition}\n`)
      .join("");

    return `
Based on this query:
"${userInput}"

Action definitions (YOU MUST ALWAYS choose either read-file or create-file per fileNamePath)
${actionDefinitions}

Output this format:
{actions: [Actions here]}

This is the current directory structure:
${directoryTree}
    `;
  }

  // Was private (remove comment if we dont need it to be private)
  async executeActions(actionEvents: ActionEvent[]) {
    const returnData = [];

    for (const event of actionEvents) {
      const action = Object.values(this.actions).find(
        (actionItem) => actionItem.type === event.type,
      );

      if (action && event) {
        // TODO: 'event as any' should be resolved below
        const actionReturnValue = action.execute(event as any);
        this.emit(event, actionReturnValue);
        returnData.push({
          type: action.type,
          returnValue: actionReturnValue as Promise<any>,
        });
      }
    }

    return returnData;
  }

  // Most of prompt() should be defined as a flow, which should be possible to:
  // - Use as is
  // - Override (people define their own flows)
  async prompt(userInput: string): Promise<PromptReturnValue> {
    const prompt = await this.getPrompt(userInput);
    const actionEvents = await executePrompt(prompt);
    const actionReturnValues = await this.executeActions(actionEvents);
    return { userInput, actionEvents, actionReturnValues, instance: this };
  }
}
