// Zod schemas for everything that comes from a form. The server always validates,
// because the browser's checks can be bypassed.
import { z } from "zod";
import { normalizeHex } from "./color.js";
import { SHADE_COUNTS } from "./constants.js";

export { SHADE_COUNTS };

const hexField = z
  .string()
  .refine((v) => normalizeHex(v) !== null, "Enter a valid hex color like #6485f5")
  .transform((v) => normalizeHex(v));

export const systemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your system a name")
    .max(40, "Keep the name under 40 characters"),
  base: hexField,
  count: z.coerce
    .number()
    .refine((n) => SHADE_COUNTS.includes(n), "Choose 5, 7, 9 or 11 shades"),
  isPublic: z.boolean(),
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters)").max(30, "Keep your name under 30 characters"),
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(100, "Use fewer than 100 characters"),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

// { field: "first message" } from a failed safeParse. Works with Zod 3 and 4.
export function errorsFromIssues(issues) {
  const out = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function parseWith(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data, errors: {} };
  return { ok: false, data: null, errors: errorsFromIssues(result.error.issues) };
}

export function parseSystemForm(formData) {
  return parseWith(systemSchema, {
    name: formData.get("name") ?? "",
    base: formData.get("base") ?? "",
    count: formData.get("count") ?? "",
    isPublic: formData.get("isPublic") === "true" || formData.get("isPublic") === "on",
  });
}
