import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Hero Banner Block component (1200x675 px recommended aspect).
 *
 * @param {object} props
 * @param {object} props.value - Hero block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function HeroBlock({ value, schemaType, path }) {
  const title = value?.title || "";
  const subtitle = value?.subtitle || "";
  const imageUrl = value?.imageUrl || "";

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
      typeName="hero"
      title=${schemaType?.title || "Hero Banner (1200x675)"}
      icon=${ICONS.puzzle}
      value=${value}
      path=${path}
    >
      <div
        class="pe-preview-hero-wrapper"
        style=${imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      >
        <div class="pe-preview-hero-overlay">
          <input
            type="text"
            class="pe-hero-title-input"
            placeholder="Hero Title..."
            value=${title}
            onInput=${(e) => dispatchUpdate({ title: e.target.value }, e.target)}
          />
          <input
            type="text"
            class="pe-hero-subtitle-input"
            placeholder="Hero Subtitle..."
            value=${subtitle}
            onInput=${(e) => dispatchUpdate({ subtitle: e.target.value }, e.target)}
          />
        </div>
      </div>
      <div class="pe-hero-meta-bar">
        <span class="pe-hero-badge">1200 × 675 px Recommended</span>
        <input
          type="text"
          class="pe-inline-input"
          placeholder="Background Image URL (http...)"
          value=${imageUrl}
          onInput=${(e) => dispatchUpdate({ imageUrl: e.target.value }, e.target)}
        />
      </div>
    <//>
  `;
}
