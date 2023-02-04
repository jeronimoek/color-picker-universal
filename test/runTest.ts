import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  // The folder containing the Extension Manifest package.json
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");

  let failed = false;

  const version = process.env.VSCODE_VERSION || undefined;

  try {
    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, "./index");

    // Download VS Code, unzip it and run the tests
    await runTests({
      version,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ["--disable-extensions"],
    });
  } catch (err) {
    console.error("Failed to run tests" + err);
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }
}

main();
