import { html } from "htm/preact";

/**
 * Renderer for standard PortableText text blocks (_type: 'block').
 * Passes children (spans, decorators, marks) directly to Slate editor engine.
 *
 * @param {object} props
 * @param {object} props.value - Block JSON value.
 * @param {object} props.schemaType - Compiled schema definition.
 * @param {import('htm/preact').Html} props.children - Rendered child spans/marks.
 */
export function TextBlock({ value, schemaType, children }) {
  return children;
}
