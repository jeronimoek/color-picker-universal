import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");

  let failed = false;

  const version = process.env.VSCODE_VERSION || undefined;

  try {
    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, "./index");

    // Download VS Code, unzip it and run the tests
    await runTests({
      version,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        "--disable-extensions",
        // `--user-data-dir=${extensionDevelopmentPath}/.user-data-dir-test`,
        // https://github.com/microsoft/vscode/issues/115794#issuecomment-774283222
        // '--force-disable-user-env'
      ],
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
