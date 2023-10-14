import { Position } from "vscode";
import { clamp } from "../utils/utils";

/**
 * Represents a textual document.
 */
export class Document {
  private text: string;
  private lineOffsets: number[];

  constructor(text: string) {
    this.text = text;
    this.lineOffsets = this.getLineOffsets();
  }

  /**
   * Get the text content of the document
   */
  getText(): string {
    return this.text;
  }

  /**
   * Set the text content of the document
   * @param text The new text content
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * Current version of the document.
   */
  public version = 0;

  /**
   * Get the length of the document's content
   */
  getTextLength(): number {
    return this.getText().length;
  }

  /**
   * Update the text between two positions.
   * @param text The new text slice
   * @param start Start offset of the new text
   * @param end End offset of the new text
   */
  update(text: string, start: number, end: number): void {
    const content = this.getText();
    this.setText(content.slice(0, start) + text + content.slice(end));
  }

  /**
   * Get the line and character based on the offset
   * @param offset The index of the position
   */
  positionAt(offset: number): Position {
    offset = clamp(offset, 0, this.getTextLength());

    let low = 0;
    let high = this.lineOffsets.length;
    if (high === 0) {
      return new Position(0, offset);
    }

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    const line = low - 1;
    return new Position(line, offset - this.lineOffsets[line]);
  }

  /**
   * Get the index of the line and character position
   * @param position Line and character position
   */
  offsetAt(position: Position): number {
    if (position.line >= this.lineOffsets.length) {
      return this.getTextLength();
    } else if (position.line < 0) {
      return 0;
    }

    const lineOffset = this.lineOffsets[position.line];
    const nextLineOffset =
      position.line + 1 < this.lineOffsets.length
        ? this.lineOffsets[position.line + 1]
        : this.getTextLength();

    return clamp(nextLineOffset, lineOffset, lineOffset + position.character);
  }

  private getLineOffsets() {
    const lineOffsets = [];
    const text = this.getText();
    let isLineStart = true;

    for (let i = 0; i < text.length; i++) {
      if (isLineStart) {
        lineOffsets.push(i);
      }
      const ch = text.charAt(i);
      isLineStart = ch === "\r" || ch === "\n";
      if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
        i++;
      }
    }

    if (isLineStart && text.length > 0) {
      lineOffsets.push(text.length);
    }

    return lineOffsets;
  }

  get lineCount(): number {
    return this.getText().split(/\r?\n/).length;
  }

  languageId = "";
}
