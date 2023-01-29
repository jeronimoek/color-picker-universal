import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { colorFormats, colorFormatsWithAlpha } from "./shared/constants";
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
        provideColorPresentations(colorRaw, { range }) {
          const { red: r, green: g, blue: b, alpha: a } = colorRaw;
          const color = new ColorTranslator({
            r: r * 255,
            g: g * 255,
            b: b * 255,
            a,
          });
          const { A } = color;

          const representationFormats =
            A !== 1 ? colorFormatsWithAlpha : colorFormats;

          let representations = representationFormats.map(
            (reprType) => color[reprType]
          );

          const heightInLines = range.end.line - range.start.line + 1;
          if (heightInLines > 1) {
            representations = representations.map(
              (rep) => rep + "\n".repeat(heightInLines - 1)
            );
          }

          return representations.map(
            (representation) => new vscode.ColorPresentation(representation)
          );
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
