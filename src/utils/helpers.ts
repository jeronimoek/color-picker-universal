import { ColorType } from "./enums";

export function getColorType(color: string, hasAlpha: boolean): ColorType {
  const start = color.split("(")[0];
  let type: ColorType;
  switch (start) {
    case "rgb":
    case "rgba":
      type = hasAlpha ? ColorType.RGBA : ColorType.RGB;
      break;
    case "hsl":
    case "hsla":
      type = hasAlpha ? ColorType.HSLA : ColorType.HSL;
      break;
    case "device-cmyk":
    case "cmyk":
      type = hasAlpha ? ColorType.CMYKA : ColorType.CMYK;
      break;
    default:
      type = hasAlpha ? ColorType.HEXA : ColorType.HEX;
      break;
  }
  return type;
}
