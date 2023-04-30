import * as vscode from "vscode";
import { QuickPickItem } from "vscode";
import { MultiStepInput } from "../multiStepInput";
import { colorFormatsWithAlpha } from "../shared/constants";
import { ColorFormatTo, CommandType } from "../utils/enums";
import { getSetting } from "../utils/helpers";

export async function translateColors() {
  const strictAlpha = getSetting<boolean>("strictAlpha");

  const title = "Translate colors";

  let formats = [...Object.values(ColorFormatTo)] as const;
  if (strictAlpha === false) {
    formats = formats.filter(
      (format) => !colorFormatsWithAlpha.includes(format)
    );
  }
  const formatItems: QuickPickItem[] = formats.map((label) => ({ label }));

  const areas = Object.values(CommandType);
  const formatAreas: QuickPickItem[] = areas.map((label) => ({ label }));

  interface State {
    title: string;
    step: number;
    totalSteps: number;
    format: QuickPickItem;
    area: QuickPickItem;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run((input) => pickFormat(input, state));
    return state as State;
  }

  async function pickFormat(input: MultiStepInput, state: Partial<State>) {
    state.format = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: "Pick a format",
      items: formatItems,
      activeItem: state.format,
      shouldResume,
    });

    return (input: MultiStepInput) => pickArea(input, state);
  }

  async function pickArea(input: MultiStepInput, state: Partial<State>) {
    state.area = await input.showQuickPick({
      title,
      step: 2,
      totalSteps: 2,
      placeholder: "Pick an area",
      items: formatAreas,
      activeItem: state.area,
      shouldResume,
    });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {
      // noop
    });
  }

  return collectInputs();
}
