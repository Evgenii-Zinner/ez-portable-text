import { html } from "htm/preact";
import { useState, useRef } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { CropperModal } from "./CropperModal.js";
import { ICONS } from "../components/icons.js";

/**
 * Bento Grid Block component with clean icon-only header buttons and compact grid column selectors.
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

  // Header 1-click grid column selector buttons (2, 3, 4)
  const headerActions = html`
    <div class="pe-bento-header-span-group">
      <span class="pe-bento-header-label">Grid:</span>
      ${[2, 3, 4].map(
        (colCount) => html`
          <button
            type="button"
            key=${colCount}
            class="pe-block-action-btn ${columns === colCount ? "active" : ""}"
            title="Set ${colCount} Columns Layout"
            onClick=${(e) => dispatchUpdate({ columns: colCount }, e.target)}
          >
            ${colCount}
          </button>
        `,
      )}
    </div>
  `;

  // Dynamically generate column span buttons for each card (1x, 2x, 3x, 4x)
  const renderSpanButtons = (card, cardIndex) => {
    const spanOptions = [];
    for (let s = 1; s <= columns; s++) {
      spanOptions.push(s);
    }
    const currentSpan = Math.min(card.colSpan || 1, columns);

    return html`
      <div class="pe-card-span-btn-group">
        ${spanOptions.map(
          (spanVal) => html`
            <button
              type="button"
              key=${spanVal}
              class="pe-block-action-btn ${currentSpan === spanVal ? "active" : ""}"
              title="Width: ${spanVal} of ${columns} columns"
              onClick=${(e) => handleCardUpdate(cardIndex, { colSpan: spanVal }, e.target)}
            >
              ${spanVal}x
            </button>
          `,
        )}
      </div>
    `;
  };

  return html`
    <${BlockCardWrapper}
      typeName="bentoGrid"
      title=${schemaType?.title || "Bento Grid"}
      icon=${ICONS.bento || ICONS.table}
      value=${value}
      path=${path}
      headerActions=${headerActions}
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
                ${renderSpanButtons(card, idx)}

                <div class="pe-card-header-actions">
                  <button
                    type="button"
                    class="pe-block-action-btn"
                    title="Upload Image"
                    onClick=${() => triggerCardUpload(idx)}
                  >
                    ${ICONS.image}
                  </button>

                  <button
                    type="button"
                    class="pe-block-action-btn pe-action-delete"
                    title="Delete Item"
                    onClick=${(e) => handleDeleteCard(idx, e)}
                  >
                    ${ICONS.trash}
                  </button>
                </div>
              </div>

              ${card.imageUrl &&
              html`
                <div class="pe-bento-img-container">
                  <img class="pe-bento-img" src=${card.imageUrl} alt=${card.title} />
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
        <button type="button" class="pe-btn" onClick=${handleAddCard}>
          <span class="pe-btn-icon">${ICONS.plus}</span>
          <span>Add Bento Card</span>
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
