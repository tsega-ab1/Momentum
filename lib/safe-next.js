// Only allow redirects to paths inside this site, never to another origin.
export function safeNext(value, fallback = "/systems") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
