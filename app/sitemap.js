import { connection } from "next/server";
import { listPublicSystems } from "@/lib/systems";
import { SITE_URL } from "@/lib/site";

export default async function sitemap() {
  await connection(); // read the data per request, so new public systems are listed without a rebuild
  const systems = listPublicSystems({ limit: 1000 }).data;
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/explore` },
    ...systems.map((s) => ({ url: `${SITE_URL}/systems/${s.id}`, lastModified: s.updatedAt })),
  ];
}
