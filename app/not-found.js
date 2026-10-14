import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="page-title">Page not found</h1>
      <p className="muted">That page doesn&apos;t exist.</p>
      <p>
        <Link className="btn btn-primary" href="/">
          Go home
        </Link>
      </p>
    </>
  );
}
