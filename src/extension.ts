import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { linesFromRange } from "./utils/utils";
import { colorFormats, colorFormatsWithoutAlpha } from "./shared/constants";
import { getMatches } from "./getMatches";

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
            const colorString = lines.join("\r\n");

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
