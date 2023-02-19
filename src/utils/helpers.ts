import { ColorTranslatorExtended } from "./../colorTranslatorExtended";
import * as vscode from "vscode";
import {
  colorFormatsFromPrefixes,
  colorFormatsWithAlpha,
} from "./../shared/constants";
import { NamedColors } from "../shared/constants";
import { ColorFormatFrom, ColorFormatTo } from "./enums";
import { replaceTextInMatch } from "./utils";

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function matchColors(text: string) {
  const formatsFromSetting = vscode.workspace
    .getConfiguration("color-picker-universal")
    .get<string[]>("formatsFrom");

  const formatsFrom = formatsFromSetting?.length ? formatsFromSetting : ["*"];

  const formatsRegexes: string[] = [];

  if (isSettingEnabled(formatsFrom, ColorFormatFrom.NAMED)) {
    const namedColors = Object.keys(NamedColors).join("|");
    formatsRegexes.push(`(?:${namedColors})`);
  }

  if (isSettingEnabled(formatsFrom, ColorFormatFrom.HEX)) {
    formatsRegexes.push("#(?:[\\da-f]{3,4}){2}|#(?:[\\da-f]{3,4})");
  }

  // Create regex of enabled formats with prefixes. e.g. "rgb(...)"
  const filteredFormatPrefixes = colorFormatsFromPrefixes.filter((format) =>
    isSettingEnabled(formatsFrom, format)
  );

  if (filteredFormatPrefixes.length) {
    formatsRegexes.push(
      `(?:${filteredFormatPrefixes.join("|")})\\([\\s\\d%,.\\/]+\\)`
    );
  }

  const formatsRegex = formatsRegexes.join("|");

  // Match colors without a letter or a dash before or after it
  const regex = new RegExp(
    `(?<![\\w-@\\.])(${formatsRegex})(?![\\w-@:])`,
    "gi"
  );
  const matches = [...text.matchAll(regex)];

  return matches;
}

export function parseColorString(initialColor: string) {
  try {
    const colorRaw = initialColor.toLocaleLowerCase();
    const color = new ColorTranslatorExtended(colorRaw);
    const { r, g, b, a = 1 } = color.RGBAObject;
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

  if (config.disable) {
    return isValid;
  }

  return isSettingEnabled(config.languages, languageId);
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

export function replaceAllColors(text: string, formatTo: ColorFormatTo) {
  const config = vscode.workspace.getConfiguration("color-picker-universal");
  const strictAlpha = config.get<boolean>("strictAlpha");

  const matches = matchColors(text);
  matches.reverse();
  matches.forEach((match) => {
    const colorRaw = match[0];
    const matchedColor = parseColorString(colorRaw);
    if (!matchedColor) return;
    const rgbaColor = {
      r: matchedColor.red * 255,
      g: matchedColor.green * 255,
      b: matchedColor.blue * 255,
      a: matchedColor.alpha,
    };

    let currentFormatTo = formatTo;
    if (
      strictAlpha === false &&
      rgbaColor.a !== 1 &&
      !colorFormatsWithAlpha.includes(currentFormatTo) &&
      formatTo !== ColorFormatTo.NAMED
    ) {
      currentFormatTo = (currentFormatTo + "A") as ColorFormatTo;
    }

    text = replaceTextInMatch(
      match,
      text,
      new ColorTranslatorExtended(rgbaColor)[currentFormatTo]
    );
  });
  return text;
}
