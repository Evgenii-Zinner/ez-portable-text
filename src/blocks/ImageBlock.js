import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Image Block component with Styled toggle switch,
 * local file upload, inline metadata fields, and portal-rendered cropper.
 *
 * @param {object} props
 * @param {object} props.value - Image block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function ImageBlock({ value, schemaType, path }) {
  const [showCropper, setShowCropper] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const fileInputRef = useRef(null);

  const url = value?.url || "";
  const alt = value?.alt || "";
  const caption = value?.caption || "";
  const isStyled = value?.variant !== "simple" && !value?.simple;

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropSource(event.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCroppedSave = (croppedUrl) => {
    setShowCropper(false);
    const cardEl = document.querySelector(`[data-block-type="image"]`);
    if (cardEl) {
      dispatchUpdate({ url: croppedUrl }, cardEl);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const headerActions = html`
    <label class="pe-toggle-switch" title="Toggle Styled vs Simple image frame">
      <input
        type="checkbox"
        checked=${isStyled}
        onChange=${(e) => {
          const checked = e.target.checked;
          dispatchUpdate(
            {
              variant: checked ? "styled" : "simple",
              simple: !checked,
            },
            e.target,
          );
        }}
      />
      <span class="pe-toggle-slider"></span>
      <span class="pe-toggle-label">Styled</span>
    </label>
    <button
      type="button"
      class="pe-block-action-btn"
      title="Upload Image"
      onClick=${triggerFileUpload}
    >
      ${ICONS.image}
    </button>
    <input
      type="file"
      ref=${fileInputRef}
      accept="image/*"
      style="display: none;"
      onChange=${handleFileSelect}
    />
  `;

  return html`
    <${BlockCardWrapper}
      typeName="image"
      title=${schemaType?.title || "Image"}
      icon=${ICONS.image}
      value=${value}
      path=${path}
      headerActions=${headerActions}
    >
      <div class="pe-preview-image-wrapper">
        ${url
          ? html`
              <div class="pe-image-display-container ${isStyled ? "pe-image-styled" : "pe-image-simple"}">
                <img class="pe-preview-image" src=${url} alt=${alt} />
              </div>
            `
          : html`
              <div class="pe-preview-placeholder pe-placeholder-clickable" onClick=${triggerFileUpload}>
                No Image provided. Click <strong>"Upload Image"</strong> to select an image.
              </div>
            `}
      </div>

      <div class="pe-image-meta-fields">
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
        imageUrl=${cropSource || url}
        onCropSave=${handleCroppedSave}
        onClose=${() => setShowCropper(false)}
      />`}
    <//>
  `;
}
