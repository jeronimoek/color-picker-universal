import { colorsRGBAValues, TestedColors } from "./../../src/shared/constants";
import chai from "chai";
import fs = require("fs-extra");
import path = require("path");
import { getMatches } from "../../src/getMatches";
import { colorsFragments } from "../../src/shared/constants";
import { templateReplace } from "../../src/utils/utils";

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

  test("Matches all colors in ts file", () => {
    const testedColors = Object.values(TestedColors);
    testedColors.forEach((color) => {
      const colorFormatsText = templateReplace(
        colorFormatsFile,
        colorsFragments[color]
      );
      const matches = getMatches(colorFormatsText);

      /* Assertions */

      chai.assert.equal(matches.length, 26);

      const multiLineMatches = matches.filter(
        (match) => match.range.start.line < match.range.end.line
      );
      chai.assert.equal(multiLineMatches.length, 6);

      matches.forEach((match) => {
        chai.assert.deepEqual(match.color, colorsRGBAValues[color]);
      });
    });
  });
});
