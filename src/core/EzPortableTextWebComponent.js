import { html, render } from "htm/preact";
import { EditorWrapper } from "../components/EditorWrapper.js";

/**
 * EzPortableTextWebComponent is a custom HTML element wrapper for Portable Text.
 * It integrates the EditorWrapper component with Preact and dispatches 'change' events.
 *
 * @extends HTMLElement
 */
export class EzPortableTextWebComponent extends HTMLElement {
  constructor() {
    super();
    this._value = undefined;
    this._customBlocks = [];
    this._isMounted = false;
    this._editorRef = null;
    this._hasLoadedValue = false;
  }

  /**
   * Getter for customBlocks array.
   *
   * @returns {Array} List of custom block type configurations.
   */
  get customBlocks() {
    return this._customBlocks || [];
  }

  /**
   * Setter for customBlocks array.
   *
   * @param {Array} newValue - List of custom block configurations.
   */
  set customBlocks(newValue) {
    this._customBlocks = Array.isArray(newValue) ? [...newValue] : [];
    if (this._isMounted) {
      this._render();
    }
  }

  /**
   * Registers a new custom block type configuration dynamically.
   *
   * @param {object} config - The block configuration.
   * @param {string} config.name - The unique block type identifier (e.g. 'hero').
   * @param {string} [config.title] - The display label.
   * @param {string} [config.icon] - The visual icon indicator.
   * @param {object} [config.defaultValue] - Default data properties.
   * @returns {void}
   */
  registerBlockType(config) {
    if (!this._customBlocks) {
      this._customBlocks = [];
    }
    const exists = this._customBlocks.some((b) => b.name === config.name);
    if (!exists) {
      this._customBlocks = [
        ...this._customBlocks,
        {
          name: config.name,
          title: config.title || config.name,
          icon: config.icon || "🧩",
          defaultValue: config.defaultValue || {},
        },
      ];
      if (this._isMounted) {
        this._render();
      }
    }
  }

  /**
   * Lifecycle callback fired when element is mounted into DOM.
   *
   * @returns {void}
   */
  connectedCallback() {
    this._isMounted = true;
    this._hasLoadedValue = false;

    // Parse initial value from text content or attribute
    if (!this._value) {
      try {
        const rawContent = this.textContent.trim();
        if (rawContent) {
          this._value = JSON.parse(rawContent);
        }
      } catch (e) {
        console.error(
          "EzPortableText: Failed to parse initial JSON content",
          e,
        );
      }
    }

    // Clear initial content
    this.innerHTML = "";

    // Set up internal custom event listener for card edit clicks
    this.addEventListener("pe-edit-block", this._handleInternalEdit);

    // Stop native change events from bubbling up and confusing consumers
    this.addEventListener("change", this._handleInternalChange);

    this._render();
  }

  /**
   * Lifecycle callback fired when element is removed from DOM.
   *
   * @returns {void}
   */
  disconnectedCallback() {
    this._isMounted = false;
    this.removeEventListener("pe-edit-block", this._handleInternalEdit);
    this.removeEventListener("change", this._handleInternalChange);
    render(null, this);
  }

  /**
   * Getter for the current PortableText block array.
   *
   * @returns {Array|undefined} PortableText block values.
   */
  get value() {
    return this._value;
  }

  /**
   * Setter to update the current editor value.
   *
   * @param {Array} newValue - The new PortableText JSON block array.
   */
  set value(newValue) {
    this._value = newValue;
    if (this._editorRef) {
      this._editorRef.send({ type: "update value", value: newValue });
      this._hasLoadedValue = true;
    } else if (this._isMounted) {
      this._render();
    }
  }

  /**
   * Updates a specific block within the value structure.
   *
   * @param {Array} path - Tree path of the block (usually containing key).
   * @param {object} newValue - The new properties to merge/assign to the block.
   * @returns {void}
   */
  updateBlock(path, newValue) {
    const key = path[0]?._key;
    if (!key) return;

    if (!Array.isArray(this._value)) return;

    const updatedValue = this._value.map((block) => {
      if (block._key === key) {
        return {
          ...block,
          ...newValue,
          _key: key, // preserve block key
        };
      }
      return block;
    });

    this._value = updatedValue;

    if (this._editorRef) {
      this._editorRef.send({ type: "update value", value: updatedValue });
    } else if (this._isMounted) {
      this._render();
    }
  }

  /**
   * Programmatically inserts a custom block object at the selection focus point.
   *
   * @param {string|object} type - The block type identifier name or definition object.
   * @param {object} [value={}] - Initial property values for the block.
   * @returns {void}
   */
  insertBlock(type, value = {}) {
    if (this._editorRef) {
      const typeName = typeof type === "string" ? type : type.name;
      this._editorRef.send({
        type: "insert.block",
        block: {
          _type: typeName,
          ...value,
        },
        placement: "auto",
      });
      this._editorRef.send({ type: "focus" });
    }
  }

  /**
   * Intercepts internal card edit clicks and forwards them to parent document context.
   *
   * @private
   * @param {CustomEvent} e - Bubbling custom event containing card data.
   * @returns {void}
   */
  _handleInternalEdit = (e) => {
    e.stopPropagation();
    const { value, path } = e.detail;

    this.dispatchEvent(
      new CustomEvent("edit-block", {
        detail: {
          value,
          path,
          update: (newValue) => this.updateBlock(path, newValue),
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Intercepts native change events and stops them from bubbling up.
   *
   * @private
   * @param {Event} e - Native change event.
   * @returns {void}
   */
  _handleInternalChange = (e) => {
    if (e.target !== this) {
      e.stopImmediatePropagation();
    }
  };

  /**
   * Dispatches change event to external component listeners.
   *
   * @private
   * @param {Array} newValue - Updated block array value.
   * @returns {void}
   */
  _handleChange = (newValue) => {
    // Avoid overwriting populated initial value with transient empty states during initialization
    if (
      Array.isArray(newValue) &&
      newValue.length === 0 &&
      this._value &&
      this._value.length > 0 &&
      !this._hasLoadedValue
    ) {
      return;
    }

    if (Array.isArray(newValue) && newValue.length > 0) {
      this._hasLoadedValue = true;
    }

    this._value = newValue;

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Renders the Preact components inside the custom element container.
   *
   * @private
   * @returns {void}
   */
  _render() {
    render(
      html`<${EditorWrapper}
        initialValue=${this._value}
        onChange=${this._handleChange}
        customBlocks=${this._customBlocks}
        onEditorInit=${(editor) => {
          this._editorRef = editor;
          if (this._value && this._value.length > 0) {
            editor.send({ type: "update value", value: this._value });
          }
        }}
      />`,
      this,
    );
  }
}

if (!customElements.get("ez-portable-text")) {
  customElements.define("ez-portable-text", EzPortableTextWebComponent);
}
