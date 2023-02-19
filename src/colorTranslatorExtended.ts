import { ColorTranslator } from "colortranslator";
import { namedColorsLAB } from "./shared/constants";
import { ColorFormatFrom } from "./utils/enums";
import { RGBA } from "./utils/helpers";
import { PartialBy } from "./utils/utils";

interface RGBAInput extends PartialBy<RGBA, "a"> {}

interface HWBA {
  h: number;
  w: number;
  b: number;
  a: number;
}

interface HWBAInput extends PartialBy<HWBA, "a"> {}

export function rgbToHwb({ r, g, b, a = 1 }: RGBAInput): HWBA {
  const result = rgbToHwbFloat({ r, g, b, a });

  let property: keyof typeof result;

  // To maintain array type
  for (property in result) {
    result[property] =
      property === "a" ? result[property] : Math.round(result[property]);
  }

  return result;
}

function rgbToHwbFloat(rgba: RGBA): HWBA {
  const { r, g, b, a } = rgba;
  const h = new ColorTranslator({ r, g, b, a }).HSLObject.h;
  const whiteness = (1 / 255) * Math.min(r, Math.min(g, b));
  const blackness = 1 - (1 / 255) * Math.max(r, Math.max(g, b));

  const result = {
    h,
    w: whiteness * 100,
    b: blackness * 100,
    a: a !== undefined ? a : 1,
  };

  return result;
}

function rgbToHwbString(rgb: RGBAInput) {
  const { h, w, b, a } = rgbToHwb(rgb);
  if (rgb.a !== undefined) {
    return `hwb(${h} ${w}% ${b}% / ${a})`;
  }
  return `hwb(${h} ${w}% ${b}%)`;
}

function rgbToLab(rgb: readonly [number, number, number]) {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;
  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = x > 0.008856 ? x ** 1 / 3 : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? y ** 1 / 3 : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? z ** 1 / 3 : 7.787 * z + 16 / 116;
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)] as const;
}

function deltaE(
  labA: ReturnType<typeof rgbToLab>,
  labB: ReturnType<typeof rgbToLab>
) {
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] ** 2 + labA[2] ** 2);
  let c2 = Math.sqrt(labB[1] ** 2 + labB[2] ** 2);
  let deltaC = c1 - c2;
  let deltaH = deltaA ** 2 + deltaB ** 2 - deltaC ** 2;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / 1.0;
  let deltaCkcsc = deltaC / sc;
  let deltaHkhsh = deltaH / sh;
  let i = deltaLKlsl ** 2 + deltaCkcsc ** 2 + deltaHkhsh ** 2;
  return i < 0 ? 0 : Math.sqrt(i);
}

export function hwbToRgb({ h, w, b, a = 1 }: HWBAInput): RGBA {
  const result = hwbToRgbFloat({ h, w, b, a });

  let property: keyof typeof result;

  for (property in result) {
    result[property] =
      property === "a" ? result[property] : Math.round(result[property]);
  }

  return result;
}

function hwbToRgbFloat(hwba: HWBA): RGBA {
  const { h, w, b, a } = hwba;
  const hue = Number(h) / 360;
  let whiteness = Number(w) / 100;
  let blackness = Number(b) / 100;
  const ratio = whiteness + blackness;

  // whiteness + blackness cant be > 1
  if (ratio > 1) {
    whiteness /= ratio;
    blackness /= ratio;
  }

  const i = Math.floor(6 * hue);
  const v = 1 - blackness;
  let f = 6 * hue - i;
  // tslint:disable-next-line:no-bitwise
  if ((i & 0x01) !== 0) {
    f = 1 - f;
  }
  // linear interpolation
  const n = whiteness + f * (v - whiteness);

  let red = 0;
  let green = 0;
  let blue = 0;

  switch (i) {
    case 6:
    case 0:
      red = v;
      green = n;
      blue = whiteness;
      break;
    case 1:
      red = n;
      green = v;
      blue = whiteness;
      break;
    case 2:
      red = whiteness;
      green = v;
      blue = n;
      break;
    case 3:
      red = whiteness;
      green = n;
      blue = v;
      break;
    case 4:
      red = n;
      green = whiteness;
      blue = v;
      break;
    case 5:
      red = v;
      green = whiteness;
      blue = n;
      break;
    default:
      throw new Error(
        `unproper case ${i} for HWB: ${JSON.stringify({ h, w, b, a })}}`
      );
  }

  const result = {
    r: red * 255,
    g: green * 255,
    b: blue * 255,
    a: a !== undefined ? a : 1,
  };

  return result;
}

export class ColorTranslatorExtended extends ColorTranslator {
  constructor(...input: ConstructorParameters<typeof ColorTranslator>) {
    const colorInput = input[0];
    if (
      typeof colorInput === "string" &&
      colorInput.toLocaleLowerCase().startsWith(ColorFormatFrom.HWB)
    ) {
      const values = colorInput
        .split(ColorFormatFrom.HWB + "(")[1]
        .split(/[^\w%\.]+/);
      const hwbValues = values.map((v) => parseFloat(v));
      const [hue, white, black] = hwbValues;
      let alpha = 1;
      if (hwbValues[3] || hwbValues[3] === 0) {
        alpha = hwbValues[3];
      }
      const rgbInput = hwbToRgb({
        h: hue,
        w: white,
        b: black,
        a: alpha,
      });
      super(rgbInput);
    } else {
      super(...input);
    }
  }

  get HWB(): string {
    return rgbToHwbString(this.RGBObject);
  }

  get HWBA(): string {
    return rgbToHwbString(this.RGBAObject);
  }

  get NAMED(): string {
    const { r, g, b } = this.RGBObject;
    const rgbValues = [r, g, b] as const;

    let minDelta = Number.POSITIVE_INFINITY;
    let closestNamedColor = Object.keys(namedColorsLAB)[0];

    Object.entries(namedColorsLAB).forEach(([namedColor, namedColorLAB]) => {
      const rgbLabValues = rgbToLab(rgbValues);
      const delta = deltaE(rgbLabValues, namedColorLAB);
      if (delta < minDelta) {
        minDelta = delta;
        closestNamedColor = namedColor;
      }
    });

    return closestNamedColor;
  }
}
