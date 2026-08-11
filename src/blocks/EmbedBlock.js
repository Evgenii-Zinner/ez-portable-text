import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Embed Block component with inline URL input line.
 *
 * @param {object} props
 * @param {object} props.value - Embed block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function EmbedBlock({ value, schemaType, path }) {
  const url = value?.url || "";

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  return html`
    <${BlockCardWrapper}
      typeName="embed"
      title=${schemaType?.title || "Embed"}
      icon=${ICONS.puzzle}
      value=${value}
      path=${path}
      hideEditBtn=${true}
    >
      <div class="pe-preview-video-wrapper">
        ${url
          ? html`
              <div class="pe-video-embed-container">
                <iframe src=${url} frameborder="0" allowfullscreen></iframe>
              </div>
            `
          : html`
              <div class="pe-preview-placeholder">
                Paste an Embed URL below (Codepen, Figma, Spotify, etc.)
              </div>
            `}
      </div>

      <div class="pe-image-meta-fields">
        <div class="pe-inline-field-row">
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Paste Embed URL (https://...)..."
            value=${url}
            onInput=${(e) => dispatchUpdate({ url: e.target.value }, e.target)}
          />
        </div>
      </div>
    <//>
  `;
}
