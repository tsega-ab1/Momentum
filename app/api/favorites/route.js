import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { favoriteIds, toggleFavorite } from "@/lib/systems";

// GET: which systems the current visitor has favorited ({ signedIn: false, ids: [] } when signed out)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ signedIn: false, ids: [] });
  return Response.json({ signedIn: true, ids: favoriteIds(user.id) });
}

// POST { systemId }: toggles the favorite and returns { favorited, count }
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to favorite systems" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  if (typeof body?.systemId !== "string" || body.systemId === "") {
    return Response.json({ error: "systemId is required" }, { status: 422 });
  }

  const result = toggleFavorite(user.id, body.systemId);
  if (!result.ok) return Response.json({ error: "System not found" }, { status: 404 });

  revalidateTag("systems", { expire: 0 }); // expire now, so a reload never shows the old count
  return Response.json({ favorited: result.favorited, count: result.count });
}
