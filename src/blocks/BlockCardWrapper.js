import { html } from "htm/preact";
import { ICONS } from "../components/icons.js";

/**
 * Common card container wrapper for PortableText blocks with action toolbar.
 *
 * @param {object} props
 * @param {string} props.typeName - Block type identifier.
 * @param {string} props.title - Human-readable title for the block header.
 * @param {object} [props.icon] - Icon JSX or string.
 * @param {object} [props.value] - Block JSON value.
 * @param {Array} [props.path] - Tree path inside PortableText document.
 * @param {import('htm/preact').Html} props.children - Custom block preview body.
 */
export function BlockCardWrapper({ typeName, title, icon, value, path, children }) {
  const dispatchAction = (eventName, e) => {
    e.preventDefault();
    e.stopPropagation();

    const event = new CustomEvent(eventName, {
      detail: { value, path },
      bubbles: true,
      composed: true,
    });
    e.target.dispatchEvent(event);
  };

  const blockIcon = icon || ICONS[typeName] || ICONS.puzzle;

  return html`
    <div class="pe-block-card" data-block-type=${typeName} tabIndex="0">
      <div class="pe-block-card-header">
        <div class="pe-block-card-title-area">
          <span class="pe-block-card-icon">${blockIcon}</span>
          <span class="pe-block-card-name">${title}</span>
        </div>
        <div class="pe-block-card-actions">
          <button
            type="button"
            class="pe-block-action-btn pe-action-up"
            title="Move Up"
            onClick=${(e) => dispatchAction("pe-move-block-up", e)}
          >
            ↑
          </button>
          <button
            type="button"
            class="pe-block-action-btn pe-action-down"
            title="Move Down"
            onClick=${(e) => dispatchAction("pe-move-block-down", e)}
          >
            ↓
          </button>
          <button
            type="button"
            class="pe-block-action-btn pe-action-duplicate"
            title="Duplicate Block"
            onClick=${(e) => dispatchAction("pe-duplicate-block", e)}
          >
            📋
          </button>
          <button
            type="button"
            class="pe-block-action-btn pe-action-delete"
            title="Delete Block"
            onClick=${(e) => dispatchAction("pe-delete-block", e)}
          >
            🗑
          </button>
          <button
            type="button"
            class="pe-block-card-edit-btn"
            title="Edit Options"
            onClick=${(e) => dispatchAction("pe-edit-block", e)}
          >
            Edit
          </button>
        </div>
      </div>
      <div class="pe-block-card-body">${children}</div>
    </div>
  `;
}
