import * as vscode from "vscode";
import { colorFormatsTo } from "./shared/constants";
import { getCustomMatches, getMatches } from "./getMatches";
import {
  findCustomFormat,
  getFormatRegex,
  getSetting,
  isSettingEnabled,
  isValidDocument,
  replaceAllColors,
} from "./utils/helpers";
import { ColorFormatTo, CommandType } from "./utils/enums";
import { translateColors } from "./commands/translateColors";
import { ColorTranslatorExtended } from "./colorTranslatorExtended";
import { replaceRange } from "./utils/utils";
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
      async provideDocumentColors(document: vscode.TextDocument) {
        if (!isValidDocument(document)) return;

        const text = document.getText();

        return [...(await getMatches(text)), ...getCustomMatches(text)];
      },
      provideColorPresentations(colorRaw, { range, document }) {
        try {
          if (!isValidDocument(document)) return;

          const text = document.getText(range);

          // Check if custom format
          let isCustomFormat = false;
          try {
            new ColorTranslatorExtended(text);
          } catch (_e) {
            isCustomFormat = true;
          }

          const formatsToSetting = getSetting<string[]>("formatsTo");
          const formatsTo = formatsToSetting?.length ? formatsToSetting : ["*"];

          const { red: r, green: g, blue: b, alpha } = colorRaw;
          const color = new ColorTranslatorExtended({
            r: r * 255,
            g: g * 255,
            b: b * 255,
            alpha,
          });

          const preferLegacy = getSetting<boolean>("preferLegacy");
          if (preferLegacy) {
            color.updateOptions({ legacy: true });
          }

          const formatsFiltered = colorFormatsTo.filter((format) =>
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

          const finalRepresentations: vscode.ColorPresentation[] = [];

          // Add custom format representation
          // TODO: ugly asf
          if (isCustomFormat) {
            const customFormat = findCustomFormat(text);
            if (customFormat) {
              const { format, regexMatch } = customFormat;
              const formatColor = color[format].toString();
              const formatRegex = getFormatRegex(format);
              const globalFormatRegex = new RegExp(formatRegex.source, "gi");
              const [formatMatch] = [
                ...formatColor.matchAll(globalFormatRegex),
              ];
              let updatedText = text;
              const indices =
                regexMatch.indices?.slice(1).filter((v) => v) || [];
              indices.reverse();
              const formatValues = formatMatch
                .slice(2, indices.length + 3)
                .filter((v) => v);

              indices.forEach(([start, end], i) => {
                if (i === indices.length) return;
                const diff = indices.length - formatValues.length;
                let value = formatValues[formatValues.length - i - 1 + diff];
                if (i === 0 && diff === 1) {
                  value = "1";
                }
                if (value) {
                  updatedText = replaceRange(updatedText, start, end, value);
                }
              });

              finalRepresentations.push(
                new vscode.ColorPresentation(updatedText)
              );
            }
          }

          finalRepresentations.push(
            ...representations.map(
              (representation) => new vscode.ColorPresentation(representation)
            )
          );

          return finalRepresentations;
        } catch (error) {
          console.error(error);
        }
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
