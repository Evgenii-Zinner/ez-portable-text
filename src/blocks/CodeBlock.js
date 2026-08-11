import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "bash", label: "Bash / Shell" },
  { id: "json", label: "JSON" },
  { id: "sql", label: "SQL" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

/**
 * Interactive Code Block renderer with custom editor dropdown & typescript default.
 *
 * @param {object} props
 * @param {object} props.value - Code block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function CodeBlock({ value, schemaType, path }) {
  const [langOpen, setLangOpen] = useState(false);
  const language = value?.language || "typescript";
  const filename = value?.filename || "";
  const code = value?.code || "";

  useEffect(() => {
    if (!langOpen) return;
    const handleClose = () => setLangOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [langOpen]);

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleFilenameChange = (e) => {
    dispatchUpdate({ filename: e.target.value }, e.target);
  };

  const handleCodeChange = (e) => {
    dispatchUpdate({ code: e.target.value }, e.target);
  };

  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return html`
    <${BlockCardWrapper}
      typeName="codeBlock"
      title=${schemaType?.title || "Code Block"}
      icon=${ICONS.codeBlock}
      value=${value}
      path=${path}
    >
      <div class="pe-preview-code-wrapper">
        <div class="pe-code-header">
          <div class="pe-dropdown-container">
            <button
              type="button"
              class="pe-btn pe-dropdown-btn ${langOpen ? "active" : ""}"
              onClick=${(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLangOpen(!langOpen);
              }}
            >
              ${currentLangObj.label} ▾
            </button>
            ${langOpen &&
            html`
              <div class="pe-dropdown-menu">
                ${LANGUAGES.map(
                  (l) => html`
                    <div
                      class="pe-dropdown-item ${language === l.id
                        ? "pe-dropdown-item-active"
                        : ""}"
                      onClick=${(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLangOpen(false);
                        dispatchUpdate({ language: l.id }, e.target);
                      }}
                      key=${l.id}
                    >
                      ${l.label}
                    </div>
                  `,
                )}
              </div>
            `}
          </div>

          <input
            type="text"
            class="pe-code-file-input"
            placeholder="filename.ts (optional)"
            value=${filename}
            onInput=${handleFilenameChange}
          />
        </div>

        <textarea
          class="pe-code-editor-textarea"
          placeholder="// Type your code here..."
          value=${code}
          onInput=${handleCodeChange}
          rows="5"
        ></textarea>
      </div>
    <//>
  `;
}
