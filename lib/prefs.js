// Per-browser preferences. Pure helpers (the hook that touches localStorage lives in components/).
import { EXPORT_FORMATS } from "./color.js";
import { SHADE_COUNTS } from "./constants.js";

export const DEFAULT_PREFS = { format: "css", count: 11 };

// Never trust stored data: anything invalid falls back to the default.
export function sanitizePrefs(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  return {
    format: EXPORT_FORMATS.includes(obj.format) ? obj.format : DEFAULT_PREFS.format,
    count: SHADE_COUNTS.includes(Number(obj.count)) ? Number(obj.count) : DEFAULT_PREFS.count,
  };
}
