import { ColorTranslatorExtended } from "./../colorTranslatorExtended";
import * as vscode from "vscode";
import { colorFormatsFrom, namedColorsRegex } from "./../shared/constants";
import { ColorFormatFrom, ColorFormatTo } from "./enums";
import { isColorFormat, replaceTextInMatch } from "./utils";
import { getMatches } from "../getMatches";
import {
  hexRegex,
  hex0xRegex,
  cmykRegex,
  hslRegex,
  hwbRegex,
  labRegex,
  lchRegex,
  oklabRegex,
  oklchRegex,
  a98Regex,
  rgbRegex,
  Color,
} from "color-translate";

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function matchColors(text: string) {
  const formatsFromSetting = getSetting<string[]>("formatsFrom");

  const formatsFrom = formatsFromSetting?.length ? formatsFromSetting : ["*"];

  const formatsRegexes: string[] = [];

  // Create regex of enabled formats with prefixes. e.g. "rgb(...)"
  colorFormatsFrom
    .filter((format) => isSettingEnabled(formatsFrom, format))
    .forEach((format) => {
      let regex = new RegExp("");
      switch (format) {
        case ColorFormatFrom.CMYK:
          regex = cmykRegex;
          break;
        case ColorFormatFrom.HEX:
          regex = hexRegex;
          break;
        case ColorFormatFrom.HEX_0X:
          regex = hex0xRegex;
          break;
        case ColorFormatFrom.HSL:
        case ColorFormatFrom.HSLA:
          regex = hslRegex;
          break;
        case ColorFormatFrom.HWB:
          regex = hwbRegex;
          break;
        case ColorFormatFrom.LAB:
          regex = labRegex;
          break;
        case ColorFormatFrom.LCH:
          regex = lchRegex;
          break;
        case ColorFormatFrom.OKLAB:
          regex = oklabRegex;
          break;
        case ColorFormatFrom.OKLCH:
          regex = oklchRegex;
          break;
        case ColorFormatFrom.A98:
          regex = a98Regex;
          break;
        case ColorFormatFrom.RGB:
        case ColorFormatFrom.RGBA:
          regex = rgbRegex;
          break;
        case ColorFormatFrom.NAMED:
          regex = namedColorsRegex;
          break;
        default:
          break;
      }

      regex.source && formatsRegexes.push(regex.source.replace(/\^|\$/g, ""));
    });

  const formatsRegex = formatsRegexes.join("|");

  // Match colors without a letter or a dash before or after it
  const regex = new RegExp(
    `(?<![\\w\\-@\\.])(${formatsRegex})(?![\\w\\-@:])`,
    "gi"
  );
  const matches = [...text.matchAll(regex)];

  return matches;
}

export function customMatchColors(text: string) {
  const customRegexesSetting: Record<string, string[]> =
    getSetting("customRegexes") ?? {};

  const matches = {} as { [key in ColorFormatTo]: RegExpExecArray[] };

  for (const format in customRegexesSetting) {
    const regexes = customRegexesSetting[format];
    if (isColorFormat(format)) {
      for (const regexString of regexes) {
        const regex = new RegExp(regexString, "gid");
        const regexMatches = [...text.matchAll(regex)];
        if (regexMatches.length) {
          matches[format] ??= [];
          matches[format].push(...regexMatches);
        }
      }
    }
  }

  return matches;
}

export function parseColorString(initialColor: string | Color) {
  try {
    let color: ColorTranslatorExtended;
    if (typeof initialColor === "string") {
      const colorLowerCase = initialColor.toLocaleLowerCase();
      color = new ColorTranslatorExtended(colorLowerCase);
    } else {
      color = new ColorTranslatorExtended(initialColor);
    }
    const { r, g, b, alpha } = color.rgb;
    return new vscode.Color(r / 255, g / 255, b / 255, alpha ?? 1);
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

export function isValidDocument({ languageId }: vscode.TextDocument) {
  const disable = getSetting<boolean>("disable");
  if (disable) {
    return false;
  }

  const languages = getSetting<string[]>("languages");
  if (!languages) {
    return false;
  }

  return isSettingEnabled(languages, languageId);
}

export function isSettingEnabled(settings: string[], target: string) {
  let isValid = false;

  if (settings.indexOf("*") > -1) {
    isValid = true;
  }
  if (settings.indexOf(target) > -1) {
    isValid = true;
  }
  if (settings.indexOf(`!${target}`) > -1) {
    isValid = false;
  }

  return isValid;
}

export async function replaceAllColors(
  text: string,
  formatTo: ColorFormatTo,
  offset: number = 0
) {
  const matches = await getMatches(text, offset);
  matches.reverse();
  for (const match of matches) {
    const matchedColor = match.color;
    const rgbaColor = {
      r: matchedColor.red * 255,
      g: matchedColor.green * 255,
      b: matchedColor.blue * 255,
      alpha: matchedColor.alpha,
    };

    text = replaceTextInMatch(
      text,
      match.range,
      new ColorTranslatorExtended(rgbaColor)[formatTo].toString()
    );
  }
  return text;
}

export function ensureActiveEditorIsSet(
  timeout: number = 100
): Promise<vscode.TextEditor> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function waitForEditor() {
      if (vscode.window.activeTextEditor)
        resolve(vscode.window.activeTextEditor);
      else if (timeout && Date.now() - start >= timeout)
        reject(new Error("timeout"));
      else setTimeout(() => waitForEditor(), 10);
    }
    waitForEditor();
  });
}

export function getSetting<T>(setting: string) {
  return vscode.workspace
    .getConfiguration("color-picker-universal")
    .get<T>(setting);
}

export function findCustomFormat(text: string) {
  const customRegexesSetting: Record<string, string[]> =
    getSetting("customRegexes") ?? {};

  for (const format in customRegexesSetting) {
    const regexes = customRegexesSetting[format];
    if (isColorFormat(format)) {
      for (const regexString of regexes) {
        const regex = new RegExp(regexString, "gid");
        const [regexMatch] = [...text.matchAll(regex)];
        if (regexMatch) {
          return { format, regexMatch };
        }
      }
    }
  }
}

export function getFormatRegex(format: ColorFormatTo) {
  switch (format) {
    case ColorFormatTo.A98:
      return a98Regex;
    case ColorFormatTo.CMYK:
      return cmykRegex;
    case ColorFormatTo.HEX:
      return hexRegex;
    case ColorFormatTo.HEX0X:
      return hex0xRegex;
    case ColorFormatTo.HSL:
      return hslRegex;
    case ColorFormatTo.HWB:
      return hwbRegex;
    case ColorFormatTo.LAB:
      return labRegex;
    case ColorFormatTo.LCH:
      return lchRegex;
    case ColorFormatTo.NAMED:
      return namedColorsRegex;
    case ColorFormatTo.OKLAB:
      return oklabRegex;
    case ColorFormatTo.OKLCH:
      return oklchRegex;
    case ColorFormatTo.RGB:
    default:
      return rgbRegex;
  }
}

export async function getReferences(
  symbol: vscode.DocumentSymbol,
  uri: vscode.Uri
) {
  const symbolReferences: vscode.Location[] = [];

  for (const childSym of symbol.children) {
    symbolReferences.push(...(await getReferences(childSym, uri)));
  }

  const references = await vscode.commands.executeCommand<vscode.Location[]>(
    "vscode.executeReferenceProvider",
    uri,
    symbol.range.start
  );

  symbolReferences.push(...references);

  return symbolReferences;
}
