import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { matchColors, parseColorString } from "./utils/helpers";
import { linesFromRange, rangeByMatch, splitInLines } from "./utils/utils";
import {
  colorFormats,
  colorFormatsWithoutAlpha,
  Regex,
} from "./shared/constants";

function getMatches(text: string): vscode.ColorInformation[] {
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

class Picker implements vscode.Disposable {
  constructor() {
    this.register();
  }

  private get languages() {
    return vscode.workspace
      .getConfiguration("color-picker-universal")
      .get<string[]>("languages");
  }

  private register() {
    return this.languages!.map((language) => {
      vscode.languages.registerColorProvider(language, {
        provideDocumentColors(document: vscode.TextDocument) {
          const text = document.getText();
          return getMatches(text);
        },
        provideColorPresentations(_, { document, range }) {
          try {
            const text = document.getText();
            const lines = linesFromRange(text, range);
            const colorString = lines.join("");

            const color = new ColorTranslator(colorString);
            const { A } = color;

            const representationFormats =
              A !== 1 ? colorFormats : colorFormatsWithoutAlpha;

            const representations = representationFormats.map(
              (reprType) => color[reprType]
            );

            return representations.map(
              (representation) => new vscode.ColorPresentation(representation)
            );
          } catch (error) {
            console.log(error);
          }
        },
      });
    });
  }

  public dispose() {
    //intentional
  }
}

export function activate(context: vscode.ExtensionContext) {
  const picker = new Picker();
  context.subscriptions.push(picker);
}
