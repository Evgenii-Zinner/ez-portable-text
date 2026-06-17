/**
 * Tracks and restores browser selection ranges during focus shifts.
 */
export class RangeManager {
  /**
   * @param {HTMLElement} canvas - Visual editor contenteditable canvas.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.cachedRange = null;
  }

  /**
   * Caches the active selection range if it resides inside the canvas.
   * @returns {boolean} True if successfully saved.
   */
  save() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (this.canvas.contains(range.commonAncestorContainer)) {
        this.cachedRange = range.cloneRange();
        return true;
      }
    }
    return false;
  }

  /**
   * Restores focus to the cached selection range.
   * @returns {void}
   */
  restore() {
    if (!this.cachedRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.cachedRange);
  }

  /**
   * Restores the range, inserts a node at the cursor, and collapses selection.
   * @param {HTMLElement} node - Element node to insert.
   * @returns {void}
   */
  insertNode(node) {
    this.restore();
    if (this.cachedRange) {
      this.cachedRange.insertNode(node);
      this.cachedRange.collapse(false);
      this.save();
    }
  }
}
