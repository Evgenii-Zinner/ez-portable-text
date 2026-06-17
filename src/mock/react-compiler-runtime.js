import { useMemo } from "preact/hooks";

const UNINITIALIZED = Symbol.for("react.memo_cache_sentinel");

export function c(size) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    const $ = new Array(size);
    for (let i = 0; i < size; i++) {
      $[i] = UNINITIALIZED;
    }
    return $;
  }, []);
}
