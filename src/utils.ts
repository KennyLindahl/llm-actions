import { execSync } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { config } from "./config";

function getCurrentDir(): string {
  try {
    const pwd = execSync("pwd").toString().trim();
    return pwd;
  } catch (error) {
    console.error("Error retrieving current directory:", error);
    process.exit(1);
  }
}

/**
 * Reads a directory and returns a formatted tree string
 */
export async function readDirectoryString(dirPath: string): Promise<string> {
  const dirStructure = await readDirectoryRecursive(dirPath);

  function formatDirectoryStructure(
    structure: DirectoryStructure,
    indent = "",
  ): string {
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

/**
 * A directory structure item can be a filename (string) or an object with a folder name as key and its contents as value
 */
type DirectoryStructureItem =
  | string
  | { [folderName: string]: DirectoryStructure };
type DirectoryStructure = DirectoryStructureItem[];

/**
 * Recursively reads a directory into a nested structure
 */
async function readDirectoryRecursive(
  dirPath: string,
  ignorePaths: string[] = config.ignorePaths,
): Promise<DirectoryStructure> {
  const result: DirectoryStructure = [];

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

export { getCurrentDir };
