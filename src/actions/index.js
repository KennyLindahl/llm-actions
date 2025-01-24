const createDirectory = require("./create-directory");
const createFile = require("./create-file");
const createImage = require("./create-image");
const readFile = require("./read-file");
const { config } = require("../config");

module.exports = {
  createDirectory,
  createFile,
  ...(config.openAi.apiKey && config.openAi.imageModel ? { createImage } : {}),
  readFile,
};
