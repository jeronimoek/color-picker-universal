import * as vscode from "vscode";
import { Document } from "../models/Document";
import { Regex } from "../shared/constants";
import { ColorFormatTo, TemplateColorFragments } from "./enums";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function isColorFormat(format: string): format is ColorFormatTo {
  return Object.values(ColorFormatTo).includes(format as any);
}

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

export function replaceTextInMatch(
  text: string,
  match: vscode.Range,
  newText: string
) {
  const currentTextDocument = new Document(text);

  const startIndex = currentTextDocument.offsetAt(match.start);
  const endIndex = currentTextDocument.offsetAt(match.end);

  return text.slice(0, startIndex) + newText + text.slice(endIndex);
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

export function replaceRange(
  s: string,
  start: number,
  end: number,
  substitute: string
) {
  return s.substring(0, start) + substitute + s.substring(end);
}
