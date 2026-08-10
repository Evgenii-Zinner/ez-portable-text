import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Video Block component.
 *
 * @param {object} props
 * @param {object} props.value - Video block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function VideoBlock({ value, schemaType, path }) {
  return html`
    <${BlockCardWrapper}
      typeName="video"
      title=${schemaType?.title || "Video"}
      icon=${ICONS.video}
      value=${value}
      path=${path}
    >
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
    <//>
  `;
}
