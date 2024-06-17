const utils = require("../utils.js");
const path = require("path");
const fs = require("fs").promises;

module.exports = {
  async execute(action) {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      await fs.writeFile(filePath, action.fileContents);
      console.log(`Created file: ${filePath}`);
    } catch (error) {
      console.error(`Error creating file ${action.fileNamePath}:`, error);
    }
  },
  promptActionDefinition: `
    // Action type: Create file
    {
      type: “create-file”,
      fileContents: string,
      fileNamePath: string
    }
  `,
};
