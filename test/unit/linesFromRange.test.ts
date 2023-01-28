import chai from "chai";
import fs = require("fs-extra");
import path = require("path");
import { Range } from "vscode";
import { linesFromRange } from "../../src/utils/utils";

suite("Get lines of text from range", () => {
  test("Get inline target", () => {
    const target = "rgb(255,255,0)";

    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor ${target} incididunt 
    ut labore`;

    const range = {
      start: { line: 1, character: 19 },
      end: { line: 1, character: 33 },
    } as Range;

    const targetObtained = linesFromRange(text, range).join("\n");
    chai.assert.equal(targetObtained, target);
  });

  test("Get multiline target", () => {
    const multilineTarget = `rgb(
        255,
        255,
        0
    )`;

    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor ${multilineTarget} incididunt 
    ut labore`;

    const range = {
      start: { line: 1, character: 19 },
      end: { line: 5, character: 5 },
    } as Range;

    const targetObtained = linesFromRange(text, range).join("\n");
    chai.assert.equal(targetObtained, multilineTarget);
  });
});
