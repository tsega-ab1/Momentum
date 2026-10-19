import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import StudioEditor from "@/components/studio/StudioEditor";
import { getCurrentUser } from "@/lib/session";
import { getSystem } from "@/lib/systems";

export const metadata = { title: "Edit system" };

export default function EditStudioPage({ params }) {
  return (
    <>
      <h1 className="page-title">Edit system</h1>
      <Suspense fallback={<p className="muted">Loading your system…</p>}>
        <EditStudio params={params} />
      </Suspense>
    </>
  );
}

async function EditStudio({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/studio/${id}`)}`);

  const system = getSystem(id);
  // Not yours and not found look the same, so ids of other people's private systems are not revealed.
  if (!system || system.ownerId !== user.id) notFound();

  return (
    <StudioEditor
      initial={{ id: system.id, name: system.name, base: system.base, count: system.count, isPublic: system.isPublic, explicit: true }}
      signedIn
    />
  );
}
