import chai from "chai";
import { splitInLines } from "../../src/utils/utils";

suite("Split text in lines", () => {
  test("Single line text", () => {
    const text = "Single line text";
    const lines = splitInLines(text);

    chai.assert.equal(lines.length, 1);
    chai.assert.equal(lines[0], text);
  });

  test("Multi line text", () => {
    const originalLines = ["Test a Multi\n", "Line\n", "Text"];
    const text = originalLines.join("");

    const lines = splitInLines(text);

    chai.assert.equal(lines.length, originalLines.length);
    chai.assert.deepEqual(lines, originalLines);
  });

  test("Multi line text with empty lines", () => {
    const originalLines = [
      "\n",
      "Test a Multi\n",
      "\n",
      "\n",
      "Line\n",
      "Text\n",
      "\n",
    ];
    const text = originalLines.join("");

    const lines = splitInLines(text);

    chai.assert.equal(lines.length, originalLines.length);
    chai.assert.deepEqual(lines, originalLines);
  });
});
