import * as vscode from "vscode";
import { colorFormatsFromPrefixes } from "./../shared/constants";
import { ColorTranslator } from "colortranslator";
import { NamedColors } from "../shared/constants";
import { ColorFormatFrom, ColorFormatTo } from "./enums";
import { PartialBy } from "./utils";

interface HWBA {
  h: number;
  w: number;
  b: number;
  a: number;
}

interface HWBAInput extends PartialBy<HWBA, "a"> {}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface RGBAInput extends PartialBy<RGBA, "a"> {}

export function matchColors(text: string) {
  const formatsFrom = vscode.workspace
    .getConfiguration("color-picker-universal")
    .get<string[]>("formatsFrom");

  const formatsToJoin: string[] = [];

  const includeAll = !formatsFrom?.length || formatsFrom?.includes("*");

  if (includeAll || formatsFrom?.includes(ColorFormatFrom.NAMED)) {
    const namedColors = Object.keys(NamedColors).join("|");
    formatsToJoin.push(`(?:${namedColors})`);
  }

  if (includeAll || formatsFrom?.includes(ColorFormatFrom.HEX)) {
    formatsToJoin.push("#(?:[\\da-f]{3,4}){2}|#(?:[\\da-f]{3,4})");
  }

  const filteredFormatPrefixes = filterFormats<ColorFormatFrom>(
    colorFormatsFromPrefixes,
    formatsFrom?.length ? formatsFrom : ["*"]
  );

  if (filteredFormatPrefixes.length) {
    formatsToJoin.push(
      `(?:${filteredFormatPrefixes.join("|")})\\([\\s\\d%,.\\/]+\\)`
    );
  }

  const formatsJoined = formatsToJoin.join("|");

  const regex = new RegExp(`(?<![\\w-])(${formatsJoined})(?![\\w-])`, "gi");
  const matches = [...text.matchAll(regex)];

  return matches;
}

export function parseColorString(colorRaw: string) {
  try {
    let r, g, b, a;
    if (colorRaw.startsWith(ColorFormatFrom.HWB)) {
      const values = colorRaw
        .split(ColorFormatFrom.HWB + "(")[1]
        .split(/[^\w%\.]+/);
      const hwbValues = values.map((v) => parseInt(v));
      const [hue, white, black] = hwbValues;
      let alpha = 1;
      if (hwbValues[3] || hwbValues[3] === 0) {
        alpha = hwbValues[3];
      }
      ({ r, g, b, a } = hwbToRgb({
        h: hue,
        w: white,
        b: black,
        a: alpha,
      }));
    } else {
      const color = new ColorTranslator(colorRaw);
      ({ R: r, G: g, B: b } = color);
      ({ a = 1 } = color.RGBAObject);
    }

    return new vscode.Color(r / 255, g / 255, b / 255, a || 1);
  } catch (error) {
    return null;
  }
}

export function filterFormats<T extends ColorFormatTo | ColorFormatFrom>(
  formats: T[],
  formatsAllowed: string[]
) {
  if (formatsAllowed.includes("*")) return formats;

  const filteredFormats = formats.filter((format) => {
    let idFormat: string = format;
    if (format.slice(-1).toLocaleLowerCase() === "a") {
      idFormat = format.slice(0, -1);
    }
    return formatsAllowed.includes(idFormat);
  });
  return filteredFormats;
}

export function isValidDocument(
  config: vscode.WorkspaceConfiguration,
  { languageId }: vscode.TextDocument
) {
  let isValid = false;

  if (!config.enable) {
    return isValid;
  }

  if (config.languages.indexOf("*") > -1) {
    isValid = true;
  }
  if (config.languages.indexOf(languageId) > -1) {
    isValid = true;
  }
  if (config.languages.indexOf(`!${languageId}`) > -1) {
    isValid = false;
  }

  return isValid;
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

export function rgbToHwbString(rgb: RGBAInput) {
  const { h, w, b, a } = rgbToHwb(rgb);
  if (rgb.a !== undefined) {
    return `hwb(${h},${w}%,${b}%,${a})`;
  }
  return `hwb(${h},${w}%,${b}%)`;
}
