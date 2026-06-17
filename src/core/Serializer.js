/**
 * Helper to generate a unique alpha-numeric key.
 * @returns {string} 9-character base-36 string.
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Walks the visual editor canvas DOM tree and serializes it back into a flat PortableText JSON array.
 * @param {HTMLElement} canvas - Visual editor canvas container.
 * @returns {Array} PortableText JSON array.
 */
export function serialize(canvas) {
  const portableText = [];

  Array.from(canvas.children).forEach((blockEl) => {
    // Determine style based on tag name
    const tag = blockEl.tagName.toLowerCase();
    let style = "normal";
    if (["h1", "h2", "h3", "blockquote"].includes(tag)) {
      style = tag;
    }

    const originalKey = blockEl.getAttribute("data-block-key");
    const blockKey = originalKey || generateKey();

    if (!originalKey) {
      console.log(
        `[Serializer] Generated new key '${blockKey}' for tag '<${tag}>'`,
      );
    }

    blockEl.setAttribute("data-block-key", blockKey); // Ensure it is written back to the DOM

    console.log(
      `[Serializer] Block <${tag}> serialized with style: '${style}', key: '${blockKey}'`,
    );

    const block = {
      _key: blockKey,
      _type: "block",
      style: style,
      children: [],
      markDefs: [],
    };

    /**
     * Recursively walks the children of a node to extract text nodes and compile marks.
     * @param {Node} node - DOM node to parse.
     */
    const parseNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Collect active format marks by traversing parent elements up to the block boundary
        const marks = [];
        let parent = node.parentNode;

        while (parent && parent !== blockEl) {
          const pTag = parent.tagName.toLowerCase();
          if (pTag === "strong" || pTag === "b") marks.push("strong");
          if (pTag === "em" || pTag === "i") marks.push("em");
          if (pTag === "u") marks.push("underline");
          if (pTag === "code") marks.push("code");

          if (pTag === "a") {
            const href = parent.getAttribute("href") || "";
            // Look up or create a unique reference key for this link inside markDefs
            let existingDef = block.markDefs.find((def) => def.href === href);
            if (!existingDef) {
              existingDef = {
                _key: `link_${generateKey()}`,
                _type: "link",
                href: href,
              };
              block.markDefs.push(existingDef);
            }
            marks.push(existingDef._key);
          }

          parent = parent.parentNode;
        }

        block.children.push({
          _key: generateKey(),
          _type: "span",
          marks: Array.from(new Set(marks)),
          text: node.textContent,
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Special checks for formatting tags
        if (
          node.tagName.toLowerCase() === "br" &&
          blockEl.childNodes.length === 1
        ) {
          // Ignore single <br> since it represents empty content
          return;
        }
        node.childNodes.forEach((child) => parseNode(child));
      }
    };

    parseNode(blockEl);

    // Fallback: If empty text content, push single empty child span to keep PT spec validation
    if (block.children.length === 0) {
      block.children.push({
        _key: generateKey(),
        _type: "span",
        marks: [],
        text: "",
      });
    }

    portableText.push(block);
  });

  return portableText;
}
