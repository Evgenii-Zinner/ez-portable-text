import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Fallback block renderer for unrecognized custom block types.
 *
 * @param {object} props
 * @param {object} props.value - Block JSON value.
 * @param {object} props.schemaType - Compiled schema definition.
 * @param {Array} props.path - Document tree path.
 */
export function FallbackBlock({ value, schemaType, path }) {
  const typeName = value?._type || schemaType?.name || "customBlock";
  const blockTitle =
    schemaType?.title || typeName.charAt(0).toUpperCase() + typeName.slice(1);

  const keys = Object.keys(value || {}).filter((k) => !k.startsWith("_"));

  return html`
    <${BlockCardWrapper}
      typeName=${typeName}
      title=${blockTitle}
      icon=${ICONS.puzzle}
      value=${value}
      path=${path}
    >
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
    <//>
  `;
}
