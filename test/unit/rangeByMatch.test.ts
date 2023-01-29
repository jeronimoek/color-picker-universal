import chai from "chai";
import { rangeByMatch } from "../../src/utils/utils";

suite("Get range from match", () => {
  const positions = [0, 5] as const;
  const lines = [0, 5] as const;

  test("Single line text", () => {
    const text = "Single line text";
    for (const position of positions) {
      for (const line of lines) {
        const range = rangeByMatch(line, position, text);
        chai.assert.equal(range.start.line, line);
        chai.assert.equal(range.end.line, line);
        chai.assert.equal(range.start.character, position);
        chai.assert.equal(range.end.character, position + text.length);
      }
    }
  });

  test("Multi line text", () => {
    const textLines = ["Multi", "Line", "Text"];
    const text = textLines.join("\n");

    for (const position of positions) {
      for (const line of lines) {
        const range = rangeByMatch(line, position, text);
        chai.assert.equal(range.start.line, line);
        chai.assert.equal(range.end.line, line + textLines.length - 1);
        chai.assert.equal(range.start.character, position);
        chai.assert.equal(
          range.end.character,
          textLines[textLines.length - 1].length
        );
      }
    }
  });
});
