import {
  ensureActiveEditorIsSet,
  getSetting,
  matchColors,
  parseColorString,
} from "./utils/helpers";
import * as vscode from "vscode";
import { Document } from "./models/Document";

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

  const matches = matchColors(text).reverse();
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

  // TODO: Optimize to avoid O(matches*vars) time. Eg: sort and discard variables once the match is after it
  while (matches.length) {
    const match = matches.pop();
    const startIndex = match?.index;
    if (!startIndex) continue;

    const [colorText] = match;

    const endIndex = startIndex + colorText.length;
    const range = new vscode.Range(
      currentTextDocument.positionAt(startIndex),
      currentTextDocument.positionAt(endIndex)
    );

    if (
      !variables.every(
        (currVariable) =>
          currentTextDocument.offsetAt(currVariable.selectionRange.end) <
            startIndex ||
          currentTextDocument.offsetAt(currVariable.selectionRange.start) >
            endIndex
      )
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
