import chai from "chai";
import { hwbToRgb } from "../../src/utils/helpers";

suite("Translate HWB into RGB", () => {
  test("HWB into RGB", () => {
    const black = hwbToRgb([0, 0, 0]);
    chai.assert.deepEqual(black, [255, 0, 0]);

    const grass = hwbToRgb([70, 30, 20]);
    chai.assert.deepEqual(grass, [183, 204, 77]);

    const white = hwbToRgb([0, 100, 0]);
    chai.assert.deepEqual(white, [255, 255, 255]);
  });

  test("HWBA into RGBA", () => {
    const black = hwbToRgb([0, 0, 0, 1]);
    chai.assert.deepEqual(black, [255, 0, 0, 1]);

    const grass = hwbToRgb([70, 30, 20, 1]);
    chai.assert.deepEqual(grass, [183, 204, 77, 1]);

    const white = hwbToRgb([0, 100, 0, 1]);
    chai.assert.deepEqual(white, [255, 255, 255, 1]);

    const purpleTransparent = hwbToRgb([274, 10, 22, 0.4]);
    chai.assert.deepEqual(purpleTransparent, [124, 26, 199, 0.4]);
  });
});
