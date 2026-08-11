import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Hero Banner Block component with direct inline overlay editing.
 *
 * @param {object} props
 * @param {object} props.value - Hero block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function HeroBlock({ value, schemaType, path }) {
  const [showCropper, setShowCropper] = useState(false);
  const [cropSource, setCropSource] = useState("");
  const fileInputRef = useRef(null);

  const title = value?.title || "";
  const subtitle = value?.subtitle || "";
  const imageUrl = value?.imageUrl || value?.url || "";

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
    const cardEl = document.querySelector(`[data-block-type="hero"]`);
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
      typeName="hero"
      title=${schemaType?.title || "Hero Banner"}
      icon=${ICONS.hero}
      value=${value}
      path=${path}
      headerActions=${headerActions}
    >
      <div class="pe-hero-preview-container">
        ${imageUrl
          ? html`
              <div class="pe-hero-banner-preview">
                <img class="pe-hero-bg-img" src=${imageUrl} alt=${title} />
                <div class="pe-hero-overlay">
                  <input
                    type="text"
                    class="pe-hero-title-input"
                    placeholder="Hero Title (e.g. Vibecoding a Cosmic Arcade)..."
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
            `
          : html`
              <div class="pe-preview-placeholder pe-placeholder-clickable" onClick=${triggerFileUpload}>
                No Hero Image provided. Click <strong>"Upload Image"</strong> icon to select a 1200×675 banner image.
              </div>
              <div class="pe-hero-fields">
                <input
                  type="text"
                  class="pe-inline-input"
                  placeholder="Hero Title..."
                  value=${title}
                  onInput=${(e) => dispatchUpdate({ title: e.target.value }, e.target)}
                />
                <input
                  type="text"
                  class="pe-inline-input"
                  placeholder="Hero Subtitle..."
                  value=${subtitle}
                  onInput=${(e) => dispatchUpdate({ subtitle: e.target.value }, e.target)}
                />
              </div>
            `}
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
