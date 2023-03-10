# 🌌 Color Picker Universal 🌌

## ✅ Features

Pick and translate between multiple color formats, in any file.

Formats supported: rgb/a, hex/a, hsl/a, hwb/a, cmyk/a, and named colors.

This extension can be used through its color pickers, commands, or context menu options.

![Demo](images/demo.gif)

## ⚙ Settings

To see settings press `CTRL + ,` OR `⌘ + ,`

| Id                                 | Description                                                                                                                                                | Default         | Available values                                                                                            | Example                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| color-picker-universal.disable     | Controls if plugin is disabled                                                                                                                             | false           | true false                                                                                                  | true                                      |
| color-picker-universal.strictAlpha | If enabled, when bulk translating color formats, if the target format includes Alpha (e.g. RGBA), alpha will be by default 1, otherwise it will be trimmed | true            | true false                                                                                                  | false                                     |
| color-picker-universal.languages   | Enabled language identifiers. Use "!" to exclude languages                                                                                                 | ["\*"]          | [Default identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers) | ["\*", "!css", "!less", "!sass", "!scss"] |
| color-picker-universal.formatsFrom | Enabled formats to translate from. Use "!" to exclude formats                                                                                              | ["\*"]          | "\*" "cmyk" "hex" "hsl" "hwb" "named" "rgb"                                                                 | ["*", "!named"]                           |
| color-picker-universal.formatsTo   | Enabled formats to translate into. Use "!" to exclude formats                                                                                              | ["\*", "!cmyk"] | "\*" "cmyk" "hex" "hsl" "hwb" "named" "rgb"                                                                 | ["*", "!cmyk", "!hwb"]                    |

## ✍ Commands

To see commands press `F1` and type `Color Picker Universal`

| Name                               | Description                   |
| ---------------------------------- | ----------------------------- |
| Translate colors to another format | Bulk color format translation |

## 🗨 Editor's context menu options

To see the editor's context menu options press `right click` inside a file content's editor

| Name                               | Description                   |
| ---------------------------------- | ----------------------------- |
| Translate colors to another format | Bulk color format translation |

## 🐞 Known Issues

[#68](https://github.com/jeronimoek/color-picker-universal/issues/68) When working with **css**, **less**, **sass** and **scss** files, the color picker is duplicated due to the default Vscode color picker. Currently the only workaround is excluding these file extensions in the `color-picker-universal.languages` setting (see example value above)

![Duplicated picker in css file](images/css-duplication.png)

## 🌐 Links

[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=JeronimoEkerdt.color-picker-universal)

[Open VSX Registry](https://open-vsx.org/extension/JeronimoEkerdt/color-picker-universal)

[Github Repository](https://github.com/jeronimoek/color-picker-universal)
