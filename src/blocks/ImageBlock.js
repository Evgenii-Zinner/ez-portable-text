import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Image Block component.
 *
 * @param {object} props
 * @param {object} props.value - Image block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function ImageBlock({ value, schemaType, path }) {
  return html`
    <${BlockCardWrapper}
      typeName="image"
      title=${schemaType?.title || "Image"}
      icon=${ICONS.image}
      value=${value}
      path=${path}
    >
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
    <//>
  `;
}
