const utils = require("../utils.js");
const path = require("path");
const fs = require("fs").promises;

module.exports = {
  async execute(action) {
    try {
      const currentDir = utils.getCurrentDir();
      const directoryPath = path.join(currentDir, action.path);
      await fs.mkdir(directoryPath, { recursive: true });
      console.log(`Created directory: ${directoryPath}`);
    } catch (error) {
      console.error(`Error creating directory ${action.path}:`, error);
    }
  },
  promptActionDefinition: `
    // Action type: Create directory
    {
      type: “create-directory”,
      path: string
    }
  `,
};
