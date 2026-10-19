import { Suspense } from "react";
import Link from "next/link";
import SettingsForm from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/app/actions";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <div className="stack">
        <Suspense fallback={<p className="muted">Loading account…</p>}>
          <AccountPanel />
        </Suspense>
        <SettingsForm />
      </div>
    </>
  );
}

async function AccountPanel() {
  const user = await getCurrentUser();
  return (
    <section className="card" aria-labelledby="account-title">
      <h2 id="account-title" className="card-title">
        Account
      </h2>
      {user ? (
        <>
          <p>
            <strong>{user.name}</strong>
            <br />
            <span className="muted">{user.email}</span>
          </p>
          <form action={signOut}>
            <button type="submit" className="btn">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <p>
          You are not signed in. <Link href="/signin">Sign in</Link> to save and favorite systems.
        </p>
      )}
    </section>
  );
}
