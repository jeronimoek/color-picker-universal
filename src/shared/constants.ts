import { ColorFormat } from "../utils/enums";

export const Regex = {
  NewLine: /\r?\n/g,
  ExactNewLine: /^\r?\n$/g,
  LastLineMatch: /(?:\r?\n)?(.+)$/,
};

export const colorFormats = Object.values(ColorFormat);

export const colorFormatsWithoutAlpha = colorFormats.filter(
  (rep) => rep[rep.length - 1] === "A"
);
