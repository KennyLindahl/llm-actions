import * as openai from "./openai.js";
import * as ollama from "./ollama.js";
import { config } from "../config.js";

type ModelProvider = {
  executePrompt: (prompt: string) => Promise<any>;
};

const models: Record<string, ModelProvider> = {
  ollama,
  openai,
};

// TODO: This needs to work differently when used as a package (CLI should still work)
const defaultProvider = models[config.deafultProvider];

export const executePrompt = defaultProvider.executePrompt;
