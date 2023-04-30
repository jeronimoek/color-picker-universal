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

      chai.assert.equal(matches.length, 28);

      const rgbMultilineRange = matches[11].range;
      chai.assert.equal(rgbMultilineRange.start.line, 20);
      chai.assert.equal(rgbMultilineRange.start.character, 0);
      chai.assert.equal(rgbMultilineRange.end.line, 24);
      chai.assert.equal(rgbMultilineRange.end.character, 1);

      const multiLineMatches = matches.filter(
        (match) => match.range.start.line < match.range.end.line
      );
      chai.assert.equal(multiLineMatches.length, 6);

      matches.forEach((match) => {
        chai.assert.deepEqual(match.color, colorsRGBAValues[color]);
      });
    }
  });
});
