import { ColorType } from "./utils/enums";
import * as vscode from "vscode";
import { ColorTranslator } from "colortranslator";

function parseColorString(colorRaw: string) {
  try {
    const color = new ColorTranslator(colorRaw);
    const { R, G, B } = color;
    const { a = 1 } = color.RGBAObject;

    return new vscode.Color(R / 255, G / 255, B / 255, a);
  } catch (error) {
    console.log(error);
    return null;
  }
}

class Matcher {
  static getMatches(text: string): vscode.ColorInformation[] {
    const result: vscode.ColorInformation[] = [];
    const matches = [
      ...text.matchAll(
        /((?:rgb|rgba|hsl|hsla|cmyk|cmyka)\([\s\d%,.]+\)|#(?:[\da-f]{3,4}){2}|#(?:[\da-f]{3,4}))/gi
      ),
    ].reverse();

    let count = 0;
    let i = 0;
    const lines = text.split(/(\r?\n)/g);

    for (const line of lines) {
      if (/^\r?\n$/.test(line)) {
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
        const lineIndex = match.index - count;
        const numOfExtraLines = colorText.match(/\r?\n/g)?.length;
        const range = new vscode.Range(
          new vscode.Position(i, lineIndex),
          new vscode.Position(
            i + (numOfExtraLines || 0),
            !numOfExtraLines
              ? lineIndex + colorText.length
              : colorText.split(/\r?\n/g).pop()?.length || 0
          )
        );

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
          return Matcher.getMatches(document.getText());
        },
        provideColorPresentations(_, { document, range }) {
          try {
            const { start, end } = range;
            const lines: string[] = document
              .getText()
              .split(/\n/g)
              .slice(start.line, end.line + 1);
            lines[lines.length - 1] = lines[lines.length - 1].slice(
              0,
              end.character
            );
            lines[0] = lines[0].slice(start.character);
            const colorString = lines.join("");

            const color = new ColorTranslator(colorString);
            const { A } = color;

            let representationTypes: (keyof typeof ColorType)[];

            representationTypes = [
              "RGB",
              "RGBA",
              "HEX",
              "HEXA",
              "HSL",
              "HSLA",
              "CMYK",
              "CMYKA",
            ];

            if (A !== 1) {
              representationTypes = representationTypes.filter(
                (rep) => rep[rep.length - 1] === "A"
              );
            }

            /* TODO: REVIEW IF DOABLE DUE TO VSCODE REFRESHING DATA
            
            const colorType = getColorType(colorString, A !== 1);
            
            const currentReprIndex = representationTypes.findIndex(
              (representation) =>
                ColorType[colorType].startsWith(representation)
            );

            const orderedReprTypes = representationTypes
              .slice(currentReprIndex)
              .concat(representationTypes.slice(0, currentReprIndex));

            const orderedRepresentations = orderedReprTypes.map(
              (reprType) => color[reprType]
            );

            return orderedRepresentations.map(
              (representation) => new vscode.ColorPresentation(representation)
            );
            
            */

            const representations = representationTypes.map(
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
