"use client";

import ExportBlock from "@/components/ExportBlock";

// Uses the native <dialog>: focus moves in, Escape closes it, focus returns to the trigger.
export default function ExportDialog({ dialogRef, open, onClosed, system, defaultFormat }) {
  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="export-title"
      onClose={onClosed}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close(); // click on the backdrop
      }}
    >
      <div className="dialog-body">
        <div className="dialog-head">
          <h2 id="export-title" className="card-title">
            Export “{system.name}”
          </h2>
          <button type="button" className="btn" onClick={() => dialogRef.current?.close()}>
            Close
          </button>
        </div>
        {open && <ExportBlock system={system} defaultFormat={defaultFormat} />}
      </div>
    </dialog>
  );
}
