import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { colorFormats, colorFormatsWithAlpha } from "./shared/constants";
import { getMatches } from "./getMatches";
import {
  filterFormats,
  isValidDocument,
  rgbToHwbString,
} from "./utils/helpers";

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
          const config = vscode.workspace.getConfiguration(
            "color-picker-universal"
          );
          if (!isValidDocument(config, document)) return;

          const text = document.getText();
          return getMatches(text);
        },
        provideColorPresentations(colorRaw, { range, document }) {
          const config = vscode.workspace.getConfiguration(
            "color-picker-universal"
          );
          if (!isValidDocument(config, document)) return;

          let formatsTo = vscode.workspace
            .getConfiguration("color-picker-universal")
            .get<string[]>("formatsTo");

          if (!formatsTo?.length) {
            formatsTo = ["*"];
          }

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

          const representationsFormatsFiltered = filterFormats(
            representationFormats,
            formatsTo.map((f) => f.toLocaleUpperCase())
          );

          let representations = representationsFormatsFiltered.map(
            (reprType) => color[reprType]
          );

          if (formatsTo?.includes("*") || formatsTo?.includes("hwb")) {
            A === 1 &&
              representations.push(
                rgbToHwbString({
                  r: r * 255,
                  g: g * 255,
                  b: b * 255,
                })
              );
            representations.push(
              rgbToHwbString({
                r: r * 255,
                g: g * 255,
                b: b * 255,
                a: A,
              })
            );
          }

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
