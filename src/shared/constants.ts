import { Color } from "vscode";
import {
  ColorFormatFrom,
  ColorFormatTo,
  TemplateColorFragments,
} from "../utils/enums";

export const Regex = {
  NewLine: /\r?\n/g,
  ExactNewLine: /^\r?\n$/g,
  LastLineMatch: /(?:\r?\n)?(.+)$/,
};

export const colorFormatsTo = Object.values(ColorFormatTo);

export const colorFormatsFrom = Object.values(ColorFormatFrom);

export enum TestedColors {
  yellow = "yellow",
  black = "black",
}

export const colorsFragments = {
  yellow: {
    name: "yellow",
    hex: "ff0",
    aH: "f",
    HEX: "ffff00",
    AH: "ff",
    a: "1",
    r: "255",
    g: "255",
    b: "0",
    h: "60",
    s: "100%",
    l: "50%",
    c: "0%",
    m: "0%",
    y: "100%",
    k: "0%",
    v: "100%",
  },
  black: {
    name: "black",
    hex: "000",
    aH: "f",
    HEX: "000000",
    AH: "ff",
    a: "1",
    r: "0",
    g: "0",
    b: "0",
    h: "0",
    s: "100%",
    l: "0%",
    c: "0%",
    m: "0%",
    y: "0%",
    k: "100%",
    v: "0%",
  },
} satisfies Record<TestedColors, Record<TemplateColorFragments, string>>;

export const colorsRGBAValues = {
  yellow: {
    red: 1,
    green: 1,
    blue: 0,
    alpha: 1,
  },
  black: {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 1,
  },
} satisfies Record<TestedColors, Color>;

export const formatsBuiltinPicker = ["css", "less", "sass", "scss"];
