import { html } from "htm/preact";
import { BlockCardWrapper } from "./BlockCardWrapper.js";
import { ICONS } from "../components/icons.js";

/**
 * Modular Code Block component (defaults language to typescript).
 *
 * @param {object} props
 * @param {object} props.value - Code block JSON value.
 * @param {object} props.schemaType - Compiled schema type.
 * @param {Array} props.path - Tree path inside document.
 */
export function CodeBlock({ value, schemaType, path }) {
  const language = value?.language || "typescript";

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
          <span class="pe-code-lang">${language}</span>
          ${value?.filename &&
          html`<span class="pe-code-file">${value.filename}</span>`}
        </div>
        <pre class="pe-code-body"><code>${value?.code ||
        "// No code entered"}</code></pre>
      </div>
    <//>
  `;
}
