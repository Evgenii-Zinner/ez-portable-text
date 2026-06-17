import { html } from "htm/preact";
import { Component } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  EditorProvider,
  PortableTextEditable,
  useEditor,
  usePortableTextEditor,
  defineSchema,
} from "@portabletext/editor";
import {
  isActiveDecorator,
  isActiveStyle,
} from "@portabletext/editor/selectors";

// Default schema if none is provided
const defaultSchema = defineSchema({
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
  lists: [],
  inlineObjects: [],
  blockObjects: [],
});

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

// Stateful hook to subscribe to the editor actor's snapshot changes
function useEditorSnapshot(editor) {
  const [snapshot, setSnapshot] = useState(() => editor.snapshot);

  useEffect(() => {
    const subscription = editor.subscribe({
      next: (nextSnapshot) => {
        setSnapshot(nextSnapshot);
      },
    });
    return () => subscription.unsubscribe();
  }, [editor]);

  return snapshot;
}

function Toolbar() {
  const editor = useEditor();
  const pte = usePortableTextEditor();
  const snapshot = useEditorSnapshot(editor);

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

  const isMarkActive = (mark) =>
    snapshot ? isActiveDecorator(mark)(snapshot) : false;
  const isStyleActive = (style) =>
    snapshot ? isActiveStyle(style)(snapshot) : false;

  return html`
    <div class="pe-toolbar-wrapper">
      <button
        class="pe-btn ${isMarkActive("strong") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("strong")}
        onPointerDown=${handleToggleMark("strong")}
      >
        B
      </button>
      <button
        class="pe-btn ${isMarkActive("em") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("em")}
        onPointerDown=${handleToggleMark("em")}
      >
        I
      </button>
      <button
        class="pe-btn ${isMarkActive("underline") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("underline")}
        onPointerDown=${handleToggleMark("underline")}
      >
        U
      </button>
      <button
        class="pe-btn ${isMarkActive("code") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleMark("code")}
        onPointerDown=${handleToggleMark("code")}
      >
        &lt;/&gt;
      </button>
      <div class="pe-divider"></div>
      <button
        class="pe-btn ${isStyleActive("normal") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("normal")}
        onPointerDown=${handleToggleStyle("normal")}
      >
        P
      </button>
      <button
        class="pe-btn ${isStyleActive("h1") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("h1")}
        onPointerDown=${handleToggleStyle("h1")}
      >
        H1
      </button>
      <button
        class="pe-btn ${isStyleActive("h2") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("h2")}
        onPointerDown=${handleToggleStyle("h2")}
      >
        H2
      </button>
      <button
        class="pe-btn ${isStyleActive("blockquote") ? "pe-btn-active" : ""}"
        onMouseDown=${handleToggleStyle("blockquote")}
        onPointerDown=${handleToggleStyle("blockquote")}
      >
        Quote
      </button>
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

function EditorListener({ onChange, onSnapshot }) {
  const editor = useEditor();
  useEffect(() => {
    const subscription = editor.subscribe({
      next: (snapshot) => {
        if (onChange) onChange(snapshot.context.value);
        if (onSnapshot) onSnapshot(snapshot.context.value);
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
 * @param {function} [props.onChange] - Callback fired when document content changes.
 * @returns {import('htm/preact').Html} The Preact HTML element.
 */
export function EditorUI({ initialValue, schema, onChange }) {
  const [activeTab, setActiveTab] = useState("visual");
  const [currentValue, setCurrentValue] = useState(initialValue || []);

  const htmlHighlighted = syntaxHighlight(currentValue);

  return html`
    <div class="pe-editor-container pe-theme-dark">
      <div class="pe-tabs">
        <div class="pe-tab ${activeTab === "visual" ? "active" : ""}" onClick=${() => setActiveTab("visual")}>Visual Editor</div>
        <div class="pe-tab ${activeTab === "json" ? "active" : ""}" onClick=${() => setActiveTab("json")}>Clean JSON</div>
      </div>
      
      <${EditorProvider} 
        initialConfig=${{
          initialValue: initialValue || undefined,
          schemaDefinition: schema || defaultSchema,
        }}
      >
        <${EditorListener} onChange=${onChange} onSnapshot=${setCurrentValue} />
        
        <div style=${{ display: activeTab === "visual" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <${Toolbar} />
          <div class="pe-visual-canvas">
            <${PortableTextEditable} 
              renderDecorator=${renderDecorator}
              renderStyle=${renderStyle}
            />
          </div>
        </div>

        <div style=${{ display: activeTab === "json" ? "block" : "none", flex: 1, overflow: "hidden" }}>
          <pre class="pe-json-view" dangerouslySetInnerHTML=${{ __html: htmlHighlighted }}></pre>
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
