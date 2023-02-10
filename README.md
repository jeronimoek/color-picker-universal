# 🌌 Color Picker Universal 🌌

## Features

![feature X](images/demo.png)

## This extension contributes the following settings:

To see settings press `CTRL + ,` OR `⌘ + ,`

| Id                                 | Description                                                | Default | Available values                                                                                            | Example                           |
| ---------------------------------- | ---------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- |
| color-picker-universal.enable      | Controls if plugin is enabled                              | true    | true false                                                                                                  | true                              |
| color-picker-universal.languages   | Enabled language identifiers. Use "!" to exclude languages | ["\*"]  | [Default identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers) | ["\*", "!markdown", "!plaintext"] |
| color-picker-universal.formatsFrom | Enabled formats to translate from                          | ["\*"]  | "\*" "cmyk" "hex" "hsl" "named" "rgb" "hwb"                                                                 | ["rgb", "hex"]                    |
| color-picker-universal.formatsTo   | Enabled formats to translate into                          | ["\*"]  | "\*" "cmyk" "hex" "hsl" "rgb" "hwb"                                                                         | ["rgb", "hex"]                    |

## This extension contributes the following commands:

To see commands press `F1` and type `Color Picker Universal`

| Name                               | Description                |
| ---------------------------------- | -------------------------- |
| Translate colors to another format | Multiple color translation |

## This extension contributes the following editor's context menu options:

To see the editor's context menu options press `right click` inside a file content's editor

| Name                               | Description                |
| ---------------------------------- | -------------------------- |
| Translate colors to another format | Multiple color translation |
