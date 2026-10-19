"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { exploreKey, SORTS } from "@/lib/explore-key";
import { useDebounce } from "@/components/useDebounce";
import SystemCard from "@/components/SystemCard";
import FavoriteButton from "@/components/FavoriteButton";

const SORT_LABELS = { popular: "Most favorited", newest: "Newest", name: "Name A to Z" };

// `initial` is rendered on the server (cached), so the first paint already has results.
// SWR takes over for searching, sorting and paging.
export default function ExploreClient({ initial, initialKey }) {
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const q = useDebounce(term.trim().slice(0, 60), 300);

  const key = exploreKey({ q, sort, page });
  const { data, error, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    fallbackData: key === initialKey ? initial : undefined,
  });

  const shown = data ?? initial;
  // The data says which search it belongs to, so the count line never claims a number for the wrong term.
  const stale = shown.q !== q || shown.sort !== sort;

  return (
    <>
      <div className="toolbar">
        <div className="field grow">
          <label htmlFor="search">Search by name, hex or author</label>
          <input
            id="search"
            type="search"
            value={term}
            placeholder="ocean, #2563eb, momentum…"
            onChange={(e) => {
              setTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="muted small" aria-live="polite" data-testid="result-count">
        {error
          ? "Could not load systems."
          : `${shown.total} ${shown.total === 1 ? "system" : "systems"}${shown.q ? ` matching “${shown.q}”` : ""}${stale ? " · updating…" : ""}`}
      </p>

      {error && (
        <p className="error" role="alert">
          Something went wrong.{" "}
          <button type="button" className="btn" onClick={() => mutate()}>
            Try again
          </button>
        </p>
      )}

      {shown.data.length === 0 && !error ? (
        <div className="card empty">
          <p>No systems match “{q}”.</p>
          <button type="button" className="btn" onClick={() => setTerm("")}>
            Clear search
          </button>
        </div>
      ) : (
        <ul className="grid" aria-label="Color systems">
          {shown.data.map((system) => (
            <li key={system.id}>
              <SystemCard
                system={system}
                actions={<FavoriteButton systemId={system.id} name={system.name} count={system.favorites} />}
              />
            </li>
          ))}
        </ul>
      )}

      <nav className="pager" aria-label="Pagination">
        <button type="button" className="btn" disabled={shown.page <= 1} onClick={() => setPage(shown.page - 1)}>
          Previous
        </button>
        <span data-testid="page-status">
          Page {shown.page} of {shown.totalPages}
        </span>
        <button
          type="button"
          className="btn"
          disabled={shown.page >= shown.totalPages}
          onClick={() => setPage(shown.page + 1)}
        >
          Next
        </button>
      </nav>
    </>
  );
}
