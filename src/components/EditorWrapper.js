import { html } from "htm/preact";
import { Component } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import {
  EditorProvider,
  PortableTextEditable,
  defineSchema,
  useEditor,
} from "@portabletext/editor";
import { PRE_BUNDLED_BLOCKS } from "./icons.js";
import { renderBlock } from "./CustomBlockCard.js";
import { Toolbar } from "./Toolbar.js";
import { useEditorSnapshot } from "./hooks.js";

/**
 * Basic JSDoc definitions.
 */

/**
 * Compiles dynamic editor schema by merging default schemas and custom blocks.
 *
 * @param {Array} [customBlocks=[]] - Consumer-provided custom blocks.
 * @returns {object} Compiled schema object.
 */
export function createEditorSchema(customBlocks = []) {
  const blockObjects = [
    {
      name: "image",
      title: "Image",
      type: "object",
      fields: [
        { name: "url", type: "string" },
        { name: "alt", type: "string" },
        { name: "caption", type: "string" },
      ],
    },
    {
      name: "video",
      title: "Video",
      type: "object",
      fields: [
        { name: "url", type: "string" },
        { name: "caption", type: "string" },
      ],
    },
    {
      name: "table",
      title: "Table",
      type: "object",
      fields: [
        {
          name: "rows",
          type: "array",
          of: [
            {
              name: "tableRow",
              type: "object",
              fields: [
                {
                  name: "cells",
                  type: "array",
                  of: [{ type: "string" }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "codeBlock",
      title: "Code Block",
      type: "object",
      fields: [
        { name: "code", type: "string" },
        { name: "language", type: "string" },
        { name: "filename", type: "string" },
      ],
    },
    ...customBlocks.map((b) => {
      const fields = Object.keys(b.defaultValue || {}).map((key) => {
        const val = b.defaultValue[key];
        const type =
          typeof val === "number"
            ? "number"
            : typeof val === "boolean"
              ? "boolean"
              : "string";
        return { name: key, type };
      });
      return {
        name: b.name,
        title: b.title,
        type: "object",
        fields: fields,
      };
    }),
  ];

  return defineSchema({
    decorators: [
      { name: "strong", title: "Strong" },
      { name: "em", title: "Emphasis" },
      { name: "underline", title: "Underline" },
      { name: "code", title: "Code" },
    ],
    styles: [
      { name: "normal", title: "Normal" },
      { name: "h1", title: "Heading 1" },
      { name: "h2", title: "Heading 2" },
      { name: "blockquote", title: "Quote" },
    ],
    annotations: [],
    lists: [
      { name: "bullet", title: "Bullet" },
      { name: "number", title: "Number" },
    ],
    inlineObjects: [],
    blockObjects: blockObjects,
  });
}

// Basic Renderers for styling text inside the Editable
function renderDecorator(props) {
  if (props.value === "strong") return html`<strong>${props.children}</strong>`;
  if (props.value === "em") return html`<em>${props.children}</em>`;
  if (props.value === "underline") return html`<u>${props.children}</u>`;
  if (props.value === "code")
    return html`<code class="pe-code-span">${props.children}</code>`;

  return props.children;
}

// Block renderer for styles
function renderStyle(props) {
  if (props.value === "h1")
    return html`<h1 class="pe-h1">${props.children}</h1>`;
  if (props.value === "h2")
    return html`<h2 class="pe-h2">${props.children}</h2>`;
  if (props.value === "blockquote")
    return html`<blockquote class="pe-blockquote">
      ${props.children}
    </blockquote>`;

  return props.children;
}

// List item renderer for visual list display
function renderListItem(props) {
  const { value, level, children } = props;
  const listClass = value === "bullet" ? "pe-list-bullet" : "pe-list-number";

  return html`
    <div
      class="pe-list-item ${listClass}"
      style=${{ "--pe-list-level": level }}
    >
      ${children}
    </div>
  `;
}

// A simple JSON syntax highlighter
function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  return json.replace(regex, function (match) {
    let cls = "number";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "key";
      } else {
        cls = "string";
      }
    } else if (/true|false/.test(match)) {
      cls = "boolean";
    } else if (/null/.test(match)) {
      cls = "null";
    }
    return '<span class="' + cls + '">' + match + "</span>";
  });
}

function EditorListener({ onChange, onSnapshot, onEditorInit }) {
  useEffect(() => {
    // We get editor reference from DOM element via internal hook,
    // but Preact handles it inside EditorProvider context.
  }, []);
  return null;
}

// Custom hook or listener component to access Editor context
function EditorContextBridge({ onChange, onSnapshot, onEditorInit }) {
  // Can only use hooks inside the EditorProvider
  const editor = useEditor();

  useEffect(() => {
    if (onEditorInit) {
      onEditorInit(editor);
    }
  }, [editor, onEditorInit]);

  useEffect(() => {
    const subscription = editor.subscribe({
      next: (snapshot) => {
        const val = snapshot.context.value;
        if (val !== undefined) {
          if (onChange) onChange(val);
          if (onSnapshot) onSnapshot(val);
        }
      },
    });
    return () => subscription.unsubscribe();
  }, [editor, onChange, onSnapshot]);

  return null;
}

/**
 * EditorUI component rendering the Toolbar and PortableText canvas.
 *
 * @param {object} props - The component props.
 * @param {Array} [props.initialValue] - The initial PortableText JSON value.
 * @param {object} [props.schema] - The schema definition.
 * @param {Array} [props.customBlocks] - Consumer custom blocks configuration.
 * @param {function} [props.onChange] - Callback fired when document content changes.
 * @param {function} [props.onEditorInit] - Callback exposing the internal editor actor.
 * @returns {import('htm/preact').Html} The Preact HTML element.
 */
export function EditorUI({
  initialValue,
  schema,
  customBlocks = [],
  onChange,
  onEditorInit,
}) {
  const [activeTab, setActiveTab] = useState("visual");
  const [currentValue, setCurrentValue] = useState(initialValue || []);

  const editorRef = useRef(null);
  const gutterRef = useRef(null);
  const textareaRef = useRef(null);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(currentValue, null, 2),
  );
  const [jsonError, setJsonError] = useState(null);

  const lineCount = jsonText.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const schemaDefinition = useMemo(() => {
    if (schema) return schema;
    return createEditorSchema(customBlocks);
  }, [schema, customBlocks]);

  // Generate unique key based on block names to force-remount EditorProvider if schema changes
  const schemaKey = useMemo(() => {
    const names = schemaDefinition.blockObjects?.map((b) => b.name) || [];
    return names.join(",");
  }, [schemaDefinition]);

  // Keep jsonText in sync with visual edits when switching or when value changes
  useEffect(() => {
    if (activeTab === "visual") {
      setJsonText(JSON.stringify(currentValue, null, 2));
      setJsonError(null);
    }
  }, [currentValue, activeTab]);

  const handleEditorInit = (editor) => {
    editorRef.current = editor;
    if (onEditorInit) onEditorInit(editor);
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);

    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("PortableText must be a JSON array of blocks.");
      }
      setJsonError(null);

      if (editorRef.current) {
        editorRef.current.send({ type: "update value", value: parsed });
      }
      if (onChange) onChange(parsed);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  return html`
    <div class="pe-editor-container pe-theme-dark">
      <div class="pe-tabs">
        <div
          class="pe-tab ${activeTab === "visual" ? "active" : ""}"
          onClick=${() => setActiveTab("visual")}
        >
          Visual Editor
        </div>
        <div
          class="pe-tab ${activeTab === "json" ? "active" : ""}"
          onClick=${() => setActiveTab("json")}
        >
          JSON
        </div>
      </div>

      <${EditorProvider}
        key=${schemaKey}
        initialConfig=${{
          initialValue: initialValue || undefined,
          schemaDefinition: schemaDefinition,
        }}
      >
        <${EditorContextBridge}
          onChange=${onChange}
          onSnapshot=${setCurrentValue}
          onEditorInit=${handleEditorInit}
        />

        <div
          style=${{
            display: activeTab === "visual" ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <${Toolbar} customBlocks=${customBlocks} />
          <div class="pe-visual-canvas">
            <${PortableTextEditable}
              renderDecorator=${renderDecorator}
              renderStyle=${renderStyle}
              renderBlock=${renderBlock}
              renderListItem=${renderListItem}
            />
          </div>
        </div>

        <div
          style=${{
            display: activeTab === "json" ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div class="pe-json-editor-container">
            <div class="pe-json-gutter" ref=${gutterRef}>
              ${lineNumbers.map(
                (n) => html`<div class="pe-json-gutter-line">${n}</div>`,
              )}
            </div>
            <textarea
              class="pe-json-textarea"
              value=${jsonText}
              onInput=${handleJsonChange}
              onScroll=${handleScroll}
              ref=${textareaRef}
              placeholder="[{...}]"
            />
          </div>
          ${
            jsonError &&
            html`
              <div class="pe-json-error">
                <span class="pe-error-icon">⚠️</span> ${jsonError}
              </div>
            `
          }
        </div>
      </${EditorProvider}>
    </div>
  `;
}

/**
 * EditorWrapper class wrapping EditorUI.
 *
 * @extends Component
 * @returns {import('htm/preact').Html} The Preact HTML element.
 */
export class EditorWrapper extends Component {
  render() {
    return html`<${EditorUI} ...${this.props} />`;
  }
}
