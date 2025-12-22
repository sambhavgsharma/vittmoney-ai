/**
 * Safe localStorage wrapper that prevents SSR crashes and handles polyfills
 * Checks if window exists AND localStorage is the real Web Storage API
 * Protects against Node.js polyfills and test environments
 */
export const safeLocalStorage = {
  get(key: string): string | null {
    // Check window exists
    if (typeof window === "undefined") return null;

    // Check localStorage exists and is the real API
    if (
      !("localStorage" in window) ||
      typeof window.localStorage?.getItem !== "function"
    ) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    // Check window exists
    if (typeof window === "undefined") return;

    // Check localStorage exists and is the real API
    if (
      !("localStorage" in window) ||
      typeof window.localStorage?.setItem !== "function"
    ) {
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Silently fail if storage is unavailable (quota exceeded, etc)
    }
  },

  remove(key: string): void {
    // Check window exists
    if (typeof window === "undefined") return;

    // Check localStorage exists and is the real API
    if (
      !("localStorage" in window) ||
      typeof window.localStorage?.removeItem !== "function"
    ) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail if storage is unavailable
    }
  },
};
