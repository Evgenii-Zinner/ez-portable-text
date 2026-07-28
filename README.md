# ez-portable-text

[![License](https://img.shields.io/github/license/Evgenii-Zinner/ez-portable-text?style=flat-square&color=10b981)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Evgenii-Zinner/ez-portable-text?style=flat-square&color=10b981)](https://github.com/Evgenii-Zinner/ez-portable-text/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Evgenii-Zinner/ez-portable-text?style=flat-square&color=10b981)](https://github.com/Evgenii-Zinner/ez-portable-text/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/Evgenii-Zinner/ez-portable-text?style=flat-square&color=10b981)](https://github.com/Evgenii-Zinner/ez-portable-text/pulls)

A lightweight, zero-dependency (from the consumer's perspective) vanilla JavaScript rich-text editor wrapper around Sanity's `@portabletext/editor` (v7.x). It natively reads and writes PortableText JSON, compiles to highly optimized ESM and UMD bundles, and exposes a native custom Web Component (`<ez-portable-text>`).

---

## Features

- **Zero-Dependency Web Component**: Easily mounts as `<ez-portable-text>` in any environment (Vanilla HTML/JS, HTMX, Alpine.js, PHP, etc.).
- **Interactive Toolbar**: Formatting controls (Bold, Italic, Underline, Code), style structures (Normal, H1, H2, Blockquote), list types (Bullet, Numbered), and custom blocks.
- **Dynamic Extensibility**: Dynamically extends schemas at runtime for custom content templates.
- **CMS Event Bridge**: Elegant separation of concerns; editor focuses on layout/visual flow and delegates content edits to the parent CMS.

---

## Installation & Bundle Usage

Load the compiled stylesheet and script inside your HTML:

```html
<link rel="stylesheet" href="dist/ez-portable-text.umd.css" />
<script src="dist/ez-portable-text.umd.js"></script>
```

Mount it anywhere in your document:

```html
<ez-portable-text id="editor"></ez-portable-text>
```

---

## API Reference

### Getting / Setting Values

Interact with the custom element directly via JavaScript:

```javascript
const editor = document.getElementById("editor");

// Read current PortableText JSON block array
console.log(editor.value);

// Set value programmatically (triggers visual refresh)
editor.value = [
  {
    _key: "block1",
    _type: "block",
    style: "normal",
    children: [
      {
        _key: "span1",
        _type: "span",
        marks: [],
        text: "Hello, World!",
      },
    ],
    markDefs: [],
  },
];

// Listen for updates
editor.addEventListener("change", (e) => {
  console.log("Updated editor value:", e.detail.value);
});
```

---

## Pre-bundled Block Types

`ez-portable-text` comes pre-equipped with standard block components:

| Block Type  | Icon | Fields (`defaultValue`)                                                 |
| :---------- | :--: | :---------------------------------------------------------------------- |
| `image`     |  🖼️  | `{ url: '', alt: '', caption: '' }`                                     |
| `video`     |  🎥  | `{ url: '', caption: '' }`                                              |
| `table`     |  📊  | `{ rows: [ { _key: 'r1', _type: 'tableRow', cells: ['', ''] }, ... ] }` |
| `codeBlock` |  💻  | `{ code: '', language: 'javascript', filename: '' }`                    |

---

## Custom Block Registration (Plugins)

You can register custom block types (like hero banners, email forms, call-to-action blocks) at runtime.

### Dynamic Property

```javascript
editor.customBlocks = [
  {
    name: "hero",
    title: "Hero Banner",
    icon: "⚡",
    defaultValue: {
      title: "Welcome!",
      subtitle: "This is a custom hero section.",
      backgroundImage: "",
    },
  },
];
```

### Programmatic Method

```javascript
editor.registerBlockType({
  name: "cta",
  title: "Call to Action",
  icon: "📣",
  defaultValue: {
    text: "Click here",
    url: "https://example.com",
  },
});
```

---

## The Event Bridge: CMS Integration

To keep the bundle size extremely small and avoid dragging heavy image uploaders or custom form managers into the rich-text editor, `ez-portable-text` uses an **Event Bridge** pattern.

1. The editor displays standard custom blocks inside the canvas as isolated cards.
2. Clicking **"Edit Block"** on a card fires an `edit-block` event.
3. The parent CMS intercepts this event, shows its native form or media library modal, and calls `e.detail.update(newData)` once editing is completed.

### Example CMS Wire-up

```javascript
const editor = document.getElementById("editor");

editor.addEventListener("edit-block", (event) => {
  const { value, path, update } = event.detail;
  const blockType = value._type;

  if (blockType === "image") {
    // 1. Open CMS Media Gallery
    cmsMediaLibrary.open({
      onSelect: (selectedImage) => {
        // 2. Feed updated data back to the editor
        update({
          url: selectedImage.url,
          alt: selectedImage.altText || "Alt description",
          caption: "My uploaded caption",
        });
      },
    });
  } else if (blockType === "hero") {
    // 3. Open custom block details form modal
    cmsModal.showForm({
      schema: {
        title: "string",
        subtitle: "string",
      },
      initialData: value,
      onSubmit: (formData) => {
        // 4. Update the block
        update(formData);
      },
    });
  }
});
```
