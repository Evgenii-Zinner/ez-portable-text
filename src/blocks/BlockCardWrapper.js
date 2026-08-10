import { html } from "htm/preact";
import { ICONS } from "../components/icons.js";

/**
 * Common card container wrapper for custom PortableText blocks.
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
  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const event = new CustomEvent("pe-edit-block", {
      detail: { value, path },
      bubbles: true,
      composed: true,
    });
    e.target.dispatchEvent(event);
  };

  const blockIcon = icon || ICONS[typeName] || ICONS.puzzle;

  return html`
    <div class="pe-block-card" data-block-type=${typeName}>
      <div class="pe-block-card-header">
        <div class="pe-block-card-title-area">
          <span class="pe-block-card-icon">${blockIcon}</span>
          <span class="pe-block-card-name">${title}</span>
        </div>
        <div class="pe-block-card-actions">
          <button class="pe-block-card-edit-btn" onClick=${handleEditClick}>
            Edit Block
          </button>
        </div>
      </div>
      <div class="pe-block-card-body">${children}</div>
    </div>
  `;
}
