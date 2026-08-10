import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Embed Block component.
 *
 * @param {object} props
 * @param {object} props.value - Embed block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function EmbedBlock({ value, schemaType, path }) {
  return html`
    <${BlockCardWrapper}
      typeName="embed"
      title=${schemaType?.title || "Embed"}
      icon=${ICONS.puzzle}
      value=${value}
      path=${path}
    >
      <div class="pe-preview-video-wrapper">
        <div class="pe-preview-video-info">
          <span class="pe-video-play-icon">🔗</span>
          <span class="pe-video-url"
            >${value?.url || "No Embed URL provided"}</span
          >
        </div>
      </div>
    <//>
  `;
}
