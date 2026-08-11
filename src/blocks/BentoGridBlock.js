import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Bento Grid Block component featuring a multi-card grid layout with custom column spans.
 *
 * @param {object} props
 * @param {object} props.value - Bento grid block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function BentoGridBlock({ value, schemaType, path }) {
  const [activeCropIndex, setActiveCropIndex] = useState(null);
  const [cropSource, setCropSource] = useState("");
  const fileInputRef = useRef(null);
  const targetCardIndexRef = useRef(null);

  const sectionTitle = value?.sectionTitle || "";
  const columns = value?.columns || 3;
  const cards = value?.cards || [
    {
      _key: "b1",
      title: "Edge Storage",
      description: "KV-backed high performance data layer.",
      badge: "FEATURE",
      colSpan: 2,
    },
    {
      _key: "b2",
      title: "No-Code CMS",
      description: "Visual editing with PortableText.",
      badge: "FAST",
      colSpan: 1,
    },
  ];

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleCardUpdate = (index, cardPatch, target) => {
    const nextCards = JSON.parse(JSON.stringify(cards));
    if (nextCards[index]) {
      nextCards[index] = { ...nextCards[index], ...cardPatch };
      dispatchUpdate({ cards: nextCards }, target);
    }
  };

  const handleAddCard = (e) => {
    const nextCards = JSON.parse(JSON.stringify(cards));
    const newKey = "b_" + Math.random().toString(36).substring(2, 9);
    nextCards.push({
      _key: newKey,
      title: "New Feature",
      description: "Describe feature details...",
      badge: "NEW",
      colSpan: 1,
      imageUrl: "",
    });
    dispatchUpdate({ cards: nextCards }, e.target);
  };

  const handleDeleteCard = (index, e) => {
    const nextCards = cards.filter((_, idx) => idx !== index);
    dispatchUpdate({ cards: nextCards }, e.target);
  };

  const handleFileSelectForCard = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    targetCardIndexRef.current = index;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropSource(event.target.result);
      setActiveCropIndex(index);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const triggerCardUpload = (index) => {
    targetCardIndexRef.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCroppedSave = (croppedUrl) => {
    const idx = activeCropIndex !== null ? activeCropIndex : targetCardIndexRef.current;
    setActiveCropIndex(null);

    const bentoCardEl = document.querySelector(`[data-block-type="bentoGrid"]`);
    if (bentoCardEl && idx !== null && idx !== undefined) {
      handleCardUpdate(idx, { imageUrl: croppedUrl }, bentoCardEl);
    }
  };

  return html`
    <${BlockCardWrapper}
      typeName="bentoGrid"
      title=${schemaType?.title || "Bento Grid"}
      icon=${ICONS.bento || ICONS.table}
      value=${value}
      path=${path}
    >
      <input
        type="file"
        ref=${fileInputRef}
        accept="image/*"
        style="display: none;"
        onChange=${(e) => handleFileSelectForCard(targetCardIndexRef.current, e)}
      />

      <div class="pe-bento-header-controls">
        <input
          type="text"
          class="pe-bento-section-title-input"
          placeholder="Section Heading (e.g. Built for Modern Web)..."
          value=${sectionTitle}
          onInput=${(e) => dispatchUpdate({ sectionTitle: e.target.value }, e.target)}
        />

        <div class="pe-inline-field-row" style="margin-left: auto;">
          <span class="pe-field-label">Grid Layout:</span>
          <select
            class="pe-bento-col-select"
            value=${columns}
            onChange=${(e) => dispatchUpdate({ columns: parseInt(e.target.value) || 3 }, e.target)}
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>
        </div>
      </div>

      <div class="pe-bento-grid-preview" style="grid-template-columns: repeat(${columns}, 1fr);">
        ${cards.map(
          (card, idx) => html`
            <div
              key=${card._key || idx}
              class="pe-bento-item-card"
              style="grid-column: span ${Math.min(card.colSpan || 1, columns)};"
            >
              <div class="pe-bento-item-header">
                <select
                  class="pe-bento-span-select"
                  value=${card.colSpan || 1}
                  onChange=${(e) =>
                    handleCardUpdate(idx, { colSpan: parseInt(e.target.value) || 1 }, e.target)}
                >
                  <option value="1">1 Col</option>
                  <option value="2">2 Cols</option>
                  <option value="3">3 Cols</option>
                  <option value="4">Full Width</option>
                </select>

                <button
                  type="button"
                  class="pe-bento-upload-btn"
                  title="Upload Image"
                  onClick=${() => triggerCardUpload(idx)}
                >
                  📷 Image
                </button>

                <button
                  type="button"
                  class="pe-bento-delete-btn"
                  title="Delete Item"
                  onClick=${(e) => handleDeleteCard(idx, e)}
                >
                  🗑
                </button>
              </div>

              ${card.imageUrl &&
              html`
                <div class="pe-bento-img-container">
                  <img class="pe-bento-img" src=${card.imageUrl} alt=${card.title} />
                  <button
                    type="button"
                    class="pe-crop-overlay-btn"
                    style="font-size: 10px; padding: 4px 8px;"
                    onClick=${() => {
                      setCropSource(card.imageUrl);
                      targetCardIndexRef.current = idx;
                      setActiveCropIndex(idx);
                    }}
                  >
                    ✂️ Crop
                  </button>
                </div>
              `}

              <div class="pe-bento-item-body">
                <input
                  type="text"
                  class="pe-card-badge-input"
                  placeholder="Badge (optional)..."
                  value=${card.badge || ""}
                  onInput=${(e) => handleCardUpdate(idx, { badge: e.target.value }, e.target)}
                />
                <input
                  type="text"
                  class="pe-bento-title-input"
                  placeholder="Card Title..."
                  value=${card.title || ""}
                  onInput=${(e) => handleCardUpdate(idx, { title: e.target.value }, e.target)}
                />
                <textarea
                  class="pe-bento-desc-input"
                  placeholder="Card description..."
                  value=${card.description || ""}
                  onInput=${(e) => handleCardUpdate(idx, { description: e.target.value }, e.target)}
                  rows="2"
                ></textarea>
              </div>
            </div>
          `,
        )}
      </div>

      <div class="pe-bento-footer">
        <button type="button" class="pe-btn pe-btn-active" onClick=${handleAddCard}>
          + Add Bento Card
        </button>
      </div>

      ${activeCropIndex !== null &&
      html`<${CropperModal}
        imageUrl=${cropSource}
        onCropSave=${handleCroppedSave}
        onClose=${() => setActiveCropIndex(null)}
      />`}
    <//>
  `;
}
