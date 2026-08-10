import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Image Block component with inline caption/alt fields and PageSpeed cropper.
 *
 * @param {object} props
 * @param {object} props.value - Image block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function ImageBlock({ value, schemaType, path }) {
  const [showCropper, setShowCropper] = useState(false);
  const url = value?.url || "";
  const alt = value?.alt || "";
  const caption = value?.caption || "";

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleCroppedSave = (croppedUrl) => {
    setShowCropper(false);
    const eventEl = document.querySelector(`[data-block-type="image"]`);
    if (eventEl) {
      dispatchUpdate({ url: croppedUrl }, eventEl);
    }
  };

  return html`
    <${BlockCardWrapper}
      typeName="image"
      title=${schemaType?.title || "Image (1200x675)"}
      icon=${ICONS.image}
      value=${value}
      path=${path}
    >
      <div class="pe-preview-image-wrapper">
        ${url
          ? html`<img class="pe-preview-image" src=${url} alt=${alt} />`
          : html`<div class="pe-preview-placeholder">
              No Image URL provided
            </div>`}
      </div>

      <div class="pe-image-meta-fields">
        <div class="pe-inline-field-row">
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Image URL (http...)"
            value=${url}
            onInput=${(e) => dispatchUpdate({ url: e.target.value }, e.target)}
          />
          ${url &&
          html`<button
            type="button"
            class="pe-crop-btn"
            onClick=${() => setShowCropper(true)}
          >
            ✂️ Crop & Resize
          </button>`}
        </div>

        <div class="pe-inline-field-row">
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Alt text (accessibility)..."
            value=${alt}
            onInput=${(e) => dispatchUpdate({ alt: e.target.value }, e.target)}
          />
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Caption..."
            value=${caption}
            onInput=${(e) => dispatchUpdate({ caption: e.target.value }, e.target)}
          />
        </div>
      </div>

      ${showCropper &&
      html`<${CropperModal}
        imageUrl=${url}
        onCropSave=${handleCroppedSave}
        onClose=${() => setShowCropper(false)}
      />`}
    <//>
  `;
}
