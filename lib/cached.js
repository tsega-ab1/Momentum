// Cached reads for public data (Cache Components). Everything is tagged "systems",
// so one updateTag/revalidateTag call refreshes every public view after a change.
import { cacheLife, cacheTag } from "next/cache";
import { getPublicSystem, listPublicIds, listPublicSystems } from "./systems.js";

export async function getPublicSystemsCached(q, sort, page) {
  "use cache";
  cacheTag("systems");
  cacheLife("minutes");
  return listPublicSystems({ q, sort, page });
}

export async function getPublicSystemCached(id) {
  "use cache";
  cacheTag("systems");
  cacheLife("minutes");
  return getPublicSystem(id);
}

export async function getPublicIdsCached() {
  "use cache";
  cacheTag("systems");
  cacheLife("minutes");
  return listPublicIds();
}
