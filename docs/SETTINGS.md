# SETTINGS EXAMPLES

## Light value of oklch colours as a percentage value

```json
{
  ...
  "color-picker-universal.customOutputs": {
    "oklch":[{
      "values": {
        "l":{
          "to": 100,
          "suffix": "%"
        }
      }
    }],
  },
  ...
}
```

## XAML a/Hex support

```json
{
  ...
  "color-picker-universal.formatsFrom": ["*","!hex"],
  "color-picker-universal.formatsTo": ["*","!hex"],
  "color-picker-universal.customOutputs": {
    "hex":[{
      "files": [
        "xml",
      ],
      "templateWithAlpha": "#{{alpha}}{{r}}{{g}}{{b}}"
    }],
  },
  "color-picker-universal.customRegexes": {
    "hex":[
      {
        "regex": "#([\\da-fA-F]{2})([\\da-fA-F]{2})([\\da-fA-F]{2})([\\da-fA-F]{0,2})",
        "languages": [
          "*","!xml",
        ],
      },
      {
        "regex": "#([\\da-fA-F]{0,2})([\\da-fA-F]{2})([\\da-fA-F]{2})([\\da-fA-F]{2})",
        "languages": [
          "xml",
        ],
        "remap": [1,2,3,0]
      },
    ]
  },
  ...
}
```

## Variable maxDigits in oklch and hsl

```json
{
  ...
  "color-picker-universal.customOutputs": {
    "oklch":[{
      "values": {
        "l":{
          "maxDigits": 3,
        },
        "c":{
          "maxDigits": 3,
        }
      }
    }],
    "hsl":[{
      "values": {
        "h":{
          "maxDigits": 0,
        }
      }
    }],
  },
  ...
}
```

## Uppercase rgb prefix

```json
{
  ...
  "color-picker-universal.customOutputs": {
    "rgb":[{
      "files": [
        "xml",
      ],
      "template": "RGB({{r}}, {{g}}, {{b}})",
      "templateWithAlpha": "RGB({{r}}, {{g}}, {{b}}, {{alpha}})",
    }],
  },
  ...
}
```
