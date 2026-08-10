import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Hero Banner Block component.
 *
 * @param {object} props
 * @param {object} props.value - Hero block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function HeroBlock({ value, schemaType, path }) {
  return html`
    <${BlockCardWrapper}
      typeName="hero"
      title=${schemaType?.title || "Hero Banner"}
      icon=${ICONS.puzzle}
      value=${value}
      path=${path}
    >
      <div
        class="pe-preview-hero-wrapper"
        style=${value?.imageUrl
          ? { backgroundImage: `url(${value.imageUrl})` }
          : {}}
      >
        <div class="pe-preview-hero-overlay">
          <h3 class="pe-preview-hero-title">${value?.title || "Hero Title"}</h3>
          <p class="pe-preview-hero-subtitle">
            ${value?.subtitle || "Hero Subtitle"}
          </p>
        </div>
      </div>
    <//>
  `;
}
