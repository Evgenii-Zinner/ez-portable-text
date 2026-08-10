import { BlockRegistry } from "./BlockRegistry.js";
import { TextBlock } from "./TextBlock.js";
import { ImageBlock } from "./ImageBlock.js";
import { CodeBlock } from "./CodeBlock.js";
import { HeroBlock } from "./HeroBlock.js";
import { TableBlock } from "./TableBlock.js";
import { VideoBlock } from "./VideoBlock.js";
import { EmbedBlock } from "./EmbedBlock.js";
import { FallbackBlock } from "./FallbackBlock.js";

// Register core block renderers
BlockRegistry.register("block", TextBlock);
BlockRegistry.register("image", ImageBlock);
BlockRegistry.register("codeBlock", CodeBlock);
BlockRegistry.register("hero", HeroBlock);
BlockRegistry.register("table", TableBlock);
BlockRegistry.register("video", VideoBlock);
BlockRegistry.register("embed", EmbedBlock);

export {
  BlockRegistry,
  TextBlock,
  ImageBlock,
  CodeBlock,
  HeroBlock,
  TableBlock,
  VideoBlock,
  EmbedBlock,
  FallbackBlock,
};

/**
 * Main block routing handler for PortableTextEditable.
 *
 * @param {object} props - PortableText renderBlock props.
 * @returns {import('htm/preact').Html} Output component tree.
 */
export function renderBlock(props) {
  const { schemaType, value, children, path } = props;
  const typeName = schemaType?.name || value?._type || "block";

  const Component = BlockRegistry.get(typeName, FallbackBlock);

  return Component({ value, schemaType, path, children });
}
