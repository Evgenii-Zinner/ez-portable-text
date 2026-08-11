import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Single Feature Card Block component with inline title, description, badge, link, image upload, and cropper integration.
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
      typeName="card"
      title=${schemaType?.title || "Card"}
      icon=${ICONS.card}
      value=${value}
      path=${path}
      headerActions=${headerActions}
    >
      <div class="pe-card-block-container">
        ${imageUrl
          ? html`
              <div class="pe-image-display-container">
                <img class="pe-preview-image" src=${imageUrl} alt=${title} />
              </div>
            `
          : html`
              <div class="pe-preview-placeholder pe-placeholder-clickable" onClick=${triggerFileUpload}>
                No Image provided. Click here or the <strong>Image icon</strong> in header to upload an image.
              </div>
            `}

        <div class="pe-card-meta-fields">
          <div class="pe-inline-field-row">
            <input
              type="text"
              class="pe-inline-input"
              style="width: 140px; flex-shrink: 0;"
              placeholder="Badge (e.g. NEW)..."
              value=${badge}
              onInput=${(e) => dispatchUpdate({ badge: e.target.value }, e.target)}
            />
            <input
              type="text"
              class="pe-inline-input"
              placeholder="Card Title..."
              value=${title}
              onInput=${(e) => dispatchUpdate({ title: e.target.value }, e.target)}
            />
          </div>

          <textarea
            class="pe-inline-textarea"
            placeholder="Card description text..."
            value=${description}
            onInput=${(e) => dispatchUpdate({ description: e.target.value }, e.target)}
            rows="3"
          ></textarea>

          <input
            type="text"
            class="pe-inline-input"
            placeholder="Link URL (optional e.g. https://example.com)..."
            value=${linkUrl}
            onInput=${(e) => dispatchUpdate({ linkUrl: e.target.value }, e.target)}
          />
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
