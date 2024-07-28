import { colorsRGBAValues, TestedColors } from "./../../src/shared/constants";
import chai from "chai";
import fs = require("fs-extra");
import path = require("path");
import { getMatches } from "../../src/getMatches";
import { colorsFragments } from "../../src/shared/constants";
import { templateReplace } from "../../src/utils/utils";
import * as vscode from "vscode";

suite("Match colors tests", () => {
  let colorFormatsFile: string;

  setup(function (done) {
    fs.readFile(
      path.join(__dirname, "../../../test/dummyData/colorFormats.ts"),
      "utf8",
      function (err, fileContents) {
        if (err) throw err;
        colorFormatsFile = fileContents;
        done();
      }
    );
  });

  test("Matches all colors in ts file", async () => {
    const testedColors = Object.values(TestedColors);

    /* TODO: test for exclusion of variable names
     * const testPathUri = vscode.Uri.file(
     *   path.join(__dirname, "../dummyData/colorFormats.js")
     * );
     * await vscode.window.showTextDocument(testPathUri, { preview: false });
     */

    for (const color of testedColors) {
      const colorFormatsText = templateReplace(
        colorFormatsFile,
        colorsFragments[color]
      );
      const matches = await getMatches(colorFormatsText);

      /* Assertions */

      chai.assert.equal(matches.length, 22);

      matches.forEach((match) => {
        const matchColor = { ...match.color };
        let key: keyof typeof matchColor;
        for (key in matchColor) {
          matchColor[key] = Math.abs(Math.round(matchColor[key]));
        }
        chai.assert.deepEqual(matchColor, colorsRGBAValues[color]);
      });
    }
  });
});
