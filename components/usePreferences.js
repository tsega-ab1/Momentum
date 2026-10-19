"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_PREFS, sanitizePrefs } from "@/lib/prefs";

const KEY = "momentum-prefs";

export function loadPrefs() {
  try {
    return sanitizePrefs(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage can be blocked. The preference still applies for this visit.
  }
}

// A tiny external store. `current` is the in-memory copy, so a preference still applies
// for this visit even when storage is blocked, and the snapshot stays referentially stable.
let current;
const listeners = new Set();

function getSnapshot() {
  if (current === undefined) current = loadPrefs();
  return current;
}

const getServerSnapshot = () => DEFAULT_PREFS;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  // Pick up changes made in another tab.
  const onStorage = (e) => {
    if (e.key === KEY || e.key === null) {
      current = loadPrefs();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(patch) {
  const next = sanitizePrefs({ ...getSnapshot(), ...patch });
  current = next;
  savePrefs(next);
  emit();
}

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false on the server and during hydration, true once the client has taken over.
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  return { prefs, update, ready };
}
