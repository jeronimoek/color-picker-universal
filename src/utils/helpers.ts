import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { NamedColors } from "../shared/constants";

export function matchColors(text: string) {
  const namedColors = Object.keys(NamedColors).join("|");
  const namedRegex = `\\b(?:${namedColors})\\b`;

  const formats = ["rgb", "rgba", "hsl", "hsla", "cmyk"].join("|");
  const formatsRegex = `(?:${formats})\\([\\s\\d%,.\\/]+\\)`;

  const hexRegex = "#(?:[\\da-f]{3,4}){2}|#(?:[\\da-f]{3,4})";

  const regex = new RegExp(`(${namedRegex}|${formatsRegex}|${hexRegex})`, "gi");
  const matches = [...text.matchAll(regex)];

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
