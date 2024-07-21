import {
  customMatchColors,
  ensureActiveEditorIsSet,
  getSetting,
  matchColors,
  parseColorString,
} from "./utils/helpers";
import * as vscode from "vscode";
import { Document } from "./models/Document";
import { ColorFormatFrom, ColorFormatTo } from "./utils/enums";
import { Color } from "color-translate";

function findVars(
  symbols: vscode.DocumentSymbol[] = []
): vscode.DocumentSymbol[] {
  const vars = symbols.filter(
    (symbol) => symbol.kind === vscode.SymbolKind.Variable
  );
  return vars.concat(
    symbols
      .map((symbol) => findVars(symbol.children))
      .reduce((acc, curr) => acc.concat(curr), [])
  );
}

export async function getMatches(
  text: string,
  offset: number = 0
): Promise<vscode.ColorInformation[]> {
  let activeEditor;
  try {
    activeEditor = await ensureActiveEditorIsSet();
  } catch (error) {
    // should only timeout when testing
    activeEditor = {
      document: new Document(text) as any as vscode.TextDocument,
    };
  }

  const matchedColors = matchColors(text).reverse();
  const result: vscode.ColorInformation[] = [];

  const currentTextDocument = new Document(text);

  const ignoreVariableName = getSetting("ignoreVariableName");

  // "activeEditor.document.uri" should only be undefined when testing
  const symbols: vscode.DocumentSymbol[] =
    activeEditor.document.uri && ignoreVariableName
      ? await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
          "vscode.executeDocumentSymbolProvider",
          activeEditor.document.uri
        )
      : [];
  let variables = findVars(symbols).reverse();

  if (offset) {
    for (const currVariable of variables) {
      currVariable.selectionRange = new vscode.Range(
        currentTextDocument.positionAt(
          activeEditor.document.offsetAt(currVariable.selectionRange.start) -
            offset
        ),
        currentTextDocument.positionAt(
          activeEditor.document.offsetAt(currVariable.selectionRange.end) -
            offset
        )
      );
    }
  }

  while (matchedColors.length) {
    const matchedColor = matchedColors.pop();
    const startIndex = matchedColor?.index;
    if (matchedColor === undefined || startIndex === undefined) continue;

    const [colorText] = matchedColor;

    const endIndex = startIndex + colorText.length;
    const range = new vscode.Range(
      currentTextDocument.positionAt(startIndex),
      currentTextDocument.positionAt(endIndex)
    );
    while (
      variables.length &&
      currentTextDocument.offsetAt(
        variables[variables.length - 1].selectionRange.end
      ) <
        offset + startIndex
    ) {
      variables.pop();
    }
    const lastVar = variables[variables.length - 1];
    if (
      lastVar &&
      currentTextDocument.offsetAt(lastVar.selectionRange.start) < endIndex
    ) {
      continue;
    }

    const color = parseColorString(colorText);

    if (color) {
      result.push(new vscode.ColorInformation(range, color));
    }
  }
  return result;
}

function parseAlpha(alpha: string) {
  return alpha === "" ? "1" : alpha;
}

export function getCustomMatches(text: string) {
  const result: vscode.ColorInformation[] = [];

  const matches = customMatchColors(text);

  for (const format in matches) {
    const matchesValues = matches[format as ColorFormatTo];
    for (const matchValues of matchesValues) {
      const { index } = matchValues;
      const [match = "", v1 = "", v2 = "", v3 = "", v4 = "", v5 = ""] =
        matchValues;
      let color: string | Color;

      switch (format as ColorFormatFrom) {
        case ColorFormatFrom.CMYK:
          color = { c: v1, m: v2, y: v3, k: v4, alpha: parseAlpha(v5) };
          break;
        case ColorFormatFrom.HEX:
          color = `#${v1}${v2}${v3}${v4}`;
          break;
        case ColorFormatFrom.HEX_0X:
          color = `0x${v1}${v2}${v3}${v4}`;
          break;
        case ColorFormatFrom.HSL:
        case ColorFormatFrom.HSLA:
          color = { h: v1, s: v2, l: v3, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.HWB:
          color = { h: v1, w: v2, b: v3, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.LAB:
          color = { l: v1, a: v2, b: v3, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.LCH:
          color = { l: v1, c: v2, h: v3, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.NAMED:
          color = v1;
          break;
        case ColorFormatFrom.OKLAB:
          color = { l: v1, a: v2, b: v3, ok: true, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.OKLCH:
          color = { l: v1, c: v2, h: v3, ok: true, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.A98:
          color = { r: v1, g: v2, b: v3, a98: true, alpha: parseAlpha(v4) };
          break;
        case ColorFormatFrom.RGB:
        case ColorFormatFrom.RGBA:
        default:
          color = { r: v1, g: v2, b: v3, alpha: parseAlpha(v4) };
          break;
      }

      const vscodeColor = parseColorString(color);

      const currentTextDocument = new Document(text);

      const range = new vscode.Range(
        currentTextDocument.positionAt(index),
        currentTextDocument.positionAt(index + match.length)
      );

      if (vscodeColor) {
        result.push(new vscode.ColorInformation(range, vscodeColor));
      }
    }
  }
  return result;
}
