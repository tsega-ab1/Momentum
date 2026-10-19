import { randomBytes } from "node:crypto";
import { readDb, writeDb } from "./db.js";

// Never hand the password hash to anything that renders or serialises a user.
function publicUser(user) {
  return user ? { id: user.id, name: user.name, email: user.email } : null;
}

export function findUserByEmail(email) {
  return readDb().users.find((u) => u.email === email) ?? null; // includes hash, for sign-in only
}

export function findUserById(id) {
  return publicUser(readDb().users.find((u) => u.id === id));
}

export function createUser({ name, email, passwordHash }) {
  const db = readDb();
  if (db.users.some((u) => u.email === email)) return { ok: false, error: "email_taken" };
  const user = {
    id: `u_${randomBytes(8).toString("hex")}`,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return { ok: true, user: publicUser(user) };
}
