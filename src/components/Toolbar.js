import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { useEditor, usePortableTextEditor } from "@portabletext/editor";
import {
  isActiveDecorator,
  isActiveStyle,
  isActiveAnnotation,
} from "@portabletext/editor/selectors";
import { ICONS, PRE_BUNDLED_BLOCKS } from "./icons.js";
import { useEditorSnapshot } from "./hooks.js";

import { LinkModal } from "./LinkModal.js";

/**
 * Editor Toolbar Component with direct 1-click block insertion buttons and styled link modal.
 *
 * @param {object} props - Component properties.
 * @param {Array} [props.customBlocks=[]] - Custom block registrations.
 * @returns {import('htm/preact').Html} Toolbar layout structure.
 */
export function Toolbar({ customBlocks = [] }) {
  const editor = useEditor();
  const pte = usePortableTextEditor();
  const snapshot = useEditorSnapshot(editor);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleToggleMark = (mark) => (e) => {
    e.preventDefault();
    try {
      if (pte && pte.editable) {
        pte.editable.toggleMark(mark);
      } else {
        editor.send({ type: "decorator.toggle", decorator: mark });
      }
    } catch (err) {
      // Ignored
    }
    editor.send({ type: "focus" });
  };

  const handleToggleStyle = (style) => (e) => {
    e.preventDefault();
    try {
      if (pte && pte.editable) {
        pte.editable.toggleBlockStyle(style);
      } else {
        editor.send({ type: "style.toggle", style: style });
      }
    } catch (err) {
      // Ignored
    }
    editor.send({ type: "focus" });
  };

  const handleToggleList = (listStyle) => (e) => {
    e.preventDefault();
    try {
      if (pte && pte.editable) {
        pte.editable.toggleList(listStyle);
      }
    } catch (err) {
      // Ignored
    }
    editor.send({ type: "focus" });
  };

  const handleInsertBlock = (blockConfig) => (e) => {
    e.preventDefault();

    try {
      editor.send({
        type: "insert.block",
        block: {
          _type: blockConfig.name,
          ...blockConfig.defaultValue,
        },
        placement: "auto",
      });
    } catch (err) {
      // Ignored
    }

    editor.send({ type: "focus" });
  };

  const isMarkActive = (mark) =>
    snapshot ? isActiveDecorator(mark)(snapshot) : false;
  const isStyleActive = (style) =>
    snapshot ? isActiveStyle(style)(snapshot) : false;
  const isLinkActive = snapshot ? isActiveAnnotation("link")(snapshot) : false;

  const handleOpenLinkModal = (e) => {
    e.preventDefault();
    setShowLinkModal(true);
  };

  const handleSaveLink = (url) => {
    setShowLinkModal(false);
    try {
      editor.send({
        type: "annotation.add",
        annotation: { name: "link", value: { href: url } },
      });
    } catch (err) {
      // Ignored
    }
    editor.send({ type: "focus" });
  };

  const handleRemoveLink = () => {
    setShowLinkModal(false);
    try {
      editor.send({
        type: "annotation.remove",
        annotation: { name: "link" },
      });
    } catch (err) {
      // Ignored
    }
    editor.send({ type: "focus" });
  };

  const isListActive = (listStyle) => {
    if (!snapshot) return false;
    if (
      pte &&
      pte.editable &&
      typeof pte.editable.hasListStyle === "function"
    ) {
      return pte.editable.hasListStyle(listStyle);
    }
    return false;
  };

  const allBlocks = [...PRE_BUNDLED_BLOCKS, ...customBlocks];

  return html`
    <div class="pe-toolbar-wrapper">
      <!-- Paragraph & Heading Direct Buttons -->
      <div class="pe-toolbar-section">
        <button
          class="pe-btn ${isStyleActive("normal") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("normal")}
          title="Paragraph"
        >
          Paragraph
        </button>
        <button
          class="pe-btn ${isStyleActive("h1") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("h1")}
          title="Heading 1"
        >
          H1
        </button>
        <button
          class="pe-btn ${isStyleActive("h2") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("h2")}
          title="Heading 2"
        >
          H2
        </button>
        <button
          class="pe-btn ${isStyleActive("h3") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("h3")}
          title="Heading 3"
        >
          H3
        </button>
        <button
          class="pe-btn ${isStyleActive("h4") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("h4")}
          title="Heading 4"
        >
          H4
        </button>
        <button
          class="pe-btn ${isStyleActive("blockquote") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleStyle("blockquote")}
          title="Quote"
        >
          ${ICONS.quote}
        </button>
      </div>

      <div class="pe-divider"></div>

      <!-- Formatting Marks -->
      <div class="pe-toolbar-section">
        <button
          class="pe-btn ${isMarkActive("strong") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleMark("strong")}
          title="Bold"
        >
          ${ICONS.bold}
        </button>
        <button
          class="pe-btn ${isMarkActive("em") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleMark("em")}
          title="Italic"
        >
          ${ICONS.italic}
        </button>
        <button
          class="pe-btn ${isMarkActive("underline") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleMark("underline")}
          title="Underline"
        >
          ${ICONS.underline}
        </button>
        <button
          class="pe-btn ${isMarkActive("strike") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleMark("strike")}
          title="Strikethrough"
        >
          ${ICONS.strike}
        </button>
        <button
          class="pe-btn ${isMarkActive("code") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleMark("code")}
          title="Inline Code"
        >
          ${ICONS.code}
        </button>
        <button
          class="pe-btn ${isLinkActive ? "pe-btn-active" : ""}"
          onPointerDown=${handleOpenLinkModal}
          title="Link"
        >
          ${ICONS.link}
        </button>
      </div>

      <div class="pe-divider"></div>

      <!-- Lists -->
      <div class="pe-toolbar-section">
        <button
          class="pe-btn ${isListActive("bullet") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleList("bullet")}
          title="Bulleted List"
        >
          ${ICONS.bulletList}
        </button>
        <button
          class="pe-btn ${isListActive("number") ? "pe-btn-active" : ""}"
          onPointerDown=${handleToggleList("number")}
          title="Numbered List"
        >
          ${ICONS.numberedList}
        </button>
      </div>

      <div class="pe-divider"></div>

      <!-- Direct Block Insertion Buttons (No Dropdown) -->
      <div class="pe-insert-direct-group">
        ${allBlocks.map(
          (block) => html`
            <button
              class="pe-btn pe-insert-btn"
              onPointerDown=${handleInsertBlock(block)}
              title="Insert ${block.title}"
              key=${block.name}
            >
              <span class="pe-btn-icon">${block.icon || "🧩"}</span>
              <span class="pe-btn-label">${block.title}</span>
            </button>
          `,
        )}
      </div>

      ${showLinkModal &&
      html`<${LinkModal}
        isEditing=${isLinkActive}
        onSave=${handleSaveLink}
        onRemove=${handleRemoveLink}
        onClose=${() => setShowLinkModal(false)}
      />`}
    </div>
  `;
}
