"use client";

import { useActionState, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { saveSystem } from "@/app/actions";
import { isValidHex, makeShades, normalizeHex, randomColor } from "@/lib/color";
import { SHADE_COUNTS } from "@/lib/constants";
import { canRedo, canUndo, initStudio, studioReducer } from "@/lib/studio-reducer";
import { loadPrefs } from "@/components/usePreferences";
import SwatchStrip from "@/components/SwatchStrip";
import ScalePanel from "./ScalePanel";
import ContrastPanel from "./ContrastPanel";
import PreviewPanel from "./PreviewPanel";
import ExportDialog from "./ExportDialog";

const DRAFT_KEY = "momentum-draft";

function SaveButton({ isEdit }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Save system"}
    </button>
  );
}

export default function StudioEditor({ initial, signedIn }) {
  const isEdit = Boolean(initial.id);
  const [state, dispatch] = useReducer(studioReducer, initial, initStudio);
  const [hexText, setHexText] = useState(state.present.base);
  const [hexTouched, setHexTouched] = useState(false);
  const [form, formAction] = useActionState(saveSystem, { errors: {} });
  const dialogRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("css");

  const { base, count, isPublic } = state.present;
  const colors = useMemo(() => makeShades(base, count), [base, count]);
  const errors = form.errors ?? {};
  const nextPath = isEdit ? `/studio/${initial.id}` : "/studio";

  // On first load of a NEW system: restore a draft saved before signing in, else apply the person's defaults.
  useEffect(() => {
    if (isEdit) return;
    const prefs = loadPrefs();
    setExportFormat(prefs.format);
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
      if (draft && isValidHex(draft.base)) {
        sessionStorage.removeItem(DRAFT_KEY);
        dispatch({ type: "reset", value: draft });
        setHexText(normalizeHex(draft.base));
        return;
      }
    } catch {
      // A broken draft is ignored.
    }
    if (!initial.explicit && prefs.count !== initial.count) {
      dispatch({ type: "reset", value: { ...initial, count: prefs.count } });
    }
    // Runs once on mount, on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the hex box in step with undo/redo, without fighting the person while they type.
  useEffect(() => {
    if (normalizeHex(hexText) !== base) setHexText(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  function setBase(value) {
    dispatch({ type: "set_base", value, at: Date.now() });
  }

  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name: state.name, base, count, isPublic }));
    } catch {
      // Without storage the draft is simply not kept.
    }
  }

  function openExport() {
    setExportOpen(true);
    dialogRef.current?.showModal();
  }

  const hexInvalid = hexTouched && !isValidHex(hexText);
  const exportSystemData = { name: state.name.trim() || "Untitled", colors };

  return (
    <div className="studio">
      <div className="studio-col">
        <section className="card" aria-labelledby="controls-title">
          <h2 id="controls-title" className="card-title">
            Base color
          </h2>

          <div className="field">
            <label htmlFor="hex">Hex value</label>
            <div className="hex-row">
              <input
                type="color"
                aria-label="Pick base color"
                value={base}
                onChange={(e) => {
                  setHexText(e.target.value);
                  setBase(e.target.value);
                }}
              />
              <input
                id="hex"
                type="text"
                value={hexText}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={hexInvalid}
                aria-describedby={hexInvalid ? "hex-error" : undefined}
                onChange={(e) => {
                  setHexText(e.target.value);
                  if (isValidHex(e.target.value)) setBase(e.target.value);
                }}
                onBlur={() => setHexTouched(true)}
              />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const next = randomColor();
                  setHexText(next);
                  setBase(next);
                }}
              >
                Random
              </button>
            </div>
            {hexInvalid && (
              <p id="hex-error" role="alert" className="error">
                Enter a valid hex like #6485f5 (3 or 6 digits).
              </p>
            )}
          </div>

          <div className="field">
            <span className="label" id="count-label">
              Shades
            </span>
            <div className="segmented" role="group" aria-labelledby="count-label">
              {SHADE_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="seg"
                  aria-pressed={count === n}
                  onClick={() => dispatch({ type: "set_count", value: n, at: Date.now() })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn" disabled={!canUndo(state)} onClick={() => dispatch({ type: "undo" })}>
              Undo
            </button>
            <button type="button" className="btn" disabled={!canRedo(state)} onClick={() => dispatch({ type: "redo" })}>
              Redo
            </button>
          </div>

          <SwatchStrip colors={colors} tall />
        </section>

        <ScalePanel colors={colors} />

        <section className="card" aria-labelledby="save-title">
          <h2 id="save-title" className="card-title">
            {isEdit ? "Save changes" : "Save to your account"}
          </h2>
          <form action={formAction} noValidate>
            <input type="hidden" name="id" value={initial.id ?? ""} />
            <input type="hidden" name="base" value={base} />
            <input type="hidden" name="count" value={count} />
            <input type="hidden" name="isPublic" value={String(isPublic)} />

            <div className="field">
              <label htmlFor="name">System name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={state.name}
                maxLength={40}
                placeholder="e.g. Brand blue"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={(e) => dispatch({ type: "set_name", value: e.target.value })}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="error">
                  {errors.name}
                </p>
              )}
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => dispatch({ type: "set_public", value: e.target.checked, at: Date.now() })}
              />
              Public: anyone with the link can view it, and it appears in Explore
            </label>

            {(errors.base || errors.count || errors.form) && (
              <p role="alert" className="error">
                {errors.form ?? errors.base ?? errors.count}
              </p>
            )}

            <div className="actions">
              {signedIn ? (
                <SaveButton isEdit={isEdit} />
              ) : (
                <Link
                  className="btn btn-primary"
                  href={`/signin?next=${encodeURIComponent(nextPath)}`}
                  onClick={saveDraft}
                >
                  Sign in to save
                </Link>
              )}
              <button type="button" className="btn" onClick={openExport}>
                Export…
              </button>
            </div>
            {!signedIn && (
              <p className="muted small">Your work is kept while you sign in. You can export without an account.</p>
            )}
          </form>
        </section>
      </div>

      <div className="studio-col">
        <ContrastPanel key={colors.length} colors={colors} />
        <PreviewPanel colors={colors} />
      </div>

      <ExportDialog
        dialogRef={dialogRef}
        open={exportOpen}
        onClosed={() => setExportOpen(false)}
        system={exportSystemData}
        defaultFormat={exportFormat}
      />
    </div>
  );
}
