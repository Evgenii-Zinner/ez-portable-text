import { html } from "htm/preact";
import { ICONS } from "./icons.js";

/**
 * Card rendering component for custom block objects.
 *
 * @param {object} props - Component properties.
 * @param {object} props.value - Block JSON value.
 * @param {object} props.schemaType - The compiled schema definition for the block.
 * @param {Array} props.path - Document tree path.
 * @returns {import('htm/preact').Html} The card HTML structure.
 */
export function CustomBlockCard({ value, schemaType, path }) {
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

  const typeName = value?._type || schemaType?.name;
  const blockTitle =
    schemaType?.title || typeName.charAt(0).toUpperCase() + typeName.slice(1);

  let blockIcon = ICONS.puzzle;
  if (typeName === "image") blockIcon = ICONS.image;
  else if (typeName === "video") blockIcon = ICONS.video;
  else if (typeName === "table") blockIcon = ICONS.table;
  else if (typeName === "codeBlock") blockIcon = ICONS.codeBlock;
  else if (schemaType?.icon) {
    blockIcon =
      typeof schemaType.icon === "string"
        ? html`<span>${schemaType.icon}</span>`
        : schemaType.icon;
  }

  let previewContent = null;

  if (typeName === "image") {
    previewContent = html`
      <div class="pe-preview-image-wrapper">
        ${value?.url
          ? html`<img
              class="pe-preview-image"
              src=${value.url}
              alt=${value.alt || ""}
            />`
          : html`<div class="pe-preview-placeholder">
              No Image URL provided
            </div>`}
        ${value?.caption &&
        html`<div class="pe-preview-caption">${value.caption}</div>`}
      </div>
    `;
  } else if (typeName === "video") {
    previewContent = html`
      <div class="pe-preview-video-wrapper">
        <div class="pe-preview-video-info">
          <span class="pe-video-play-icon">▶</span>
          <span class="pe-video-url"
            >${value?.url || "No Video URL provided"}</span
          >
        </div>
        ${value?.caption &&
        html`<div class="pe-preview-caption">${value.caption}</div>`}
      </div>
    `;
  } else if (typeName === "table") {
    const rows = value?.rows || [];
    previewContent = html`
      <div class="pe-preview-table-wrapper">
        <table class="pe-preview-table">
          <tbody>
            ${rows.map(
              (row, rIdx) => html`
                <tr key=${row._key || rIdx}>
                  ${(row.cells || []).map(
                    (cell, cIdx) => html`
                      <td key=${cIdx}>
                        ${cell || html`<span class="pe-td-empty">—</span>`}
                      </td>
                    `,
                  )}
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  } else if (typeName === "codeBlock") {
    previewContent = html`
      <div class="pe-preview-code-wrapper">
        <div class="pe-code-header">
          <span class="pe-code-lang">${value?.language || "javascript"}</span>
          ${value?.filename &&
          html`<span class="pe-code-file">${value.filename}</span>`}
        </div>
        <pre class="pe-code-body"><code>${value?.code ||
        "// No code entered"}</code></pre>
      </div>
    `;
  } else {
    const keys = Object.keys(value || {}).filter((k) => !k.startsWith("_"));
    previewContent = html`
      <div class="pe-preview-generic-wrapper">
        ${keys.length === 0
          ? html`<div class="pe-preview-placeholder">Empty Block Data</div>`
          : html`
              <div class="pe-generic-grid">
                ${keys.map(
                  (k) => html`
                    <div class="pe-generic-row" key=${k}>
                      <span class="pe-generic-key">${k}:</span>
                      <span class="pe-generic-val">${String(value[k])}</span>
                    </div>
                  `,
                )}
              </div>
            `}
      </div>
    `;
  }

  return html`
    <div class="pe-block-card" data-block-type=${typeName}>
      <div class="pe-block-card-header">
        <div class="pe-block-card-title-area">
          <span class="pe-block-card-icon">${blockIcon}</span>
          <span class="pe-block-card-name">${blockTitle}</span>
        </div>
        <button class="pe-block-card-edit-btn" onClick=${handleEditClick}>
          Edit Block
        </button>
      </div>
      <div class="pe-block-card-body">${previewContent}</div>
    </div>
  `;
}

/**
 * Standard block renderer interceptor routing custom block objects to Visual Cards.
 *
 * @param {object} props - Editor render block properties.
 * @returns {import('htm/preact').Html} Visual output element.
 */
export function renderBlock(props) {
  const { schemaType, value, children, path } = props;

  if (schemaType.name === "block") {
    return children;
  }

  return html`<${CustomBlockCard}
    value=${value}
    schemaType=${schemaType}
    path=${path}
  />`;
}
