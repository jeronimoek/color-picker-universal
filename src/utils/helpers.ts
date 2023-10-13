import { ColorTranslatorExtended } from "./../colorTranslatorExtended";
import * as vscode from "vscode";
import {
  colorFormatsFromPrefixes,
  colorFormatsWithAlpha,
} from "./../shared/constants";
import { NamedColors } from "../shared/constants";
import { ColorFormatFrom, ColorFormatTo } from "./enums";
import { replaceTextInMatch } from "./utils";
import { getMatches } from "../getMatches";

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

  if (isSettingEnabled(formatsFrom, ColorFormatFrom.NAMED)) {
    const namedColors = Object.keys(NamedColors).join("|");
    formatsRegexes.push(`(?:${namedColors})`);
  }

  if (isSettingEnabled(formatsFrom, ColorFormatFrom.HEX)) {
    formatsRegexes.push("#(?:[\\da-f]{3,4}){2}|#(?:[\\da-f]{3,4})");
  }

  if (isSettingEnabled(formatsFrom, ColorFormatFrom.HEX_0X)) {
    formatsRegexes.push("0x(?:[\\da-f]{1,6})");
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
    const { r, g, b, alpha = 1 } = color.rgb;
    return new vscode.Color(r / 255, g / 255, b / 255, alpha || 1);
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
  const strictAlpha = getSetting<boolean>("strictAlpha");

  const matches = await getMatches(text, offset);
  matches.reverse();
  for (const match of matches) {
    const matchedColor = match.color;
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
      formatTo !== ColorFormatTo.NAMED &&
      formatTo !== ColorFormatTo.HEX0X
    ) {
      currentFormatTo = (currentFormatTo + "A") as ColorFormatTo;
    }

    text = replaceTextInMatch(
      text,
      match.range,
      new ColorTranslatorExtended(rgbaColor)[currentFormatTo].toString()
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
