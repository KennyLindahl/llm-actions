const { execSync } = require("child_process");

function getCurrentDir() {
  try {
    const pwd = execSync("pwd").toString().trim();
    return pwd;
  } catch (error) {
    console.error("Error retrieving current directory:", error);
    process.exit(1);
  }
}

module.exports = {
  getCurrentDir,
};
