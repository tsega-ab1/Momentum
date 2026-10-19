// Studio editor state with undo/redo. Pure, so it is tested without React.
// History covers base color, shade count and visibility. The name is separate:
// typing already has the browser's own undo.
import { normalizeHex } from "./color.js";
import { SHADE_COUNTS } from "./constants.js";

export const COALESCE_MS = 600;
export const DEFAULT_BASE = "#c9f27a";

export function initStudio({ name = "", base = DEFAULT_BASE, count = 11, isPublic = true } = {}) {
  return {
    name,
    present: {
      base: normalizeHex(base) ?? DEFAULT_BASE,
      count: SHADE_COUNTS.includes(Number(count)) ? Number(count) : 11,
      isPublic: Boolean(isPublic),
    },
    past: [],
    future: [],
    lastKind: null,
    lastAt: 0,
  };
}

function commit(state, patch, kind, at) {
  const next = { ...state.present, ...patch };
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  // Dragging a color picker fires many changes. Merge rapid base changes into one undo step.
  const merge = kind === "base" && state.lastKind === "base" && at - state.lastAt < COALESCE_MS;
  return {
    ...state,
    present: next,
    past: merge ? state.past : [...state.past, state.present],
    future: [],
    lastKind: kind,
    lastAt: at,
  };
}

export function studioReducer(state, action) {
  switch (action.type) {
    case "set_name":
      return { ...state, name: action.value };
    case "set_base": {
      const hex = normalizeHex(action.value);
      return hex ? commit(state, { base: hex }, "base", action.at ?? 0) : state;
    }
    case "set_count":
      return commit(state, { count: action.value }, "count", action.at ?? 0);
    case "set_public":
      return commit(state, { isPublic: Boolean(action.value) }, "public", action.at ?? 0);
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        ...state,
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
        lastKind: null,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { ...state, present: next, past: [...state.past, state.present], future: rest, lastKind: null };
    }
    case "reset":
      return initStudio(action.value);
    default:
      return state;
  }
}

export const canUndo = (state) => state.past.length > 0;
export const canRedo = (state) => state.future.length > 0;
