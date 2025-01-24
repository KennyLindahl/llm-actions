const openai = require("./openai.js");
const ollama = require("./ollama.js");

const chosenModel = ollama;

module.exports = {
  executePrompt: chosenModel.executePrompt,
};
