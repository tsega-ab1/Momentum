import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForms from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/session";
import { safeNext } from "@/lib/safe-next";

export const metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }) {
  return (
    <>
      <h1 className="page-title">Sign in</h1>
      <p className="muted lede-sm">Save your systems, favorite others, and manage your collection.</p>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SignInContent({ searchParams }) {
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : undefined);
  if (await getCurrentUser()) redirect(next);
  return <AuthForms next={next} />;
}
