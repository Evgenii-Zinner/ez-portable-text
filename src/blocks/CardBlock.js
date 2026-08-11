import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Standalone Card Block component with local image upload, cropper, badge, and link.
 *
 * @param {object} props
 * @param {object} props.value - Card block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function CardBlock({ value, schemaType, path }) {
  const [showCropper, setShowCropper] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const fileInputRef = useRef(null);

  const title = value?.title || "";
  const description = value?.description || "";
  const imageUrl = value?.imageUrl || "";
  const badge = value?.badge || "";
  const linkUrl = value?.linkUrl || "";

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
    const cardEl = document.querySelector(`[data-block-type="card"]`);
    if (cardEl) {
      dispatchUpdate({ imageUrl: croppedUrl }, cardEl);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const headerActions = html`
    <button
      type="button"
      class="pe-upload-header-btn"
      title="Upload Card Image"
      onClick=${triggerFileUpload}
    >
      📷 Upload Image
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
      typeName="card"
      title=${schemaType?.title || "Feature Card"}
      icon=${ICONS.card || ICONS.puzzle}
      value=${value}
      path=${path}
      headerActions=${headerActions}
    >
      <div class="pe-card-preview-container">
        ${imageUrl
          ? html`
              <div class="pe-card-image-wrapper">
                <img class="pe-card-image" src=${imageUrl} alt=${title} />
                <button
                  type="button"
                  class="pe-crop-overlay-btn"
                  onClick=${() => {
                    setCropSource(imageUrl);
                    setShowCropper(true);
                  }}
                >
                  ✂️ Crop & Adjust
                </button>
              </div>
            `
          : html`
              <div
                class="pe-preview-placeholder pe-placeholder-clickable"
                onClick=${triggerFileUpload}
              >
                No Card Image. Click <strong>"📷 Upload Image"</strong> to add an image.
              </div>
            `}

        <div class="pe-card-fields-body">
          <div class="pe-inline-field-row">
            <input
              type="text"
              class="pe-card-badge-input"
              placeholder="Tag / Badge (e.g. FEATURED)..."
              value=${badge}
              onInput=${(e) => dispatchUpdate({ badge: e.target.value }, e.target)}
            />
          </div>

          <input
            type="text"
            class="pe-card-title-input"
            placeholder="Card Title..."
            value=${title}
            onInput=${(e) => dispatchUpdate({ title: e.target.value }, e.target)}
          />

          <textarea
            class="pe-card-desc-textarea"
            placeholder="Card description text..."
            value=${description}
            onInput=${(e) => dispatchUpdate({ description: e.target.value }, e.target)}
            rows="2"
          ></textarea>

          <div class="pe-inline-field-row" style="margin-top: 8px;">
            <span class="pe-field-label">🔗 Link URL:</span>
            <input
              type="text"
              class="pe-inline-input"
              placeholder="https://example.com/learn-more"
              value=${linkUrl}
              onInput=${(e) => dispatchUpdate({ linkUrl: e.target.value }, e.target)}
            />
          </div>
        </div>
      </div>

      ${showCropper &&
      html`<${CropperModal}
        imageUrl=${cropSource || imageUrl}
        onCropSave=${handleCroppedSave}
        onClose=${() => setShowCropper(false)}
      />`}
    <//>
  `;
}
