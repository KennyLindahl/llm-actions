const openai = require("./openai.js");
const ollama = require("./ollama.js");
const { config } = require("../config.js");

const models = {
  ollama,
  openai,
};

// TODO: This needs to work differently when used as a package (CLI should still work)
const defaultProvider = models[config.deafultProvider];

module.exports = {
  executePrompt: defaultProvider.executePrompt,
};
