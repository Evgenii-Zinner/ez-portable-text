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

/**
 * Editor Toolbar Component containing text, layout, and block controls.
 *
 * @param {object} props - Component properties.
 * @param {Array} [props.customBlocks=[]] - Custom block registrations.
 * @returns {import('htm/preact').Html} Toolbar layout structure.
 */
export function Toolbar({ customBlocks = [] }) {
  const editor = useEditor();
  const pte = usePortableTextEditor();
  const snapshot = useEditorSnapshot(editor);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleDocumentClick = () => {
      setDropdownOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!styleDropdownOpen) return;
    const handleStyleClick = () => {
      setStyleDropdownOpen(false);
    };
    document.addEventListener("click", handleStyleClick);
    return () => document.removeEventListener("click", handleStyleClick);
  }, [styleDropdownOpen]);

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
    setStyleDropdownOpen(false);
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
    setDropdownOpen(false);

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

  const handleToggleLink = (e) => {
    e.preventDefault();
    try {
      if (isLinkActive) {
        editor.send({
          type: "annotation.remove",
          annotation: { name: "link" },
        });
      } else {
        const url = window.prompt("Enter link URL:", "https://");
        if (url) {
          editor.send({
            type: "annotation.add",
            annotation: { name: "link", value: { href: url } },
          });
        }
      }
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

  const getActiveStyleLabel = () => {
    if (isStyleActive("h1")) return "Heading 1";
    if (isStyleActive("h2")) return "Heading 2";
    if (isStyleActive("blockquote")) return "Quote";
    return "Paragraph";
  };

  const allBlocks = [...PRE_BUNDLED_BLOCKS, ...customBlocks];

  return html`
    <div class="pe-toolbar-wrapper">
      <div class="pe-dropdown-container">
        <button
          class="pe-btn pe-dropdown-btn ${styleDropdownOpen ? "active" : ""}"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            setStyleDropdownOpen(!styleDropdownOpen);
          }}
        >
          ${getActiveStyleLabel()} ▾
        </button>
        ${styleDropdownOpen &&
        html`
          <div class="pe-dropdown-menu">
            <div
              class="pe-dropdown-item ${isStyleActive("normal")
                ? "pe-dropdown-item-active"
                : ""}"
              onPointerDown=${handleToggleStyle("normal")}
            >
              Paragraph
            </div>
            <div
              class="pe-dropdown-item ${isStyleActive("h1")
                ? "pe-dropdown-item-active"
                : ""}"
              onPointerDown=${handleToggleStyle("h1")}
            >
              Heading 1
            </div>
            <div
              class="pe-dropdown-item ${isStyleActive("h2")
                ? "pe-dropdown-item-active"
                : ""}"
              onPointerDown=${handleToggleStyle("h2")}
            >
              Heading 2
            </div>
            <div
              class="pe-dropdown-item ${isStyleActive("blockquote")
                ? "pe-dropdown-item-active"
                : ""}"
              onPointerDown=${handleToggleStyle("blockquote")}
            >
              Quote
            </div>
          </div>
        `}
      </div>
      <div class="pe-divider"></div>

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
        class="pe-btn ${isMarkActive("code") ? "pe-btn-active" : ""}"
        onPointerDown=${handleToggleMark("code")}
        title="Inline Code"
      >
        ${ICONS.code}
      </button>
      <button
        class="pe-btn ${isLinkActive ? "pe-btn-active" : ""}"
        onPointerDown=${handleToggleLink}
        title="Link"
      >
        ${ICONS.link}
      </button>
      <div class="pe-divider"></div>

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
      <div class="pe-divider"></div>

      <div class="pe-dropdown-container">
        <button
          class="pe-btn pe-dropdown-btn ${dropdownOpen ? "active" : ""}"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          Insert ▾
        </button>
        ${dropdownOpen &&
        html`
          <div class="pe-dropdown-menu">
            ${allBlocks.map(
              (block) => html`
                <div
                  class="pe-dropdown-item"
                  onPointerDown=${handleInsertBlock(block)}
                  key=${block.name}
                >
                  <span class="pe-dropdown-item-icon"
                    >${block.icon || "🧩"}</span
                  >
                  <span class="pe-dropdown-item-title">${block.title}</span>
                </div>
              `,
            )}
          </div>
        `}
      </div>
    </div>
  `;
}
