import * as vscode from "vscode";
import { colorFormatsTo, colorFormatsWithAlpha } from "./shared/constants";
import { getMatches } from "./getMatches";
import {
  getSetting,
  isSettingEnabled,
  isValidDocument,
  replaceAllColors,
} from "./utils/helpers";
import { ColorFormatTo, CommandType } from "./utils/enums";
import { translateColors } from "./commands/translateColors";
import { ColorTranslatorExtended } from "./colorTranslatorExtended";

class Picker implements vscode.Disposable {
  constructor() {
    this.register();
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
      const formatTo = selected.format.label as ColorFormatTo;
      const commandType = selected.area.label as CommandType;

      let ranges: vscode.Range[];
      switch (commandType) {
        case CommandType.LINE:
          ranges = activeEditor.selections.map(
            (selection) =>
              new vscode.Range(
                activeEditor.document.lineAt(selection.active).range.start,
                activeEditor.document.lineAt(selection.active).range.end
              )
          );
          break;
        case CommandType.SELECTION:
          ranges = activeEditor.selections.map(
            (selection) => new vscode.Range(selection.start, selection.end)
          );
          break;
        case CommandType.FILE:
          ranges = [
            new vscode.Range(
              activeEditor.document.lineAt(0).range.start,
              activeEditor.document.lineAt(
                activeEditor.document.lineCount - 1
              ).range.end
            ),
          ];
          break;
      }

      for (const range of ranges) {
        const selectedText = activeEditor.document.getText(range);
        const offset = activeEditor.document.offsetAt(range.start);
        const newText = await replaceAllColors(selectedText, formatTo, offset);
        activeEditor.edit((editBuilder) => {
          editBuilder.replace(range, newText);
        });
      }
    };

    vscode.commands.registerCommand(command, commandHandler);
    vscode.languages.registerColorProvider("*", {
      provideDocumentColors(document: vscode.TextDocument) {
        if (!isValidDocument(document)) return;

        const text = document.getText();
        return getMatches(text);
      },
      provideColorPresentations(colorRaw, { range, document }) {
        if (!isValidDocument(document)) return;

        const formatsToSetting = getSetting<string[]>("formatsTo");
        const formatsTo = formatsToSetting?.length ? formatsToSetting : ["*"];

        const { red: r, green: g, blue: b, alpha: a } = colorRaw;
        const color = new ColorTranslatorExtended({
          r: r * 255,
          g: g * 255,
          b: b * 255,
          a,
        });
        const { alpha } = color.rgb;

        const preferLegacy = getSetting<boolean>("preferLegacy");
        if (preferLegacy) {
          color.updateOptions({ legacy: true });
        }

        // Filter formats if alpha !== 1
        const formats = alpha !== 1 ? colorFormatsWithAlpha : colorFormatsTo;

        const formatsFiltered = formats.filter((format) =>
          isSettingEnabled(
            formatsTo.map((f) => f.toLocaleUpperCase()),
            format
          )
        );

        let representations = formatsFiltered.map((reprType) =>
          color[reprType].toString()
        );

        // Occupy the same lines as before the translation
        const heightInLines = range.end.line - range.start.line + 1;
        if (heightInLines > 1) {
          representations = representations.map(
            (rep) =>
              rep +
              (document.eol === 1 ? "\n" : "\r\n").repeat(heightInLines - 1)
          );
        }

        return representations.map(
          (representation) =>
            new vscode.ColorPresentation(representation.toString())
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
