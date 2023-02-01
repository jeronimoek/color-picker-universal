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
    formatsToJoin.push(`\\b(?:${namedColors})\\b`);
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

  const regex = new RegExp(`(${formatsJoined})`, "gi");
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
