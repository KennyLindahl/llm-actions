const path = require("path");
const dotenv = require("dotenv");
const scriptDir = __dirname;
const envPath = path.join(scriptDir, "../.env");

dotenv.config({ path: envPath });

const { OpenAI } = require("openai");

module.exports = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
