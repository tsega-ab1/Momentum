"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSystemAction } from "@/app/actions";
import SystemCard from "@/components/SystemCard";
import FavoriteButton from "@/components/FavoriteButton";
import ColorWorkspace from "@/components/systems/ColorWorkspace";

function DeleteControl({ system }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }
  return (
    <form action={deleteSystemAction} className="inline-form">
      <input type="hidden" name="id" value={system.id} />
      <span className="small">Delete “{system.name}”?</span>
      <button type="submit" className="btn btn-danger">
        Yes, delete
      </button>
      <button type="button" className="btn" onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </form>
  );
}

export default function SystemsList({ mine, favorites }) {
  const router = useRouter();
  const [tab, setTab] = useState("mine");
  const [filter, setFilter] = useState("");

  const source = tab === "mine" ? mine : favorites;
  const term = filter.trim().toLowerCase();
  const items = term ? source.filter((s) => s.name.toLowerCase().includes(term) || s.base.includes(term)) : source;

  return (
    <>
      <ColorWorkspace />
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Show">
          <button type="button" className="seg" aria-pressed={tab === "mine"} onClick={() => setTab("mine")}>
            My systems ({mine.length})
          </button>
          <button type="button" className="seg" aria-pressed={tab === "favorites"} onClick={() => setTab("favorites")}>
            Favorites ({favorites.length})
          </button>
        </div>
        <div className="field grow">
          <label htmlFor="filter">Filter by name or hex</label>
          <input id="filter" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card empty">
          {source.length === 0 ? (
            tab === "mine" ? (
              <>
                <p>You have no systems yet.</p>
                <Link className="btn btn-primary" href="/studio">
                  Create your first system
                </Link>
              </>
            ) : (
              <>
                <p>You have not favorited anything yet.</p>
                <Link className="btn btn-primary" href="/explore">
                  Explore systems
                </Link>
              </>
            )
          ) : (
            <p>Nothing matches “{filter}”.</p>
          )}
        </div>
      ) : (
        <ul className="grid" aria-label={tab === "mine" ? "Your systems" : "Your favorites"}>
          {items.map((system) => (
            <li key={system.id}>
              <SystemCard
                system={system}
                showVisibility={tab === "mine"}
                actions={
                  tab === "mine" ? (
                    <>
                      {!system.isPalette && (
                        <Link className="btn" href={`/studio/${system.id}`}>
                          Edit
                        </Link>
                      )}
                      <DeleteControl system={system} />
                    </>
                  ) : (
                    <FavoriteButton
                      systemId={system.id}
                      name={system.name}
                      count={system.favorites}
                      onToggled={() => router.refresh()}
                    />
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
