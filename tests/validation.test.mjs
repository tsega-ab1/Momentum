import test from "node:test";
import assert from "node:assert/strict";
import { parseSystemForm, parseWith, signUpSchema, signInSchema } from "../lib/validation.js";
import { safeNext } from "../lib/safe-next.js";
import { sanitizePrefs, DEFAULT_PREFS } from "../lib/prefs.js";
import { exploreKey } from "../lib/explore-key.js";

function form(obj) {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.set(k, v);
  return f;
}

test("a valid system form parses, normalises the hex and converts types", () => {
  const r = parseSystemForm(form({ name: "  Ocean  ", base: "#ABC", count: "9", isPublic: "true" }));
  assert.equal(r.ok, true);
  assert.deepEqual(r.data, { name: "Ocean", base: "#aabbcc", count: 9, isPublic: true });
});

test("the checkbox value 'on' counts as public, absence means private", () => {
  assert.equal(parseSystemForm(form({ name: "a", base: "#fff", count: "5", isPublic: "on" })).data.isPublic, true);
  assert.equal(parseSystemForm(form({ name: "a", base: "#fff", count: "5" })).data.isPublic, false);
});

test("an invalid system form reports a message per field", () => {
  const r = parseSystemForm(form({ name: "   ", base: "nope", count: "4" }));
  assert.equal(r.ok, false);
  assert.match(r.errors.name, /name/i);
  assert.match(r.errors.base, /hex/i);
  assert.match(r.errors.count, /5, 7, 9 or 11/);
});

test("a name over 40 characters is rejected", () => {
  const r = parseSystemForm(form({ name: "x".repeat(41), base: "#fff", count: "5" }));
  assert.match(r.errors.name, /40/);
});

test("sign up: normalises email, requires 8+ character password", () => {
  const ok = parseWith(signUpSchema, { name: "Abebe", email: "  ABEBE@Example.COM ", password: "longenough" });
  assert.equal(ok.ok, true);
  assert.equal(ok.data.email, "abebe@example.com");
  const bad = parseWith(signUpSchema, { name: "A", email: "nope", password: "short" });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.name && bad.errors.email && bad.errors.password);
});

test("sign in: needs an email and a password", () => {
  assert.equal(parseWith(signInSchema, { email: "a@b.co", password: "x" }).ok, true);
  assert.ok(parseWith(signInSchema, { email: "a@b.co", password: "" }).errors.password);
});

test("safeNext only allows paths on this site", () => {
  assert.equal(safeNext("/studio/abc"), "/studio/abc");
  assert.equal(safeNext("https://evil.com"), "/systems");
  assert.equal(safeNext("//evil.com"), "/systems");
  assert.equal(safeNext("/\\evil.com"), "/systems");
  assert.equal(safeNext(undefined), "/systems");
  assert.equal(safeNext("nope", "/"), "/");
});

test("sanitizePrefs falls back to defaults for anything invalid", () => {
  assert.deepEqual(sanitizePrefs({ format: "scss", count: 7 }), { format: "scss", count: 7 });
  assert.deepEqual(sanitizePrefs({ format: "xml", count: 99 }), DEFAULT_PREFS);
  assert.deepEqual(sanitizePrefs(null), DEFAULT_PREFS);
  assert.deepEqual(sanitizePrefs("junk"), DEFAULT_PREFS);
  assert.equal(sanitizePrefs({ count: "9" }).count, 9);
});

test("exploreKey builds a stable URL and sanitises its inputs", () => {
  assert.equal(exploreKey(), "/api/systems?sort=popular&page=1");
  assert.equal(exploreKey({ q: "blue", sort: "name", page: 3 }), "/api/systems?q=blue&sort=name&page=3");
  assert.equal(exploreKey({ sort: "hack", page: -4 }), "/api/systems?sort=popular&page=1");
});
