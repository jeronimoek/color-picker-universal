import * as vscode from "vscode";
import { colorFormatsFromPrefixes } from "./../shared/constants";
import { ColorTranslator } from "colortranslator";
import { NamedColors } from "../shared/constants";
import { ColorFormatFrom, ColorFormatTo } from "./enums";

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
    let R, G, B, a;
    if (colorRaw.startsWith(ColorFormatFrom.HWB)) {
      const values = colorRaw
        .split(ColorFormatFrom.HWB + "(")[1]
        .split(/[^\w%\.]+/);
      [R, G, B, a] = hwbToRgb(values.map((v) => parseInt(v)) as any);
    } else {
      const color = new ColorTranslator(colorRaw);
      ({ R, G, B } = color);
      ({ a = 1 } = color.RGBAObject);
    }

    return new vscode.Color(R / 255, G / 255, B / 255, a || 1);
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

export function hwbToRgb(values: [number, number, number, number?]) {
  const result = hwbToRgbFloat(values);

  // To maintain array type
  result.forEach(
    (value, i) => value && (result[i] = i === 3 ? value : Math.round(value))
  );

  return result;
}

export function hwbToRgbFloat([h, w, b, a]: [
  number,
  number,
  number,
  number?
]): [number, number, number, number?] {
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

  const result = [red * 255, green * 255, blue * 255];
  if (a !== undefined) result.push(a);

  return result as [number, number, number, number?];
}
