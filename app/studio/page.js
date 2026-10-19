import { Suspense } from "react";
import StudioEditor from "@/components/studio/StudioEditor";
import { getCurrentUser } from "@/lib/session";
import { normalizeHex } from "@/lib/color";
import { SHADE_COUNTS } from "@/lib/constants";

export const metadata = { title: "Studio" };

export default function StudioPage({ searchParams }) {
  return (
    <>
      <h1 className="page-title">Studio</h1>
      <p className="muted lede-sm">Pick a base color, tune the scale, check contrast, then export or save it.</p>
      <Suspense fallback={<p className="muted">Loading the studio…</p>}>
        <NewStudio searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// Reads the session and the URL (for "remix"), so it sits behind <Suspense>.
async function NewStudio({ searchParams }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const base = normalizeHex(typeof query.base === "string" ? query.base : "");
  const count = Number(query.count);
  const name = typeof query.name === "string" ? query.name.slice(0, 40) : "";
  const validCount = SHADE_COUNTS.includes(count);

  return (
    <StudioEditor
      initial={{ name, base: base ?? undefined, count: validCount ? count : 11, isPublic: true, explicit: Boolean(base) || validCount }}
      signedIn={Boolean(user)}
    />
  );
}
