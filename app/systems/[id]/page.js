// Placeholder list so the route can be prerendered. Real ids come from the data layer later.
export function generateStaticParams() {
  return [{ id: "demo" }];
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `System ${id}` };
}

export default async function SystemPage({ params }) {
  const { id } = await params;
  return (
    <>
      <h1 className="page-title">System: {id}</h1>
      <p className="muted">A public, read-only, shareable view of one color system will live here.</p>
    </>
  );
}
