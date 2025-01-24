const openai = require("../models/openai.js");
const utils = require("../utils.js");
const axios = require("axios");
const path = require("path");
const fs = require("fs").promises;

module.exports = {
  async execute(action) {
    try {
      const currentDir = utils.getCurrentDir();
      const filePath = path.join(currentDir, action.fileNamePath);
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });

      // Must use dall-e-2 for 256x256 and 512x512
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: action.prompt,
        n: 1,
        size: action.size,
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      await fs.writeFile(filePath, imageResponse.data);
      console.log(`Created image: ${filePath}`);
    } catch (error) {
      console.error(`Error creating image ${action.fileNamePath}:`, error);
    }
  },
  promptActionDefinition: `
    // Action type: Create image
    {
      type: "create-image",
      fileNamePath: string,
      prompt: string
      size: enum string, any of: '256x256', '512x512', '1024x1024'
    }
  `,
};
