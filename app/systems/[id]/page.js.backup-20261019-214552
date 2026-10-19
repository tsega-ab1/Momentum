import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SwatchStrip from "@/components/SwatchStrip";
import ExportBlock from "@/components/ExportBlock";
import FavoriteButton from "@/components/FavoriteButton";
import CopyButton from "@/components/CopyButton";
import { getPublicIdsCached, getPublicSystemCached } from "@/lib/cached";
import { getCurrentUser } from "@/lib/session";
import { shadeNumbers, toHslString, toOklchString, toRgbString } from "@/lib/color";

// Every public system known at build time is prebuilt. New ones are rendered on first request.
export async function generateStaticParams() {
  const ids = await getPublicIdsCached();
  return (ids.length ? ids : ["none"]).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const system = await getPublicSystemCached(id);
  if (!system) return { title: "System not found" };
  const description = `A ${system.count}-shade color system based on ${system.base}, by ${system.ownerName}. Copy it or export it as CSS, Tailwind, SCSS or JSON.`;
  return {
    title: `${system.name} color system`,
    description,
    openGraph: { title: `${system.name} color system`, description, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function SystemPage({ params }) {
  const { id } = await params;
  const system = await getPublicSystemCached(id);
  if (!system) notFound(); // private systems also land here: public pages never reveal them

  const steps = shadeNumbers(system.colors.length);
  const remix = `/studio?base=${encodeURIComponent(system.base)}&count=${system.count}&name=${encodeURIComponent(`${system.name} remix`)}`;

  return (
    <article>
      <p className="muted small">
        <Link href="/explore">← Explore</Link>
      </p>
      <h1 className="page-title">{system.name}</h1>
      <p className="muted">
        By {system.ownerName} · base <code>{system.base}</code> · {system.count} shades
      </p>

      <SwatchStrip colors={system.colors} label={`${system.name} color scale`} tall />

      <div className="actions">
        <Suspense fallback={<span className="muted small">…</span>}>
          <SystemActions system={system} />
        </Suspense>
        <Link className="btn" href={remix}>
          Remix in Studio
        </Link>
      </div>

      <section className="card" aria-labelledby="shades-title">
        <h2 id="shades-title" className="card-title">
          Shades
        </h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Every shade in {system.name}</caption>
            <thead>
              <tr>
                <th scope="col">Shade</th>
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
                    <span className="dot" style={{ background: color }} aria-hidden="true" /> {steps[i]}
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
          downloadBase={`/api/systems/${system.id}/export`}
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
      <FavoriteButton systemId={system.id} name={system.name} count={system.favorites} />
      {user?.id === system.ownerId && (
        <Link className="btn" href={`/studio/${system.id}`}>
          Edit in Studio
        </Link>
      )}
    </>
  );
}
