// One place that builds the Explore API URL, so the server page and the client
// produce the exact same SWR key.
export const SORTS = ["popular", "newest", "name"];

export function exploreKey({ q = "", sort = "popular", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("sort", SORTS.includes(sort) ? sort : "popular");
  params.set("page", String(Math.max(1, Number(page) || 1)));
  return `/api/systems?${params.toString()}`;
}
