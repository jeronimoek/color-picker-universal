import { matchColors, parseColorString } from "./utils/helpers";
import { rangeByMatch, splitInLines } from "./utils/utils";
import * as vscode from "vscode";
import { Regex } from "./shared/constants";

export function getMatches(text: string): vscode.ColorInformation[] {
  const matches = matchColors(text).reverse();
  let count = 0;
  let i = 0;
  const lines = splitInLines(text);

  const result: vscode.ColorInformation[] = [];

  for (const line of lines) {
    if (Regex.ExactNewLine.test(line)) {
      count += line.length;
      continue;
    }

    while (
      matches[matches.length - 1]?.index &&
      matches[matches.length - 1].index! <= count + line.length
    ) {
      const match = matches.pop();
      if (!match?.index) continue;
      const [colorText] = match;
      const index = match.index - count;

      const range = rangeByMatch(i, index, colorText);

      const color = parseColorString(colorText);

      if (color) {
        result.push(new vscode.ColorInformation(range, color));
      }
    }
    if (matches.length === 0) {
      break;
    }
    i++;
    count += line.length;
  }
  return result;
}
