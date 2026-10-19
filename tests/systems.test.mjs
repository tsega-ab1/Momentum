import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "momentum-"));
process.env.MOMENTUM_DB_PATH = path.join(dir, "db.json");

const sys = await import("../lib/systems.js");
const { createUser, findUserByEmail, findUserById } = await import("../lib/users.js");
const { readDb, writeDb } = await import("../lib/db.js");
const { makeShades } = await import("../lib/color.js");

const seed = JSON.parse(readFileSync(new URL("../data/seed.json", import.meta.url), "utf8"));
const reset = () => writeDb(structuredClone(seed));

test("first read seeds the database from data/seed.json", () => {
  const db = readDb();
  assert.equal(db.systems.length, seed.systems.length);
});

test("the seed data is internally consistent", () => {
  const ids = new Set(seed.systems.map((s) => s.id));
  assert.equal(ids.size, seed.systems.length, "ids are unique");
  for (const s of seed.systems) {
    assert.equal(s.colors.length, s.count);
    assert.deepEqual(s.colors, makeShades(s.base, s.count));
  }
  for (const f of seed.favorites) assert.ok(ids.has(f.systemId));
});

test("public list: paginates and reports totals", () => {
  reset();
  const p1 = sys.listPublicSystems({ page: 1, limit: 4 });
  assert.equal(p1.data.length, 4);
  assert.equal(p1.total, 10);
  assert.equal(p1.totalPages, 3);
  assert.equal(sys.listPublicSystems({ page: 3, limit: 4 }).data.length, 2);
  assert.equal(sys.listPublicSystems({ page: 99, limit: 4 }).page, 3, "page is clamped");
});

test("public list: echoes the search and sort so the UI can tell which data it holds", () => {
  reset();
  const r = sys.listPublicSystems({ q: "  ocean ", sort: "name" });
  assert.equal(r.q, "ocean");
  assert.equal(r.sort, "name");
});

test("public list: popular sort puts the most favorited first", () => {
  reset();
  const top = sys.listPublicSystems({ sort: "popular" }).data[0];
  assert.equal(top.name, "Ocean Depth");
  assert.equal(top.favorites, 5);
});

test("public list: name and newest sorts", () => {
  reset();
  assert.equal(sys.listPublicSystems({ sort: "name", limit: 20 }).data[0].name, "Berry Smoothie");
  assert.equal(sys.listPublicSystems({ sort: "newest", limit: 20 }).data[0].name, "Rose Quartz");
});

test("public list: search matches name, hex and owner, case-insensitively", () => {
  reset();
  assert.equal(sys.listPublicSystems({ q: "OCEAN" }).total, 1);
  assert.equal(sys.listPublicSystems({ q: "#2563eb" }).total, 1);
  assert.equal(sys.listPublicSystems({ q: "2563EB" }).total, 1);
  assert.equal(sys.listPublicSystems({ q: "momentum" }).total, 10);
  assert.equal(sys.listPublicSystems({ q: "zzzz" }).total, 0);
  assert.equal(sys.listPublicSystems({ q: "zzzz" }).totalPages, 1);
});

test("users: create, find, and reject a duplicate email", () => {
  reset();
  const a = createUser({ name: "Abebe", email: "a@b.co", passwordHash: "salt:hash" });
  assert.equal(a.ok, true);
  assert.equal(a.user.passwordHash, undefined, "the hash is never returned");
  assert.equal(findUserById(a.user.id).email, "a@b.co");
  assert.equal(findUserById(a.user.id).passwordHash, undefined);
  assert.equal(findUserByEmail("a@b.co").passwordHash, "salt:hash");
  assert.deepEqual(createUser({ name: "X", email: "a@b.co", passwordHash: "x:y" }), { ok: false, error: "email_taken" });
  assert.equal(findUserByEmail("nobody@b.co"), null);
});

