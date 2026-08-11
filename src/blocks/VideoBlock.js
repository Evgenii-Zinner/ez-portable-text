import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Converts standard YouTube or Vimeo URLs to embeddable player URLs.
 *
 * @param {string} url
 * @returns {string|null} Embed URL or null.
 */
function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

/**
 * Interactive Video Block component with URL input line and live embed preview.
 *
 * @param {object} props
 * @param {object} props.value - Video block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function VideoBlock({ value, schemaType, path }) {
  const url = value?.url || "";
  const caption = value?.caption || "";
  const embedUrl = getEmbedUrl(url);
  const isDirectVideo = url.match(/\.(mp4|webm|ogg)$/i);

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  return html`
    <${BlockCardWrapper}
      typeName="video"
      title=${schemaType?.title || "Video"}
      icon=${ICONS.video}
      value=${value}
      path=${path}
      hideEditBtn=${true}
    >
      <div class="pe-preview-video-wrapper">
        ${embedUrl
          ? html`
              <div class="pe-video-embed-container">
                <iframe
                  src=${embedUrl}
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            `
          : isDirectVideo
          ? html`
              <div class="pe-video-embed-container">
                <video src=${url} controls></video>
              </div>
            `
          : html`
              <div class="pe-preview-placeholder">
                Paste a Video URL below (YouTube, Vimeo, or direct MP4 link)
              </div>
            `}
      </div>

      <div class="pe-image-meta-fields">
        <div class="pe-inline-field-row">
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Paste Video URL (YouTube, Vimeo, or MP4 link)..."
            value=${url}
            onInput=${(e) => dispatchUpdate({ url: e.target.value }, e.target)}
          />
        </div>
        <div class="pe-inline-field-row">
          <input
            type="text"
            class="pe-inline-input"
            placeholder="Video Caption (optional)..."
            value=${caption}
            onInput=${(e) => dispatchUpdate({ caption: e.target.value }, e.target)}
          />
        </div>
      </div>
    <//>
  `;
}
