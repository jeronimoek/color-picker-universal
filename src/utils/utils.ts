import * as vscode from "vscode";
import { Regex } from "../shared/constants";
import { TemplateColorFragments } from "./enums";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function splitInLines(text: string) {
  const lineRegex = /(.*)(\r?\n)?/g;
  const lines = text.match(lineRegex) || [];
  lines.pop();
  return lines;
}

export function rangeByMatch(
  lineStart: number,
  indexStart: number,
  text: string
) {
  const lastLineText = text.match(Regex.LastLineMatch)?.[1] || "";
  const heightInLines = text.match(Regex.NewLine)?.length || 0;
  const endLine = lineStart + heightInLines;
  const endIndex = lastLineText.length + (heightInLines ? 0 : indexStart);

  return new vscode.Range(
    new vscode.Position(lineStart, indexStart),
    new vscode.Position(endLine, endIndex)
  );
}

export function templateReplace(
  text: string,
  values: Record<TemplateColorFragments, string>
) {
  return text.replace(/{{(\w+)}}/g, (_, key: TemplateColorFragments) => {
    return values[key] || "0";
  });
}
