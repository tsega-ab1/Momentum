import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/app/actions";

// A server component: it reads the session cookie, so the layout puts it behind <Suspense>.
export default async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/signin" className="nav-link">
        Sign in
      </Link>
    );
  }
  return (
    <div className="account">
      <p className="small muted" data-testid="account-name">
        Signed in as <strong>{user.name}</strong>
      </p>
      <form action={signOut}>
        <button type="submit" className="btn">
          Sign out
        </button>
      </form>
    </div>
  );
}
