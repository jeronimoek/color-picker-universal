import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";
import { colorFormats, colorFormatsWithAlpha } from "./shared/constants";
import { getMatches } from "./getMatches";
import {
  filterFormats,
  isValidDocument,
  replaceAllColors,
  rgbToHwbString,
} from "./utils/helpers";
import { ColorFormatTo, CommandType, CustomColorFormatTo } from "./utils/enums";
import { translateColors } from "./commands/translateColors";

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
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return;
    }

    const command = `color-picker-universal.translateColors`;

    const commandHandler = async () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }

      const selected = await translateColors();
      const formatTo = selected.format.label as
        | ColorFormatTo
        | CustomColorFormatTo;
      const commandType = selected.area.label as CommandType;

      let start: vscode.Position, end: vscode.Position;
      switch (commandType) {
        case CommandType.LINE:
          start = activeEditor.document.lineAt(activeEditor.selection.active)
            .range.start;
          end = activeEditor.document.lineAt(activeEditor.selection.active)
            .range.end;
          break;
        case CommandType.SELECTION:
          start = activeEditor.selection.start;
          end = activeEditor.selection.end;
          break;
        case CommandType.FILE:
          start = activeEditor.document.lineAt(0).range.start;
          end = activeEditor.document.lineAt(
            activeEditor.document.lineCount - 1
          ).range.end;
          break;
      }

      const selectedText = activeEditor.document.getText(
        new vscode.Range(start, end)
      );

      activeEditor.edit((editBuilder) =>
        editBuilder.replace(
          new vscode.Range(start, end),
          replaceAllColors(selectedText, formatTo)
        )
      );
    };

    vscode.commands.registerCommand(command, commandHandler);
    vscode.languages.registerColorProvider("*", {
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

        let selectedFormatsTo = vscode.workspace
          .getConfiguration("color-picker-universal")
          .get<string[]>("formatsTo");

        if (!selectedFormatsTo?.length) {
          selectedFormatsTo = ["*"];
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
          selectedFormatsTo.map((f) => f.toLocaleUpperCase())
        );

        let representations = representationsFormatsFiltered.map(
          (reprType) => color[reprType]
        );

        if (
          selectedFormatsTo?.includes("*") ||
          selectedFormatsTo?.includes("hwb")
        ) {
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
            (rep) =>
              rep +
              (document.eol === 1 ? "\n" : "\r\n").repeat(heightInLines - 1)
          );
        }

        return representations.map(
          (representation) => new vscode.ColorPresentation(representation)
        );
      },
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
