/**
 * @module BlockRegistry
 * @description Central plugin registry for PortableText block renderers.
 */

const registry = new Map();

export const BlockRegistry = {
  /**
   * Register a block renderer for a given block type name.
   *
   * @param {string} typeName - The _type name of the block (e.g. 'image', 'codeBlock', 'block')
   * @param {Function} Component - Preact component function rendering this block type.
   */
  register(typeName, Component) {
    registry.set(typeName, Component);
  },

  /**
   * Resolve a block renderer component for a given type name.
   *
   * @param {string} typeName - The _type name of the block.
   * @param {Function} [FallbackComponent] - Fallback component if type is unregistered.
   * @returns {Function} The resolved block component.
   */
  get(typeName, FallbackComponent) {
    return registry.get(typeName) || FallbackComponent;
  },

  /**
   * Clear all registered block renderers.
   */
  clear() {
    registry.clear();
  },
};
