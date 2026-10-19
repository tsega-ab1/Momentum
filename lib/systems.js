// The service layer: every rule about color systems lives here, so Server Actions,
// Route Handlers and tests all share it. Ownership is checked here, not in the UI.
import { randomBytes } from "node:crypto";
import { readDb, writeDb } from "./db.js";
import { makeShades, slugify, normalizeHex } from "./color.js";

export const PAGE_SIZE = 6;

function counts(db) {
  const map = new Map();
  for (const f of db.favorites) map.set(f.systemId, (map.get(f.systemId) ?? 0) + 1);
  return map;
}

function view(system, db, favCounts) {
  const owner = db.users.find((u) => u.id === system.ownerId);
  return { ...system, ownerName: owner?.name ?? "Unknown", favorites: favCounts.get(system.id) ?? 0 };
}

function newId(name, db) {
  let id;
  do id = `${slugify(name)}-${randomBytes(2).toString("hex")}`;
  while (db.systems.some((s) => s.id === id));
  return id;
}

// ---------- reading ----------

export function listPublicSystems({ q = "", page = 1, limit = PAGE_SIZE, sort = "popular" } = {}) {
  const db = readDb();
  const fav = counts(db);
  const term = q.trim().toLowerCase().replace(/^#/, "");

  let items = db.systems
    .filter((s) => s.isPublic)
    .map((s) => view(s, db, fav))
    .filter(
      (s) =>
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.base.slice(1).includes(term) ||
        s.ownerName.toLowerCase().includes(term)
    );

  if (sort === "newest") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort((a, b) => b.favorites - a.favorites || b.updatedAt.localeCompare(a.updatedAt));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * limit;
  return { data: items.slice(start, start + limit), page: safePage, limit, total, totalPages, q: q.trim(), sort };
}

export function listPublicIds() {
  return readDb().systems.filter((s) => s.isPublic).map((s) => s.id);
}

export function getSystem(id) {
  return readDb().systems.find((s) => s.id === id) ?? null;
}

export function getPublicSystem(id) {
  const db = readDb();
  const system = db.systems.find((s) => s.id === id);
  if (!system || !system.isPublic) return null;
  return view(system, db, counts(db));
}

export function listOwnerSystems(ownerId) {
  const db = readDb();
  const fav = counts(db);
  return db.systems
    .filter((s) => s.ownerId === ownerId)
    .map((s) => view(s, db, fav))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function favoriteIds(userId) {
  return readDb().favorites.filter((f) => f.userId === userId).map((f) => f.systemId);
}

export function listFavoriteSystems(userId) {
  const db = readDb();
  const fav = counts(db);
  const ids = new Set(db.favorites.filter((f) => f.userId === userId).map((f) => f.systemId));
  return db.systems
    .filter((s) => ids.has(s.id) && (s.isPublic || s.ownerId === userId))
    .map((s) => view(s, db, fav));
}

// ---------- writing ----------

// Colors are always computed here from the base color. Whatever the browser sends is ignored.
export function createSystem(ownerId, { name, base, count, isPublic }) {
  const db = readDb();
  const now = new Date().toISOString();
  const hex = normalizeHex(base);
  const system = {
    id: newId(name, db),
    ownerId,
    name: name.trim(),
    base: hex,
    count,
    colors: makeShades(hex, count),
    isPublic: Boolean(isPublic),
    createdAt: now,
    updatedAt: now,
  };
  db.systems.push(system);
  writeDb(db);
  return system;
}

export function updateSystem(userId, id, { name, base, count, isPublic }) {
  const db = readDb();
  const system = db.systems.find((s) => s.id === id);
  if (!system) return { ok: false, error: "not_found" };
  if (system.ownerId !== userId) return { ok: false, error: "forbidden" };
  const hex = normalizeHex(base);
  Object.assign(system, {
    name: name.trim(),
    base: hex,
    count,
    colors: makeShades(hex, count),
    isPublic: Boolean(isPublic),
    updatedAt: new Date().toISOString(),
  });
  writeDb(db);
  return { ok: true, system };
}

export function deleteSystem(userId, id) {
  const db = readDb();
  const system = db.systems.find((s) => s.id === id);
  if (!system) return { ok: false, error: "not_found" };
  if (system.ownerId !== userId) return { ok: false, error: "forbidden" };
  db.systems = db.systems.filter((s) => s.id !== id);
  db.favorites = db.favorites.filter((f) => f.systemId !== id);
  writeDb(db);
  return { ok: true };
}

export function toggleFavorite(userId, systemId) {
  const db = readDb();
  const system = db.systems.find((s) => s.id === systemId);
  // A private system can only be favorited by its owner.
  if (!system || (!system.isPublic && system.ownerId !== userId)) return { ok: false, error: "not_found" };
  const exists = db.favorites.some((f) => f.userId === userId && f.systemId === systemId);
  db.favorites = exists
    ? db.favorites.filter((f) => !(f.userId === userId && f.systemId === systemId))
    : [...db.favorites, { userId, systemId }];
  writeDb(db);
  return { ok: true, favorited: !exists, count: db.favorites.filter((f) => f.systemId === systemId).length };
}
