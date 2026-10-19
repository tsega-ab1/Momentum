import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/studio/", "/signin"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
