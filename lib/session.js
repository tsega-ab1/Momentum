// Session cookie handling. The cookie holds a signed token (user id + expiry);
// the user is always re-read from the database, so a deleted user is signed out.
import { cookies } from "next/headers";
import { connection } from "next/server";
import { signToken, verifyToken } from "./crypto.js";
import { findUserById } from "./users.js";

const COOKIE = "momentum_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

// Set SESSION_SECRET in .env.local for anything beyond a local demo (see .env.example).
function secret() {
  return process.env.SESSION_SECRET || "momentum-dev-secret-change-me";
}

export async function createSession(userId) {
  const token = signToken({ uid: userId, exp: Date.now() + MAX_AGE * 1000 }, secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null; // signed out: nothing to verify, and no clock needed
  // Checking expiry reads the clock, so wait for a real request first (not a prerender).
  await connection();
  const payload = verifyToken(token, secret());
  return payload ? findUserById(payload.uid) : null;
}
