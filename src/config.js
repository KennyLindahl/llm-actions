const dotenv = require("dotenv");
const path = require("path");
const scriptDir = __dirname;
const envPath = path.join(scriptDir, "../.env");

dotenv.config({ path: envPath });

const config = {
  openAi: {
    apiKey: process.env.CLI_OPENAI_API_KEY,
    model: process.env.CLI_OPENAI_MODEL,
    imageModel: process.env.CLI_OPENAI_IMAGE_MODEL || "dall-e-2",
  },
  ollama: {
    host: process.env.CLI_OLLAMA_HOST,
    model: process.env.CLI_OLLAMA_MODEL,
  },
  deafultProvider: process.env.CLI_DEFAULT_PROVIDER,
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

module.exports = {
  config,
};
