import * as vscode from "vscode";
import { Regex } from "../shared/constants";

export function splitInLines(text: string) {
  const newLineRegex = /(\r?\n)/g;
  const lines = text.split(newLineRegex);

  return lines;
}

export function rangeByMatch(
  lineStart: number,
  indexStart: number,
  text: string
) {
  const lastLineText = text.match(Regex.LastLineMatch)?.[0] || "";
  const heightInLines = text.match(Regex.NewLine)?.length || 0;
  const endLine = lineStart + heightInLines;
  const endIndex = lastLineText.length + heightInLines && indexStart;

  return new vscode.Range(
    new vscode.Position(lineStart, indexStart),
    new vscode.Position(endLine, endIndex)
  );
}

export function linesFromRange(text: string, range: vscode.Range) {
  const { start, end } = range;
  const lines: string[] = splitInLines(text).slice(start.line, end.line + 1);

  lines[lines.length - 1] = lines[lines.length - 1].slice(0, end.character);

  lines[0] = lines[0].slice(start.character);

  return lines;
}
