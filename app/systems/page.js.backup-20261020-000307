import { Suspense } from "react";
import { redirect } from "next/navigation";
import SystemsList from "@/components/SystemsList";
import { getCurrentUser } from "@/lib/session";
import { listFavoriteSystems, listOwnerSystems } from "@/lib/systems";

export const metadata = { title: "My systems" };

export default function SystemsPage() {
  return (
    <>
      <h1 className="page-title">My systems</h1>
      <p className="muted lede-sm">Everything you have saved, plus the systems you favorited.</p>
      <Suspense fallback={<p className="muted">Loading your systems…</p>}>
        <MySystems />
      </Suspense>
    </>
  );
}

async function MySystems() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/systems");
  return <SystemsList mine={listOwnerSystems(user.id)} favorites={listFavoriteSystems(user.id)} />;
}
