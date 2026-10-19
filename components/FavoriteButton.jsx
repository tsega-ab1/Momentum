"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

// The visitor's favorites are one shared SWR cache entry, so every button on the
// page reads the same data and a single request serves them all.
export default function FavoriteButton({ systemId, name, count: initialCount, onToggled }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data, mutate } = useSWR("/api/favorites", fetcher);
  // The count from the server after a toggle, tagged with the prop it was based on.
  // If the parent passes a new count, that wins, so no effect is needed to sync it.
  const [update, setUpdate] = useState(null);
  const count = update && update.base === initialCount ? update.value : initialCount;
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const favorited = Boolean(data?.ids.includes(systemId));

  async function toggle() {
    if (data && !data.signedIn) {
      router.push(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId }),
      });
      if (res.status === 401) {
        router.push(`/signin?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) throw new Error("Could not update favorite");
      const result = await res.json();
      setUpdate({ base: initialCount, value: result.count });
      setMessage(result.favorited ? `Added ${name} to favorites` : `Removed ${name} from favorites`);
      // Update the shared favorites entry, then refresh any cached system lists.
      await mutate(
        (current) => ({
          signedIn: true,
          ids: result.favorited
            ? [...new Set([...(current?.ids ?? []), systemId])]
            : (current?.ids ?? []).filter((id) => id !== systemId),
        }),
        { revalidate: false }
      );
      mutateGlobal((key) => typeof key === "string" && key.startsWith("/api/systems"));
      onToggled?.(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn fav"
        onClick={toggle}
        disabled={pending}
        aria-pressed={favorited}
        aria-label={`Favorite ${name}`}
      >
        <span aria-hidden="true">{favorited ? "♥" : "♡"}</span> {count}
      </button>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </>
  );
}
