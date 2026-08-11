import { html } from "htm/preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { createPortal } from "preact/compat";

/**
 * Viewport-centered Link Modal rendered via document.body Portal replacing native browser prompt.
 *
 * @param {object} props
 * @param {string} [props.initialUrl="https://"] - Pre-filled URL value.
 * @param {boolean} [props.isEditing=false] - Whether editing an existing link.
 * @param {function} props.onSave - Callback returning input URL string.
 * @param {function} props.onRemove - Callback to remove link annotation.
 * @param {function} props.onClose - Callback to close modal.
 */
export function LinkModal({ initialUrl = "https://", isEditing = false, onSave, onRemove, onClose }) {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input field on mount
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim());
    }
  };

  const modalContent = html`
    <div class="pe-cropper-overlay" onClick=${onClose}>
      <div class="pe-link-modal" onClick=${(e) => e.stopPropagation()}>
        <div class="pe-cropper-header">
          <span class="pe-cropper-title">${isEditing ? "Edit Hyperlink" : "Insert Hyperlink"}</span>
          <button type="button" class="pe-cropper-close" onClick=${onClose}>×</button>
        </div>

        <form onSubmit=${handleSubmit}>
          <div class="pe-link-modal-body">
            <label class="pe-field-label">Target URL:</label>
            <input
              type="url"
              ref=${inputRef}
              class="pe-link-input"
              placeholder="https://example.com"
              value=${url}
              onInput=${(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div class="pe-cropper-footer" style="margin-top: 16px;">
            ${isEditing &&
            html`
              <button
                type="button"
                class="pe-btn pe-btn-delete"
                onClick=${onRemove}
                style="margin-right: auto;"
              >
                Unlink
              </button>
            `}
            <button type="button" class="pe-btn" onClick=${onClose}>Cancel</button>
            <button type="submit" class="pe-btn pe-btn-active">
              ${isEditing ? "Save Changes" : "Insert Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  return createPortal(modalContent, document.body);
}
