import * as dotenv from "dotenv";
import * as path from "path";

const scriptDir = __dirname;
const envPath = path.join(scriptDir, "../.env");

dotenv.config({ path: envPath });

type OpenAiConfig = {
  apiKey?: string;
  model?: string;
  imageModel: string;
};

type OllamaConfig = {
  host?: string;
  model?: string;
};

type AppConfig = {
  openAi: OpenAiConfig;
  ollama: OllamaConfig;
  deafultProvider: string;
  ignorePaths: string[];
};

export const config: AppConfig = {
  openAi: {
    apiKey: process.env.CLI_OPENAI_API_KEY,
    model: process.env.CLI_OPENAI_MODEL || "gpt-4o",
    imageModel: process.env.CLI_OPENAI_IMAGE_MODEL || "dall-e-2",
  },
  ollama: {
    host: process.env.CLI_OLLAMA_HOST,
    model: process.env.CLI_OLLAMA_MODEL,
  },
  deafultProvider: process.env.CLI_DEFAULT_PROVIDER || "openai",
  ignorePaths: [
    "node_modules",
    "venv",
    ".git",
    ".next",
    ".nuxt",
    ".vercel",
    ".output",
    "dist",
    "build",
    "coverage",
    "logs",
    "tmp",
    "temp",
    "cache",
  ],
};