test("create: colors are computed on the server from the base color", () => {
  reset();
  const s = sys.createSystem("u1", { name: "  My Palette ", base: "#6485f5", count: 9, isPublic: true });
  assert.equal(s.name, "My Palette");
  assert.deepEqual(s.colors, makeShades("#6485f5", 9));
  assert.match(s.id, /^my-palette-[0-9a-f]{4}$/);
  assert.equal(sys.getSystem(s.id).ownerId, "u1");
});

test("public vs private visibility", () => {
  reset();
  const priv = sys.createSystem("u1", { name: "Secret", base: "#111111", count: 5, isPublic: false });
  assert.equal(sys.getPublicSystem(priv.id), null);
  assert.ok(sys.getSystem(priv.id));
  assert.equal(sys.listPublicSystems({ q: "secret" }).total, 0);
  assert.equal(sys.listOwnerSystems("u1").length, 1);
});

test("update: owner can, others cannot, unknown id fails", () => {
  reset();
  const s = sys.createSystem("u1", { name: "Mine", base: "#111111", count: 5, isPublic: false });
  const ok = sys.updateSystem("u1", s.id, { name: "Renamed", base: "#222222", count: 7, isPublic: true });
  assert.equal(ok.ok, true);
  assert.equal(ok.system.colors.length, 7);
  assert.equal(sys.getPublicSystem(s.id).name, "Renamed");
  assert.deepEqual(sys.updateSystem("u2", s.id, { name: "Hack", base: "#333333", count: 5, isPublic: true }), { ok: false, error: "forbidden" });
  assert.equal(sys.getSystem(s.id).name, "Renamed");
  assert.deepEqual(sys.updateSystem("u1", "nope", { name: "x", base: "#333333", count: 5, isPublic: true }), { ok: false, error: "not_found" });
});

test("delete: owner can, others cannot, and favorites go with it", () => {
  reset();
  const s = sys.createSystem("u1", { name: "Temp", base: "#111111", count: 5, isPublic: true });
  sys.toggleFavorite("u2", s.id);
  assert.deepEqual(sys.deleteSystem("u2", s.id), { ok: false, error: "forbidden" });
  assert.ok(sys.getSystem(s.id));
  assert.deepEqual(sys.deleteSystem("u1", s.id), { ok: true });
  assert.equal(sys.getSystem(s.id), null);
  assert.equal(readDb().favorites.filter((f) => f.systemId === s.id).length, 0);
  assert.deepEqual(sys.deleteSystem("u1", s.id), { ok: false, error: "not_found" });
});

test("favorites: toggle on and off, counts update, listed per user", () => {
  reset();
  const id = seed.systems[0].id;
  const before = sys.getPublicSystem(id).favorites;
  assert.deepEqual(sys.toggleFavorite("u9", id), { ok: true, favorited: true, count: before + 1 });
  assert.ok(sys.favoriteIds("u9").includes(id));
  assert.equal(sys.listFavoriteSystems("u9")[0].id, id);
  assert.deepEqual(sys.toggleFavorite("u9", id), { ok: true, favorited: false, count: before });
  assert.equal(sys.favoriteIds("u9").length, 0);
});

test("favorites: unknown system fails; a private system can only be favorited by its owner", () => {
  reset();
  assert.deepEqual(sys.toggleFavorite("u1", "nope"), { ok: false, error: "not_found" });
  const priv = sys.createSystem("u1", { name: "Private", base: "#111111", count: 5, isPublic: false });
  assert.deepEqual(sys.toggleFavorite("u2", priv.id), { ok: false, error: "not_found" });
  assert.equal(sys.toggleFavorite("u1", priv.id).ok, true);
});

test("a private system a user favorited never leaks into another user's favorites", () => {
  reset();
  const s = sys.createSystem("u1", { name: "Was public", base: "#111111", count: 5, isPublic: true });
  sys.toggleFavorite("u2", s.id);
  sys.updateSystem("u1", s.id, { name: "Now private", base: "#111111", count: 5, isPublic: false });
  assert.equal(sys.listFavoriteSystems("u2").length, 0);
});
