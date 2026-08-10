import { html } from "htm/preact";
import { useState, useRef, useEffect } from "preact/hooks";

/**
 * In-Browser HTML5 Canvas Image Cropper & Resizer with PageSpeed Presets.
 *
 * @param {object} props
 * @param {string} props.imageUrl - Source image URL or DataURL.
 * @param {function} props.onCropSave - Callback returning cropped DataURL string.
 * @param {function} props.onClose - Callback to close cropper modal.
 */
export function CropperModal({ imageUrl, onCropSave, onClose }) {
  const [targetWidth, setTargetWidth] = useState(1200);
  const [targetHeight, setTargetHeight] = useState(675);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setIsLoaded(true);
      drawPreview(img, targetWidth, targetHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawPreview = (img, w, h) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    // Cover fit draw
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > targetRatio) {
      renderH = img.height;
      renderW = img.height * targetRatio;
      offsetX = (img.width - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = img.width;
      renderH = img.width / targetRatio;
      offsetX = 0;
      offsetY = (img.height - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH, 0, 0, w, h);
  };

  const handleApplyPreset = (w, h) => {
    setTargetWidth(w);
    setTargetHeight(h);
    if (imgRef.current) {
      drawPreview(imgRef.current, w, h);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedDataUrl = canvas.toDataURL("image/webp", 0.85);
    onCropSave(croppedDataUrl);
  };

  return html`
    <div class="pe-cropper-overlay" onClick=${onClose}>
      <div class="pe-cropper-modal" onClick=${(e) => e.stopPropagation()}>
        <div class="pe-cropper-header">
          <span class="pe-cropper-title">✂️ In-Browser Image Cropper & Resizer</span>
          <button type="button" class="pe-cropper-close" onClick=${onClose}>×</button>
        </div>

        <div class="pe-cropper-body">
          <div class="pe-cropper-presets">
            <span class="pe-cropper-label">PageSpeed Recommended Presets:</span>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 1200 && targetHeight === 675 ? 'active' : ''}"
              onClick=${() => handleApplyPreset(1200, 675)}
            >
              1200 × 675 px (16:9 Recommended)
            </button>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 800 && targetHeight === 600 ? 'active' : ''}"
              onClick=${() => handleApplyPreset(800, 600)}
            >
              800 × 600 px (4:3 Article)
            </button>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 600 && targetHeight === 600 ? 'active' : ''}"
              onClick=${() => handleApplyPreset(600, 600)}
            >
              600 × 600 px (1:1 Square)
            </button>
          </div>

          <div class="pe-cropper-dimensions">
            <label class="pe-dim-field">
              Width (px):
              <input
                type="number"
                class="pe-dim-input"
                value=${targetWidth}
                onInput=${(e) => {
                  const val = parseInt(e.target.value) || 100;
                  setTargetWidth(val);
                  if (imgRef.current) drawPreview(imgRef.current, val, targetHeight);
                }}
              />
            </label>
            <span class="pe-dim-separator">×</span>
            <label class="pe-dim-field">
              Height (px):
              <input
                type="number"
                class="pe-dim-input"
                value=${targetHeight}
                onInput=${(e) => {
                  const val = parseInt(e.target.value) || 100;
                  setTargetHeight(val);
                  if (imgRef.current) drawPreview(imgRef.current, targetWidth, val);
                }}
              />
            </label>
          </div>

          <div class="pe-cropper-canvas-wrapper">
            <canvas ref=${canvasRef} class="pe-cropper-canvas"></canvas>
            ${!isLoaded && html`<div class="pe-preview-placeholder">Loading image...</div>`}
          </div>
        </div>

        <div class="pe-cropper-footer">
          <button type="button" class="pe-btn" onClick=${onClose}>Cancel</button>
          <button type="button" class="pe-btn pe-btn-active" onClick=${handleSave}>
            Apply Crop & Resize
          </button>
        </div>
      </div>
    </div>
  `;
}
