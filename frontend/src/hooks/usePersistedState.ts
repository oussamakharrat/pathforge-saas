'use client';

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

/**
 * A drop-in replacement for useState that persists the value in localStorage.
 *
 * - Lazy-initialises from localStorage on first render (no flicker).
 * - Writes back to localStorage on every state change (debounced automatically
 *   by React's batching).
 * - Handles quota errors, corrupt JSON, and missing localStorage gracefully.
 * - Callback-updater friendly: `setState(prev => ...)` works just like useState.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as T;
        // Merge objects so new default keys are not lost
        if (isPlainObject(defaultValue) && isPlainObject(parsed)) {
          return { ...defaultValue, ...parsed };
        }
        return parsed;
      }
    } catch {
      // localStorage unavailable, corrupt data, or quota exceeded — use default
    }
    return defaultValue;
  });

  // Write to localStorage on every change, but skip the very first render
  // (the value already came from localStorage, so writing it back is wasteful).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full — silently ignore (data stays in memory)
    }
  }, [key, state]);

  return [state, setState];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
