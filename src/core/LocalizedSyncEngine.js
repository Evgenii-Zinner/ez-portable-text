/**
 * Localized sync engine that monitors DOM mutations and triggers callbacks.
 */
export class LocalizedSyncEngine {
  /**
   * @param {HTMLElement} canvas - The editor contenteditable element.
   * @param {function(string, HTMLElement): void} onBlockUpdate - Callback when a block is modified.
   * @param {function(string): void} onBlockDelete - Callback when a block is deleted.
   */
  constructor(canvas, onBlockUpdate, onBlockDelete) {
    this.canvas = canvas;
    this.onBlockUpdate = onBlockUpdate;
    this.onBlockDelete = onBlockDelete;

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(this.canvas, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  /**
   * Evaluates DOM mutations to identify altered or removed block nodes.
   * @param {MutationRecord[]} mutations - List of records from the observer.
   * @returns {void}
   */
  handleMutations(mutations) {
    const updatedKeys = new Set();
    const deletedKeys = new Set();

    for (const mutation of mutations) {
      // 1. Capture Deleted/Removed Blocks
      if (mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const key = node.getAttribute("data-block-key");
            if (key) {
              deletedKeys.add(key);
            } else {
              const nestedBlocks = node.querySelectorAll("[data-block-key]");
              nestedBlocks.forEach((nested) => {
                const nestedKey = nested.getAttribute("data-block-key");
                if (nestedKey) deletedKeys.add(nestedKey);
              });
            }
          }
        });
      }

      // 2. Capture Mutated Blocks
      let target = mutation.target;
      if (target.nodeType === Node.TEXT_NODE) {
        target = target.parentElement;
      }

      if (target) {
        const blockEl = target.closest("[data-block-key]");
        if (blockEl && this.canvas.contains(blockEl)) {
          const key = blockEl.getAttribute("data-block-key");
          if (key) updatedKeys.add(key);
        }
      }
    }

    // Process deletions first
    deletedKeys.forEach((key) => {
      if (!this.canvas.querySelector(`[data-block-key="${key}"]`)) {
        this.onBlockDelete(key);
      }
    });

    // Process updates
    updatedKeys.forEach((key) => {
      const el = this.canvas.querySelector(`[data-block-key="${key}"]`);
      if (el) {
        this.onBlockUpdate(key, el);
      }
    });
  }

  /**
   * Disconnects the observer instance.
   * @returns {void}
   */
  disconnect() {
    this.observer.disconnect();
  }
}
