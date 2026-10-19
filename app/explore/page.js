import ExploreClient from "@/components/explore/ExploreClient";
import { getPublicSystemsCached } from "@/lib/cached";
import { exploreKey } from "@/lib/explore-key";

export const metadata = {
  title: "Explore color systems",
  description: "Browse public color systems: full shade scales you can copy, export and remix.",
};

export default async function ExplorePage() {
  // Cached and tagged "systems": rendered once, refreshed when a system changes.
  const initial = await getPublicSystemsCached("", "popular", 1);
  return (
    <>
      <h1 className="page-title">Explore</h1>
      <p className="muted lede-sm">Public color systems from the community. Favorite the ones you like.</p>
      <ExploreClient initial={initial} initialKey={exploreKey()} />
    </>
  );
}
