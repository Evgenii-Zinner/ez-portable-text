/**
 * Helper to generate a unique alpha-numeric key.
 * @returns {string} 9-character base-36 string.
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Transforms a validated PortableText JSON array into HTML DOM elements and mounts them.
 * @param {Array} data - PortableText JSON array.
 * @param {HTMLElement} canvas - Visual editor canvas container.
 * @returns {void}
 */
export function deserialize(data, canvas) {
  canvas.innerHTML = "";

  if (!data || data.length === 0) {
    const defaultP = document.createElement("p");
    defaultP.setAttribute("data-block-key", generateKey());
    defaultP.innerHTML = "<br>";
    canvas.appendChild(defaultP);
    return;
  }

  data.forEach((block) => {
    let tag = "p";

    // Map block style key to standard DOM elements
    if (
      block.style === "h1" ||
      block.style === "h2" ||
      block.style === "h3" ||
      block.style === "blockquote"
    ) {
      tag = block.style;
    }

    const blockEl = document.createElement(tag);
    blockEl.setAttribute("data-block-key", block._key || generateKey());

    if (block.children && block.children.length > 0) {
      block.children.forEach((span) => {
        let node = document.createTextNode(span.text || "");
        let wrap = null;

        // Recursively wrap text node with formatting elements matching span marks
        if (span.marks && span.marks.length > 0) {
          span.marks.forEach((mark) => {
            let wrapEl = null;

            if (mark === "strong") wrapEl = document.createElement("strong");
            else if (mark === "em") wrapEl = document.createElement("em");
            else if (mark === "underline") wrapEl = document.createElement("u");
            else if (mark === "code") wrapEl = document.createElement("code");
            else {
              // Check if mark matches a key in block.markDefs (for links)
              const linkDef = block.markDefs
                ? block.markDefs.find((def) => def._key === mark)
                : null;
              if (linkDef && linkDef._type === "link") {
                wrapEl = document.createElement("a");
                wrapEl.setAttribute("href", linkDef.href || "");
              }
            }

            if (wrapEl) {
              if (wrap) {
                wrapEl.appendChild(wrap);
              } else {
                wrapEl.appendChild(node);
              }
              wrap = wrapEl;
            }
          });
        }

        blockEl.appendChild(wrap || node);
      });
    } else {
      blockEl.innerHTML = "<br>";
    }

    // Protection for empty blocks collapsing
    if (blockEl.innerHTML === "") {
      blockEl.innerHTML = "<br>";
    }

    canvas.appendChild(blockEl);
  });
}
