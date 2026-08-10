import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Interactive Code Block renderer with inline editing & typescript default.
 *
 * @param {object} props
 * @param {object} props.value - Code block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function CodeBlock({ value, schemaType, path }) {
  const language = value?.language || "typescript";
  const filename = value?.filename || "";
  const code = value?.code || "";

  const dispatchUpdate = (patch, target) => {
    const event = new CustomEvent("pe-update-block-data", {
      detail: { value, patch },
      bubbles: true,
      composed: true,
    });
    target.dispatchEvent(event);
  };

  const handleLangChange = (e) => {
    dispatchUpdate({ language: e.target.value }, e.target);
  };

  const handleFilenameChange = (e) => {
    dispatchUpdate({ filename: e.target.value }, e.target);
  };

  const handleCodeChange = (e) => {
    dispatchUpdate({ code: e.target.value }, e.target);
  };

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
          <select
            class="pe-code-lang-select"
            value=${language}
            onChange=${handleLangChange}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="bash">Bash / Shell</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>

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
