import ColorTranslator from "color-translate";
import { getSetting } from "./utils/helpers";

export class ColorTranslatorExtended extends ColorTranslator {
  constructor(...input: ConstructorParameters<typeof ColorTranslator>) {
    const maxDigits = getSetting<number>("maxDigits");
    const [colorInput, options] = input;
    super(colorInput, { ...options, maxDigits });
  }
}
