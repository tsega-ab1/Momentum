"use client";

// Must be a client component: it needs a click handler to retry.
export default function Error({ reset }) {
  return (
    <>
      <h1 className="page-title">Something went wrong</h1>
      <p className="muted">An unexpected error stopped this page. Your saved systems are not affected.</p>
      <p>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </p>
    </>
  );
}
