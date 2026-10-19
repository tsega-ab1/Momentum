"use client";

import { useCallback, useEffect, useState } from "react";
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

export function usePreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setReady(true);
  }, []);

  const update = useCallback(
    (patch) => {
      const next = sanitizePrefs({ ...prefs, ...patch });
      setPrefs(next);
      savePrefs(next);
    },
    [prefs]
  );

  return { prefs, update, ready };
}
