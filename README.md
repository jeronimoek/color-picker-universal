# 🌌 Color Picker Universal 🌌

## 🌐 Links

[🔧 Core Dependency](https://github.com/jeronimoek/color-translate)

[🛜 Website](https://jeronimoek.github.io/color-translate-web/)

[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=JeronimoEkerdt.color-picker-universal)

[Open VSX Registry](https://open-vsx.org/extension/JeronimoEkerdt/color-picker-universal)

[Github Repository](https://github.com/jeronimoek/color-picker-universal)

## ✅ Features

Pick and translate between multiple color formats, in any file.

Formats supported: rgb/a, a98, hex/a, hsl/a, hwb/a, cmyk/a, hex 0x, lab, lch, oklab, oklch and named colors.

Some variations of these might be possible with the correct settings. For example [XAML a/Hex](https://github.com/jeronimoek/color-picker-universal/blob/main/docs/SETTINGS.md#xaml-ahex-support)

This extension can be used through its color pickers, commands, or context menu options.

![Demo](images/demo.gif)

## ⚙ Settings

To see settings press `CTRL + ,` OR `⌘ + ,`

To see some advanced examples see [here](https://github.com/jeronimoek/color-picker-universal/blob/main/docs/SETTINGS.md)

| Id                                        | Description                                                                                                                                        | Default | Available values                                                                                            | Example                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| color-picker-universal.disable            | Disables the extension                                                                                                                             | false   | true false                                                                                                  | true                                                                                                                      |
| color-picker-universal.ignoreVariableName | If enabled, ignores colors in variables names                                                                                                      | true    | true false                                                                                                  | false                                                                                                                     |
| color-picker-universal.preferLegacy       | If enabled, colors are displayed in legacy mode when possible                                                                                      | false   | true false                                                                                                  | true                                                                                                                      |
| color-picker-universal.languages          | Enabled language identifiers. Use "!" to exclude languages                                                                                         | ["*"]   | [Default identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers) | ["*", "!css", "!less", "!sass", "!scss"]                                                                                  |
| color-picker-universal.formatsFrom        | Enabled formats to translate from. Use "!" to exclude formats                                                                                      | ["*"]   | "\*" "device-cmyk" "hex" "hsl" "hwb" "named" "rgb" "hex0x" "lab" "lch" "oklab" "oklch" "a98"                | ["*", "!hex_0x", "!named"]                                                                                                |
| color-picker-universal.formatsTo          | Enabled formats to translate into. Use "!" to exclude formats                                                                                      | ["*"]   | "\*" "cmyk" "hex" "hsl" "hwb" "named" "rgb" "hex0x" "lab" "lch" "oklab" "oklch" "a98"                       | ["*", "!hex_0x", "!cmyk", "!hwb"]                                                                                         |
| color-picker-universal.maxDigits          | Max number of decimal digits                                                                                                                       | 2       | <integer>                                                                                                   | 5                                                                                                                         |
| color-picker-universal.customOutputs      | Add custom outputs for given formats per file languageId                                                                                           | {}      | See [Custom Outputs](#-custom-outputs)                                                                      | `{ "oklch":[{ "values": { "l":{ "to": 100, "suffix": "%" } } }],}`                                                        |
| color-picker-universal.customRegexes      | Add custom input regexes for given formats                                                                                                         | {}      | See [Custom Regexes](#-custom-regexes)                                                                      | `{ "a98": ["my-a98\\((\\d+(?:\\.\\d+)?) \\$ (\\d+(?:\\.\\d+)?) \\$ (\\d+(?:\\.\\d+)?)(?: \\$ (\\d+(?:\\.\\d+)?))?\\)",]}` |
| color-picker-universal.avoidDuplicate     | If enabled, duplicate color pickers will be avoided. Note: On these built-in color pickers, the extension's formats and configurations won't apply | false   | true false                                                                                                  | true                                                                                                                      |

## ✍ Commands

To see commands press `F1` and type `Color Picker Universal`

[//]: # "vscode-table-commands(title:Name|command:Command)"

| Name                               | Command                                |
| ---------------------------------- | -------------------------------------- |
| Translate colors to another format | color-picker-universal.translateColors |

## 🗨 Editor's context menu options

To see the editor's context menu options press `right click` inside a file content's editor

[//]: # "vscode-table-menus(title:Name|command:Command)"

| Name                               | Command                                |
| ---------------------------------- | -------------------------------------- |
| Translate colors to another format | color-picker-universal.translateColors |

## 🖌️ Custom Outputs

This setting allows the user to create custom output presentations for the given formats.

This takes an object with the following schema:

```ts
{
  "FORMAT_1": [
    {
      // "files" field works like the "languages" setting
      "files"?: ["*", "!css"],
      "values"?: {
        // the properties are the letters of the color format (e.g., "r", "g" and "b")
        // except in hex and a98 where the properties are still "r", "g" and "b"
        // alpha property is always "alpha" in every color format
        "PROPERTY_1": {
          "from"?: number, // default 0
          "to"?: number, // default 1 OR 100 if suffix === '%'
          "suffix"?: string, // default ""
          "maxDigits"?: number // default 2. In hex it's the amount of chars (1 OR 2)
        }
      },
      "template"?: string, // "rgb({{r}}, {{g}}, {{b}})" OR "#{{r}}{{g}}{{b}}"
      "templateAlpha"?: string, // "rgb({{a}}% / {{r}}, {{g}}, {{b}})" OR "#{{a}}{{r}}{{g}}{{b}}"
    }
  ]
}
```

Keep in mind that this could give outputs that are not compatible as inputs for the extension itself. In this cases a possible solution is adding a Custom Regex for the given format, in the given file languages

## 🔧 Custom Regexes

This setting allows the user to create custom input regexes for the given formats.

This takes an object with the following schema:

```ts
{
  "FORMAT_1": [
    "REGEX_1",
    // Language conditional regex:
    {
      "regex": "REGEX_2",
      // "languages" field works like the "languages" setting
      "languages": ["LANGUAGE_1", "LANGUAGE_2"],
      // "remap" is used for when the order of the properties is shuffled in the regex (e.g., "alpha" is the first captured value)
      "remap": [3,0,1,2]
    }
  ],
  "FORMAT_2": ["REGEX_3"]
}
```

### Values

#### \<FORMAT\>:

Is one of "formatsTo" ("cmyk", "hex", "hsl", "hwb", "named", "rgb", "hex0x", "lab", "lch", "oklab", "oklch", "a98")

#### \<REGEX\>:

Is an escaped regex expression that matches the values of the color, and an optional alpha value (3 to 5 values, depending on the format).
The values MUST be in the same format as in the standard presentation (can't pass a percentage value into a property that would typically only accept decimals, otherwise there could be unexpected outcomes).

- Recommendation: test the standard presentations to check the allowed color properties of presentations

Here is a table with the standard presentations of each color format property (this follows closely the [W3C standards](https://www.w3.org/TR/css-color-4/))

| Color Formats        | Properties          | Presentations                            | Examples                                      |
| -------------------- | ------------------- | ---------------------------------------- | --------------------------------------------- |
| _ALL FORMATS_        | alpha (default = 1) | 0...1 / Percentage                       | '0.5', '50%'                                  |
| RGB                  | r, g, b             | 0...255 / Percentage                     | '123', '50%'                                  |
| A98                  | r, g, b             | 0...1                                    | '0.5'                                         |
| HSL, HWB, LCH, OKLCH | h                   | 0...360 / Percentage / Grad / Rad / Turn | '180', '50%', '200grad', '3.14rad', '0.5turn' |
| HSL                  | s, l                | 0...1 / Percentage                       | '0.5', '50%'                                  |
| HWB                  | w, b                | 0...1 / Percentage                       | '0.5', '50%'                                  |
| LAB, LCH             | l                   | 0...100 / Percentage                     | '50', '50%'                                   |
| LAB                  | a, b                | -125...125 / Percentage -100%...100%     | '-62.5', '-50%'                               |
| LCH                  | c                   | 0...150 / Percentage                     | '75', '50%'                                   |
| OKLAB, OKLCH         | l                   | 0...1 / Percentage                       | '0.5', '50%'                                  |
| OKLAB                | a, b                | -0.4...0.4 / Percentage -100%...100%     | '-0.2', '-50%'                                |
| OKLCH                | c                   | 0...0.4 / Percentage                     | '0.2', '50%'                                  |
| CMYK                 | c, m, y, k          | 0...1 / Percentage                       | '0.5', '50%'                                  |

Here is a rgb regex example where we match r, g, and b values, and an optional alpha. Note that it's missing percentage support.

```json
"my-rgb\\((\\d+(?:\\.\\d+)?) \\$ (\\d+(?:\\.\\d+)?) \\$ (\\d+(?:\\.\\d+)?)(?: \\$ (\\d+(?:\\.\\d+)?))?\\)"
```

#### Regex Tips:

- Double quotes (") and backslashes (\\) are escaped with a backslash (\\).
- The regex capture groups must only capture the required values, and the optional one (alpha) if desired
- https://regexper.com/ This website is a great way to visualize and tweak regexes. [Here](https://regexper.com/#my-rgb%5C%28%28%5Cd%2B%28%3F%3A%5C.%5Cd%2B%29%3F%29%20%5C%24%20%28%5Cd%2B%28%3F%3A%5C.%5Cd%2B%29%3F%29%20%5C%24%20%28%5Cd%2B%28%3F%3A%5C.%5Cd%2B%29%3F%29%28%3F%3A%20%5C%24%20%28%5Cd%2B%28%3F%3A%5C.%5Cd%2B%29%3F%29%29%3F%5C%29) is the regex above visualized there. Note that **escape backslashes (\\) MUST be removed** when entering the regex there

## Duplication Issue

[#68](https://github.com/jeronimoek/color-picker-universal/issues/68) When working with **css**, **less**, **sass**, and **scss** files, the color picker is duplicated due to the default built-in Vscode color picker. To avoid this, you can set the `color-picker-universal.avoidDuplicate` setting to **true** (see [Settings](#-settings)). Note that by doing this, on these default built-in color pickers, the extension's formats and configurations won't apply

![Duplicated picker in css file](images/css-duplication.png)
