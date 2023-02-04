import chai from "chai";
import { hwbToRgb, rgbToHwb } from "../../src/utils/helpers";

suite("Translate HWB to RGB", () => {
  test("HWB to RGB", () => {
    const black = hwbToRgb({ h: 0, w: 0, b: 0 });
    chai.assert.deepEqual(black, { r: 255, g: 0, b: 0, a: 1 });

    const white = hwbToRgb({ h: 0, w: 100, b: 0 });
    chai.assert.deepEqual(white, { r: 255, g: 255, b: 255, a: 1 });

    const grass = hwbToRgb({ h: 70, w: 30, b: 20 });
    chai.assert.deepEqual(grass, { r: 183, g: 204, b: 77, a: 1 });
  });

  test("HWBA to RGBA", () => {
    const black = hwbToRgb({ h: 0, w: 0, b: 0, a: 1 });
    chai.assert.deepEqual(black, { r: 255, g: 0, b: 0, a: 1 });

    const white = hwbToRgb({ h: 0, w: 100, b: 0, a: 1 });
    chai.assert.deepEqual(white, { r: 255, g: 255, b: 255, a: 1 });

    const grass = hwbToRgb({ h: 70, w: 30, b: 20, a: 1 });
    chai.assert.deepEqual(grass, { r: 183, g: 204, b: 77, a: 1 });

    const purpleTransparent = hwbToRgb({ h: 274, w: 10, b: 22, a: 0.4 });
    chai.assert.deepEqual(purpleTransparent, { r: 124, g: 26, b: 199, a: 0.4 });
  });
});

suite("Translate RGB to HWB", () => {
  test("RGB to HWB", () => {
    const black = rgbToHwb({ r: 255, g: 0, b: 0 });
    chai.assert.deepEqual(black, { h: 0, w: 0, b: 0, a: 1 });

    const white = rgbToHwb({ r: 255, g: 255, b: 255 });
    chai.assert.deepEqual(white, { h: 0, w: 100, b: 0, a: 1 });

    const grass = rgbToHwb({ r: 183, g: 204, b: 77 });
    chai.assert.deepEqual(grass, { h: 70, w: 30, b: 20, a: 1 });
  });

  test("RGBA to HWBA", () => {
    const black = rgbToHwb({ r: 255, g: 0, b: 0, a: 1 });
    chai.assert.deepEqual(black, { h: 0, w: 0, b: 0, a: 1 });

    const white = rgbToHwb({ r: 255, g: 255, b: 255, a: 1 });
    chai.assert.deepEqual(white, { h: 0, w: 100, b: 0, a: 1 });

    const grass = rgbToHwb({ r: 183, g: 204, b: 77, a: 1 });
    chai.assert.deepEqual(grass, { h: 70, w: 30, b: 20, a: 1 });

    const purpleTransparent = rgbToHwb({ r: 124, g: 26, b: 199, a: 0.4 });
    chai.assert.deepEqual(purpleTransparent, { h: 274, w: 10, b: 22, a: 0.4 });
  });
});
