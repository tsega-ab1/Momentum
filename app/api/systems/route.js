import { listPublicSystems } from "@/lib/systems";
import { SORTS } from "@/lib/explore-key";

// GET /api/systems?q=ocean&sort=popular&page=1  (public systems only)
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").slice(0, 60);
  const sort = SORTS.includes(params.get("sort")) ? params.get("sort") : "popular";
  const page = Number(params.get("page")) || 1;
  return Response.json(listPublicSystems({ q, sort, page }));
}
