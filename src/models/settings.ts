import {
  A98,
  CMYK,
  Color,
  HEX,
  HSL,
  HWB,
  LAB,
  LCH,
  OKLAB,
  OKLCH,
  RGB,
} from "color-translate";

interface CustomRegexSetting {
  regex: string;
  languages: string[];
  remap?: number[];
}

export type CustomRegexesSetting = Record<
  string,
  (string | CustomRegexSetting)[]
>;

interface ValueProperties {
  from?: number;
  to?: number;
  suffix?: string;
  maxDigits?: number;
}

interface CustomOutput<T extends Color> {
  files?: string[];
  template?: string;
  templateWithAlpha?: string;
  values?: { [keyof in keyof T]?: ValueProperties };
}

export interface CustomOutputsSetting {
  [ColorOutput.RGB]?: CustomOutput<RGB<number>>[];
  [ColorOutput.HEX]?: CustomOutput<HEX>[];
  [ColorOutput.HEX_0x]?: CustomOutput<HEX>[];
  [ColorOutput.HSL]?: CustomOutput<HSL<number>>[];
  [ColorOutput.HWB]?: CustomOutput<HWB<number>>[];
  [ColorOutput.LAB]?: CustomOutput<LAB<number>>[];
  [ColorOutput.LCH]?: CustomOutput<LCH<number>>[];
  [ColorOutput.OKLAB]?: CustomOutput<OKLAB<number>>[];
  [ColorOutput.OKLCH]?: CustomOutput<OKLCH<number>>[];
  [ColorOutput.CMYK]?: CustomOutput<CMYK<number>>[];
  [ColorOutput.A98]?: CustomOutput<A98<number>>[];
}

enum ColorOutput {
  A98 = "a98",
  RGB = "rgb",
  HEX = "hex",
  HEX_0x = "hex0x",
  HSL = "hsl",
  HWB = "hwb",
  LAB = "lab",
  LCH = "lch",
  OKLAB = "oklab",
  OKLCH = "oklch",
  CMYK = "cmyk",
}
