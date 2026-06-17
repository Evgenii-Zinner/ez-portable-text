import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { useEditor, usePortableTextEditor } from "@portabletext/editor";
import {
  isActiveDecorator,
  isActiveStyle,
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

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleDocumentClick = () => {
      setDropdownOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [dropdownOpen]);

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
    setDropdownOpen(false);

    try {
      editor.send({
        type: "behavior event",
        behaviorEvent: {
          type: "insert.block",
          block: {
            _type: blockConfig.name,
            ...blockConfig.defaultValue,
          },
          placement: "auto",
        },
        editor,
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
      <button
        class="pe-btn ${isMarkActive("strong") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("strong")}
        onPointerDown=${handleToggleMark("strong")}
        title="Bold"
      >
        ${ICONS.bold}
      </button>
      <button
        class="pe-btn ${isMarkActive("em") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("em")}
        onPointerDown=${handleToggleMark("em")}
        title="Italic"
      >
        ${ICONS.italic}
      </button>
      <button
        class="pe-btn ${isMarkActive("underline") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("underline")}
        onPointerDown=${handleToggleMark("underline")}
        title="Underline"
      >
        ${ICONS.underline}
      </button>
      <button
        class="pe-btn ${isMarkActive("code") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("code")}
        onPointerDown=${handleToggleMark("code")}
        title="Inline Code"
      >
        ${ICONS.code}
      </button>
      <div class="pe-divider"></div>
      <button
        class="pe-btn ${isStyleActive("normal") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("normal")}
        onPointerDown=${handleToggleStyle("normal")}
        title="Paragraph"
      >
        P
      </button>
      <button
        class="pe-btn ${isStyleActive("h1") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("h1")}
        onPointerDown=${handleToggleStyle("h1")}
        title="Heading 1"
      >
        H1
      </button>
      <button
        class="pe-btn ${isStyleActive("h2") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("h2")}
        onPointerDown=${handleToggleStyle("h2")}
        title="Heading 2"
      >
        H2
      </button>
      <button
        class="pe-btn ${isStyleActive("blockquote") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("blockquote")}
        onPointerDown=${handleToggleStyle("blockquote")}
        title="Quote"
      >
        ${ICONS.quote}
      </button>
      <div class="pe-divider"></div>
      <button
        class="pe-btn ${isListActive("bullet") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleList("bullet")}
        onPointerDown=${handleToggleList("bullet")}
        title="Bulleted List"
      >
        ${ICONS.bulletList}
      </button>
      <button
        class="pe-btn ${isListActive("number") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleList("number")}
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
                  onMouseDown=${handleInsertBlock(block)}
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
