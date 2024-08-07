import ColorTranslator from "color-translate";
import { getSetting } from "./utils/helpers";

function deltaE(
  labA: [number, number, number],
  labB: [number, number, number]
) {
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] ** 2 + labA[2] ** 2);
  let c2 = Math.sqrt(labB[1] ** 2 + labB[2] ** 2);
  let deltaC = c1 - c2;
  let deltaH = deltaA ** 2 + deltaB ** 2 - deltaC ** 2;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / 1.0;
  let deltaCkcsc = deltaC / sc;
  let deltaHkhsh = deltaH / sh;
  let i = deltaLKlsl ** 2 + deltaCkcsc ** 2 + deltaHkhsh ** 2;
  return i < 0 ? 0 : Math.sqrt(i);
}

export class ColorTranslatorExtended extends ColorTranslator {
  constructor(...input: ConstructorParameters<typeof ColorTranslator>) {
    const maxDigits = getSetting<number>("maxDigits");
    const [colorInput, options] = input;
    super(colorInput, { ...options, maxDigits });
  }
}
