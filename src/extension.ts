import * as vscode from "vscode";
import { colorFormatsTo, formatsBuiltinPicker } from "./shared/constants";
import { getCustomMatches, getMatches } from "./getMatches";
import {
  findCustomFormat,
  getFormatRegex,
  getSetting,
  isSettingEnabled,
  isValidDocument,
  processCustomOutputs,
  replaceAllColors,
} from "./utils/helpers";
import { ColorFormatTo, CommandType } from "./utils/enums";
import { translateColors } from "./commands/translateColors";
import { ColorTranslatorExtended } from "./colorTranslatorExtended";
import { replaceRange } from "./utils/utils";
import { CustomOutputsSetting } from "./models/settings";
class Picker implements vscode.Disposable {
  private colorsCache = new Map<string, vscode.ColorInformation[]>();
  private colorPresentationsCache = new Map<
    string,
    vscode.ColorPresentation[]
  >();

  constructor(private context: vscode.ExtensionContext) {
    this.register();
  }

  private register() {
    let disabled = false;

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

    const avoidDuplicate = getSetting<boolean>("avoidDuplicate");
    const formatsToSetting = getSetting<string[]>("formatsTo");
    const preferLegacy = getSetting<boolean>("preferLegacy");
    const customOutputsSetting =
      getSetting<CustomOutputsSetting>("customOutputs");

    const disposableCommand = vscode.commands.registerCommand(
      command,
      commandHandler
    );
    this.context.subscriptions.push(disposableCommand);

    const disposableProvider = vscode.languages.registerColorProvider("*", {
      provideDocumentColors: async (document: vscode.TextDocument) => {
        const docKey = `${document.uri.toString()}#${document.version}`;
        const cached = this.colorsCache.get(docKey);
        if (cached) return cached;

        if (disabled) {
          disabled = false;
          return;
        }

        if (!isValidDocument(document)) return;

        const text = document.getText();

        let matches = [
          ...(await getMatches(text)),
          ...getCustomMatches(text, document.languageId),
        ];

        if (
          avoidDuplicate &&
          matches.length &&
          formatsBuiltinPicker.includes(document.languageId)
        ) {
          disabled = true;

          const builtinPickerColors = await vscode.commands.executeCommand<
            vscode.ColorInformation[]
          >("vscode.executeDocumentColorProvider", document.uri);

          const lineCharBuiltinColors = builtinPickerColors.reduce<
            Record<string, true>
          >((acc, curr) => {
            const { start, end } = curr.range;
            const values = [
              start.line,
              start.character,
              end.line,
              end.character,
            ];
            const key = values.join("-");
            acc[key] = true;
            return acc;
          }, {});

          matches = matches.filter((match) => {
            const { start, end } = match.range;
            const values = [
              start.line,
              start.character,
              end.line,
              end.character,
            ];
            const key = values.join("-");
            return !lineCharBuiltinColors[key];
          });
        }

        this.colorsCache.set(docKey, matches);

        return matches;
      },

      provideColorPresentations: (colorRaw, { range, document }) => {
        if (!isValidDocument(document)) return;

        const colorKey = `${document.uri.toString()}#${document.version}-${
          range.start.line
        }-${range.start.character}-${range.end.line}-${range.end.character}-${
          colorRaw.red
        }-${colorRaw.green}-${colorRaw.blue}-${colorRaw.alpha}`;
        const cached = this.colorPresentationsCache.get(colorKey);
        if (cached) return cached;

        const text = document.getText(range);

        // Check if custom format
        let isCustomFormat = false;
        try {
          new ColorTranslatorExtended(text);
        } catch (_e) {
          isCustomFormat = true;
        }

        const formatsTo = formatsToSetting?.length ? formatsToSetting : ["*"];

        const { red: r, green: g, blue: b, alpha } = colorRaw;
        const color = new ColorTranslatorExtended(
          {
            r: r * 255,
            g: g * 255,
            b: b * 255,
            alpha,
          },
          {
            customOutputs: customOutputsSetting
              ? processCustomOutputs(customOutputsSetting, document.languageId)
              : undefined,
          }
        );

        if (preferLegacy) {
          color.updateOptions({ legacy: true });
        }

        const formatsFiltered = colorFormatsTo.filter((format) =>
          // TODO: add support for language specific formats
          isSettingEnabled(formatsTo, format)
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
        // TODO: improve code quality
        if (isCustomFormat) {
          const customFormat = findCustomFormat(text);
          if (customFormat) {
            const { format, regexMatch } = customFormat;
            const formatColor = color[format].toString();
            const formatRegex = getFormatRegex(format);
            const globalFormatRegex = new RegExp(formatRegex.source, "gi");
            const [formatMatch] = [...formatColor.matchAll(globalFormatRegex)];
            let updatedText = text;
            const indices = regexMatch.indices?.slice(1).filter((v) => v) || [];
            indices.reverse();
            const formatValues = formatMatch
              .slice(2, indices.length + 3)
              .filter((v) => v);

            const diff = indices.length - formatValues.length;
            indices.forEach(([start, end], i) => {
              if (i === indices.length) return;
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

        this.colorPresentationsCache.set(colorKey, finalRepresentations);
        return finalRepresentations;
      },
    });
    this.context.subscriptions.push(disposableProvider);

    const disposableSettings = vscode.workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration("color-picker-universal")) {
          this.colorsCache.clear();
          this.colorPresentationsCache.clear();
        }
      }
    );
    this.context.subscriptions.push(disposableSettings);
  }

  public dispose() {
    this.colorsCache.clear();
    this.colorPresentationsCache.clear();
  }
}

export function activate(context: vscode.ExtensionContext) {
  new Picker(context);
}
