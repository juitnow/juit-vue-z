import { computed, ref } from 'vue'

import type { ComputedRef } from 'vue'

/** A loader, keeping track of concurrent loading callbacks */
export interface ZLoader {
  /** The loading state */
  loading: ComputedRef<boolean>
  /** Execute a callback triggering the loading state */
  load<T>(callback: () => T | Promise<T>): Promise<T>
}

/* ===== INTERNALS ========================================================== */

/** Create a new loader with an optional parent (the root loader) */
function loader(parent?: ZLoader | undefined): ZLoader {
  const _loading = ref(0)

  /** The loading state, computed by the _parent_ and this loader */
  const loading = computed(() => parent?.loading.value || (_loading.value > 0))

  /** Execute a callback triggering the loading state */
  async function load<T>(callback: () => T | Promise<T>): Promise<T> {
    _loading.value ++
    try {
      return await callback()
    } finally {
      _loading.value --
    }
  }

  /* Here is the loader */
  return { loading, load }
}

/** The global (root) loader */
const rootLoader = loader()

/* ===== EXPORTED ========================================================== */

/** Use the global loader */
export function useLoader(): ZLoader {
  return rootLoader
}

/**
 * Create a new loader, potentially decoupled from the root one.
 *
 * When `detached` is `false` (or not defined), the loader will be linked to
 * the root loader, meaning that when the root loader is loading, this loader
 * will also be loading (but not vice-versa, the loading state of this child
 * will _not_ affect the state of the root loader).
 *
 * When `detached` is `true`, the loader will be completely independent from
 * the root loader.
 */
export function createLoader(detached?: boolean): ZLoader {
  return loader(detached ? undefined : rootLoader)
}
