import { useState, useEffect } from "preact/hooks";

/**
 * Stateful hook to subscribe to the editor actor's snapshot changes.
 *
 * @param {object} editor - Editor actor reference.
 * @returns {object} The current editor snapshot object.
 */
export function useEditorSnapshot(editor) {
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
