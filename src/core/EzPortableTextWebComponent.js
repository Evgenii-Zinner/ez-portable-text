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
    // Use shadow DOM if you want isolation, but light DOM is easier for styling.
    // Let's use light DOM for now so global CSS applies cleanly.
    this._value = undefined;
    this._isMounted = false;
  }

  connectedCallback() {
    this._isMounted = true;

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

    this._render();
  }

  disconnectedCallback() {
    this._isMounted = false;
    // Unmount preact component
    render(null, this);
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
    if (this._isMounted) {
      this._render();
    }
  }

  _handleChange = (newValue) => {
    this._value = newValue;

    // Dispatch custom event for vanilla JS consumers (e.g., HTMX)
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      }),
    );
  };

  _render() {
    render(
      html`<${EditorWrapper}
        initialValue=${this._value}
        onChange=${this._handleChange}
      />`,
      this,
    );
  }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("ez-portable-text")) {
  customElements.define("ez-portable-text", EzPortableTextWebComponent);
}
