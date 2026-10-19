import { EXPORT_FORMATS, exportSystem, slugify } from "@/lib/color";
import { getPublicSystem } from "@/lib/systems";

const EXTENSION = { css: "css", tailwind: "css", scss: "scss", json: "json" };
const CONTENT_TYPE = { css: "text/css", tailwind: "text/css", scss: "text/plain", json: "application/json" };

// GET /api/systems/<id>/export?format=css|tailwind|scss|json[&download=1]
export async function GET(request, { params }) {
  const { id } = await params;
  const query = new URL(request.url).searchParams;
  const format = query.get("format") ?? "css";

  if (!EXPORT_FORMATS.includes(format)) {
    return Response.json({ error: `format must be one of: ${EXPORT_FORMATS.join(", ")}` }, { status: 400 });
  }

  const system = getPublicSystem(id);
  if (!system) return Response.json({ error: "System not found" }, { status: 404 });

  const headers = { "Content-Type": `${CONTENT_TYPE[format]}; charset=utf-8` };
  if (query.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="${slugify(system.name)}.${EXTENSION[format]}"`;
  }
  return new Response(exportSystem({ name: system.name, colors: system.colors }, format), { headers });
}
