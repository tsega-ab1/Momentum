"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("momentum-onboarded") === "true";
    setOnboarded(done);
    setChecked(true);
    if (!done) {
      router.replace("/onboarding");
    }
  }, [router]);

  if (!checked || !onboarded) {
    return null;
  }

  return (
    <main className="page">
      <h1>Momentum</h1>
      <p className="text-dim">Keep your career moving.</p>

      <div className="card" style={{ marginTop: 24 }}>
        <p>No routine yet.</p>
        <Link href="/chat" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: 12 }}>
          Talk to AI
        </Link>
      </div>
    </main>
  );
}
