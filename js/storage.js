/**
 * Safe LocalStorage wrapper with error handling and fallback support.
 */
const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[store.get] Error parsing localStorage key "${key}":`, err);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[store.set] Error saving to localStorage key "${key}":`, err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`[store.remove] Error removing localStorage key "${key}":`, err);
      return false;
    }
  }
};