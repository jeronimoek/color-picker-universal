import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";

export function matchColors(text: string) {
  const colorRegex =
    /((?:rgb|rgba|hsl|hsla|cmyk|cmyka)\([\s\d%,.\/]+\)|#(?:[\da-f]{3,4}){2}|#(?:[\da-f]{3,4}))/gi;
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
    return null;
  }
}
