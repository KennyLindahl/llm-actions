import * as openai from "./openai.js";
import * as ollama from "./ollama.js";
import { config } from "../config.js";

export const SYSTEM_PROMPT = `Always exclusively always answer in in JSON format:
{
  plan: [{
    step: number,
    description: string,
    currentStep: boolean,
  }],
  actions: [Actions here]
}
`;

export type Plan = {
  step: number;
  description: string;
  currentStep: boolean;
};

export type ParsedContent = {
  actions?: unknown[];
  plan?: Plan[];
};

export type ModelProvider = {
  executePrompt: (prompt: string) => Promise<any>;
};

const models: Record<string, ModelProvider> = {
  ollama,
  openai,
};

// TODO: Create a type which providers need to match when creating own provider
// TODO: This needs to work differently when used as a package (CLI should still work)
const defaultProvider = models[config.deafultProvider];

export const executePrompt = defaultProvider.executePrompt;
