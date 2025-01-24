const { execSync } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const { config } = require("./config");

function getCurrentDir() {
  try {
    const pwd = execSync("pwd").toString().trim();
    return pwd;
  } catch (error) {
    console.error("Error retrieving current directory:", error);
    process.exit(1);
  }
}

async function readDirectoryString(dirPath) {
  const dirStructure = await readDirectoryRecursive(dirPath);

  function formatDirectoryStructure(structure, indent = "") {
    let result = "";

    for (let i = 0; i < structure.length; i++) {
      const item = structure[i];
      const isLast = i === structure.length - 1;
      const prefix = isLast ? "└── " : "├── ";
      const nextIndent = indent + (isLast ? "    " : "│   ");

      if (typeof item === "string") {
        result += `${indent}${prefix}${item}\n`;
      } else if (typeof item === "object") {
        const folderName = Object.keys(item)[0];
        result += `${indent}${prefix}${folderName}\n`;
        result += formatDirectoryStructure(item[folderName], nextIndent);
      }
    }

    return result;
  }

  return formatDirectoryStructure(dirStructure);
}

async function readDirectoryRecursive(
  dirPath,
  ignorePaths = config.ignorePaths,
) {
  const result = [];

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      const relativePath = path.relative(dirPath, itemPath);

      if (ignorePaths.some((ignorePath) => relativePath.includes(ignorePath))) {
        continue;
      }

      if (item.isDirectory()) {
        const subDirStructure = await readDirectoryRecursive(
          itemPath,
          ignorePaths,
        );
        result.push({ [item.name]: subDirStructure });
      } else {
        result.push(item.name);
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }

  return result;
}

module.exports = {
  getCurrentDir,
  readDirectoryString,
};
