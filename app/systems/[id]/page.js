import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SwatchStrip from "@/components/SwatchStrip";
import ExportBlock from "@/components/ExportBlock";
import FavoriteButton from "@/components/FavoriteButton";
import CopyButton from "@/components/CopyButton";
import { getPublicIdsCached, getPublicSystemCached } from "@/lib/cached";
import { getSystem } from "@/lib/systems";
import { getCurrentUser } from "@/lib/session";
import { shadeNumbers, toHslString, toOklchString, toRgbString } from "@/lib/color";

// Every public system known at build time is prebuilt. New ones are rendered on first request.
export async function generateStaticParams() {
  const ids = await getPublicIdsCached();
  return (ids.length ? ids : ["none"]).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const publicSystem = await getPublicSystemCached(id);
  let system = publicSystem;

  // Private palette collections are visible only to their owner.
  if (!system) {
    const user = await getCurrentUser();
    const candidate = getSystem(id);
    if (candidate?.isPalette && candidate.ownerId === user?.id) {
      system = candidate;
    }
  }

  if (!system) return { title: "System not found" };

  const description = system.isPalette
    ? `A saved ${system.count}-color collection based on ${system.base}. View and export the exact colors.`
    : `A ${system.count}-shade color system based on ${system.base}, by ${system.ownerName}. Copy it or export it as CSS, Tailwind, SCSS or JSON.`;
  const title = `${system.name} ${system.isPalette ? "color collection" : "color system"}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function SystemPage({ params }) {
  const { id } = await params;
  const publicSystem = await getPublicSystemCached(id);
  let system = publicSystem;

  // Allow the owner to view their private saved palette, but not private systems
  // belonging to other users.
  if (!system) {
    const user = await getCurrentUser();
    const candidate = getSystem(id);
    if (candidate?.isPalette && candidate.ownerId === user?.id) {
      system = candidate;
    }
  }

  if (!system) notFound();

  const steps = system.isPalette ? [] : shadeNumbers(system.colors.length);
  const remix = `/studio?base=${encodeURIComponent(system.base)}&count=${system.count}&name=${encodeURIComponent(`${system.name} remix`)}`;

  return (
    <article>
      <p className="muted small">
        <Link href={system.isPalette ? "/systems" : "/explore"}>{system.isPalette ? "← My Systems" : "← Explore"}</Link>
      </p>
      <h1 className="page-title">{system.name}</h1>
      <p className="muted">
        {system.isPalette ? (
          <>Saved color collection · base <code>{system.base}</code> · {system.count} colors</>
        ) : (
          <>By {system.ownerName} · base <code>{system.base}</code> · {system.count} shades</>
        )}
      </p>

      <SwatchStrip
        colors={system.colors}
        label={`${system.name} ${system.isPalette ? "color collection" : "color scale"}`}
        tall
      />

      <div className="actions">
        <Suspense fallback={<span className="muted small">…</span>}>
          <SystemActions system={system} />
        </Suspense>
        {!system.isPalette && (
          <Link className="btn" href={remix}>
            Remix in Studio
          </Link>
        )}
      </div>

      <section className="card" aria-labelledby="shades-title">
        <h2 id="shades-title" className="card-title">
          {system.isPalette ? "Colors" : "Shades"}
        </h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Every {system.isPalette ? "color" : "shade"} in {system.name}</caption>
            <thead>
              <tr>
                <th scope="col">{system.isPalette ? "Color" : "Shade"}</th>
                <th scope="col">Hex</th>
                <th scope="col">RGB</th>
                <th scope="col">HSL</th>
                <th scope="col">OKLCH</th>
                <th scope="col">
                  <span className="sr-only">Copy</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {system.colors.map((color, i) => (
                <tr key={i}>
                  <th scope="row">
                    <span className="dot" style={{ background: color }} aria-hidden="true" /> {system.isPalette ? `Color ${i + 1}` : steps[i]}
                  </th>
                  <td>
                    <code>{color}</code>
                  </td>
                  <td>{toRgbString(color)}</td>
                  <td>{toHslString(color)}</td>
                  <td>{toOklchString(color)}</td>
                  <td>
                    <CopyButton text={color} label="Copy" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="export-heading">
        <h2 id="export-heading" className="card-title">
          Export
        </h2>
        <ExportBlock
          system={{ name: system.name, colors: system.colors }}
          downloadBase={system.isPublic ? `/api/systems/${system.id}/export` : null}
        />
      </section>
    </article>
  );
}

// Reads the session (is this your system?), so it streams in behind <Suspense>
// while the rest of the page is served from the cache.
async function SystemActions({ system }) {
  const user = await getCurrentUser();
  return (
    <>
      {system.isPublic && (
        <FavoriteButton systemId={system.id} name={system.name} count={system.favorites} />
      )}
      {user?.id === system.ownerId && !system.isPalette && (
        <Link className="btn" href={`/studio/${system.id}`}>
          Edit in Studio
        </Link>
      )}
    </>
  );
}
