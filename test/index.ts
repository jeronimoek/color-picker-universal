import glob from "glob";
import Mocha from "mocha";
import * as path from "path";
export function run(): Promise<void> {
  const options: Mocha.MochaOptions = {
    grep: process.env.MOCHA_GREP,
    ui: "tdd",
  };
  if (process.env.MOCHA_TIMEOUT) {
    options.timeout = Number(process.env.MOCHA_TIMEOUT);
  }
  const mocha = new Mocha(options);

  // @types/mocha is outdated
  (mocha as any).color(true);

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    glob("**/*.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        e(err);
      }
    });
  });
}
