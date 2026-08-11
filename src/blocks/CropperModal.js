import { html } from "htm/preact";
import { useState, useRef, useEffect } from "preact/hooks";
import { createPortal } from "preact/compat";

/**
 * Viewport-centered HTML5 Canvas Image Cropper & Resizer rendered via document.body Portal.
 * Supports zoom out to 50% (0.5x) and zoom in to 400% (4.0x).
 *
 * @param {object} props
 * @param {string} props.imageUrl - Source image URL or DataURL.
 * @param {function} props.onCropSave - Callback returning cropped DataURL string.
 * @param {function} props.onClose - Callback to close cropper modal.
 */
export function CropperModal({ imageUrl, onCropSave, onClose }) {
  const [targetWidth, setTargetWidth] = useState(1200);
  const [targetHeight, setTargetHeight] = useState(675);
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Prevent background page scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setIsLoaded(true);
      setPanX(0);
      setPanY(0);
      setZoom(1.0);
      drawCanvas(img, targetWidth, targetHeight, 1.0, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (imgRef.current && isLoaded) {
      drawCanvas(imgRef.current, targetWidth, targetHeight, zoom, panX, panY);
    }
  }, [targetWidth, targetHeight, zoom, panX, panY, isLoaded]);

  const drawCanvas = (img, w, h, zScale, px, py) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    // Display scale preview resolution
    const maxDisplayW = 600;
    const maxDisplayH = 340;
    const aspect = w / h;

    let displayW = maxDisplayW;
    let displayH = maxDisplayW / aspect;
    if (displayH > maxDisplayH) {
      displayH = maxDisplayH;
      displayW = maxDisplayH * aspect;
    }

    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, displayW, displayH);

    // Calculate base draw size to cover canvas
    const imgRatio = img.width / img.height;
    let baseW, baseH;
    if (imgRatio > aspect) {
      baseH = displayH;
      baseW = displayH * imgRatio;
    } else {
      baseW = displayW;
      baseH = displayW / imgRatio;
    }

    const scaledW = baseW * zScale;
    const scaledH = baseH * zScale;

    // Center offset + pan
    const centerX = (displayW - scaledW) / 2 + px;
    const centerY = (displayH - scaledH) / 2 + py;

    ctx.drawImage(img, centerX, centerY, scaledW, scaledH);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4.0));
  };

  const handleApplyPreset = (w, h) => {
    setTargetWidth(w);
    setTargetHeight(h);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
  };

  const handleSave = () => {
    const img = imgRef.current;
    if (!img) return;

    // High resolution output canvas at exact target dimensions
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    const ctx = exportCanvas.getContext("2d");

    const aspect = targetWidth / targetHeight;
    const imgRatio = img.width / img.height;
    let baseW, baseH;
    if (imgRatio > aspect) {
      baseH = targetHeight;
      baseW = targetHeight * imgRatio;
    } else {
      baseW = targetWidth;
      baseH = targetWidth / imgRatio;
    }

    // Scale pan factor from preview display canvas to high-res target canvas
    const previewDisplayW = canvasRef.current?.width || 600;
    const scaleFactor = targetWidth / previewDisplayW;

    const scaledW = baseW * zoom;
    const scaledH = baseH * zoom;
    const centerX = (targetWidth - scaledW) / 2 + panX * scaleFactor;
    const centerY = (targetHeight - scaledH) / 2 + panY * scaleFactor;

    ctx.drawImage(img, centerX, centerY, scaledW, scaledH);
    const croppedDataUrl = exportCanvas.toDataURL("image/webp", 0.85);
    onCropSave(croppedDataUrl);
  };

  const modalContent = html`
    <div class="pe-cropper-overlay" onClick=${onClose}>
      <div class="pe-cropper-modal" onClick=${(e) => e.stopPropagation()}>
        <div class="pe-cropper-header">
          <span class="pe-cropper-title">Upload image</span>
          <button type="button" class="pe-cropper-close" onClick=${onClose}>×</button>
        </div>

        <div class="pe-cropper-body">
          <div class="pe-cropper-presets">
            <span class="pe-cropper-label">PageSpeed Recommended Presets:</span>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 1200 && targetHeight === 675 ? "active" : ""}"
              onClick=${() => handleApplyPreset(1200, 675)}
            >
              1200 × 675 px (16:9 Recommended)
            </button>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 800 && targetHeight === 600 ? "active" : ""}"
              onClick=${() => handleApplyPreset(800, 600)}
            >
              800 × 600 px (4:3 Article)
            </button>
            <button
              type="button"
              class="pe-preset-btn ${targetWidth === 600 && targetHeight === 600 ? "active" : ""}"
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
                onInput=${(e) => setTargetWidth(parseInt(e.target.value) || 100)}
              />
            </label>
            <span class="pe-dim-separator">×</span>
            <label class="pe-dim-field">
              Height (px):
              <input
                type="number"
                class="pe-dim-input"
                value=${targetHeight}
                onInput=${(e) => setTargetHeight(parseInt(e.target.value) || 100)}
              />
            </label>
            <div class="pe-cropper-zoom-control">
              <span>Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value=${zoom}
                onInput=${(e) => setZoom(parseFloat(e.target.value))}
              />
              <span>${Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div
            class="pe-cropper-canvas-wrapper"
            onMouseDown=${handleMouseDown}
            onMouseMove=${handleMouseMove}
            onMouseUp=${handleMouseUp}
            onMouseLeave=${handleMouseUp}
            onWheel=${handleWheel}
            style="cursor: ${isDragging ? "grabbing" : "grab"};"
          >
            <canvas ref=${canvasRef} class="pe-cropper-canvas"></canvas>
            ${!isLoaded && html`<div class="pe-preview-placeholder">Loading image...</div>`}
          </div>
          <div class="pe-cropper-hint">💡 Drag image to position • Scroll mouse wheel to zoom (50% - 400%)</div>
        </div>

        <div class="pe-cropper-footer">
          <button type="button" class="pe-btn" onClick=${onClose}>Cancel</button>
          <button type="button" class="pe-btn pe-btn-active" onClick=${handleSave}>
            Apply Crop & Resize (${targetWidth} × ${targetHeight} px)
          </button>
        </div>
      </div>
    </div>
  `;

  return createPortal(modalContent, document.body);
}
