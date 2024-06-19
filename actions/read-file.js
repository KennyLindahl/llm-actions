const utils = require("../utils.js");
const path = require("path");
const fs = require("fs").promises;

module.exports = {
  async execute(action) {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const fileContents = await fs.readFile(filePath, "utf8");
      console.log(`Read file: ${filePath}`);
      return fileContents;
    } catch (error) {
      console.error(`Error reading file ${action.fileNamePath}:`, error);
    }
  },
  promptActionDefinition: `
    // Action type: Read file
    {
      type: “read-file”,
      fileNamePath: string
    }
  `,
};
