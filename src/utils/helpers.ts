import { ColorFormat } from "./enums";
import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";

export function getColorType(color: string, hasAlpha: boolean): ColorFormat {
  const start = color.split("(")[0];
  let type: ColorFormat;
  switch (start) {
    case "rgb":
    case "rgba":
      type = hasAlpha ? ColorFormat.RGBA : ColorFormat.RGB;
      break;
    case "hsl":
    case "hsla":
      type = hasAlpha ? ColorFormat.HSLA : ColorFormat.HSL;
      break;
    case "device-cmyk":
    case "cmyk":
      type = hasAlpha ? ColorFormat.CMYKA : ColorFormat.CMYK;
      break;
    default:
      type = hasAlpha ? ColorFormat.HEXA : ColorFormat.HEX;
      break;
  }
  return type;
}

export function matchColors(text: string) {
  const colorRegex =
    /((?:rgb|rgba|hsl|hsla|cmyk|cmyka)\([\s\d%,.]+\)|#(?:[\da-f]{3,4}){2}|#(?:[\da-f]{3,4}))/gi;
  const matches = [...text.matchAll(colorRegex)];

  return matches;
}

export function parseColorString(colorRaw: string) {
  try {
    const color = new ColorTranslator(colorRaw);
    const { R, G, B } = color;
    const { a = 1 } = color.RGBAObject;

    return new vscode.Color(R / 255, G / 255, B / 255, a);
  } catch (error) {
    console.log(error);
    return null;
  }
}
