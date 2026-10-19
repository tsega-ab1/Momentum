import Link from "next/link";
import SwatchStrip from "./SwatchStrip";

// `actions` is a slot, so the same card serves Explore (favorite button) and My systems (edit/delete).
export default function SystemCard({ system, actions, showVisibility = false }) {
  const href = system.isPalette || system.isPublic
    ? `/systems/${system.id}`
    : `/studio/${system.id}`;
  return (
    <article className="card system-card">
      <SwatchStrip colors={system.colors} label={`${system.name} color scale`} />
      <h3 className="system-name">
        <Link href={href}>{system.name}</Link>
      </h3>
      <p className="muted small">
        <code>{system.base}</code> · {system.count} shades
        {showVisibility ? "" : ` · by ${system.ownerName}`}
      </p>
      {showVisibility && <span className="badge">{system.isPublic ? "Public" : "Private"}</span>}
      {actions && <div className="card-actions">{actions}</div>}
    </article>
  );
}
