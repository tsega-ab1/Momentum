import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/crypto.js";

test("a password verifies against its own hash, and not against another", () => {
  const stored = hashPassword("correct horse");
  assert.equal(verifyPassword("correct horse", stored), true);
  assert.equal(verifyPassword("wrong horse", stored), false);
});

test("hashing the same password twice gives different hashes (random salt)", () => {
  assert.notEqual(hashPassword("same"), hashPassword("same"));
});

test("verifyPassword rejects missing or malformed stored values", () => {
  for (const bad of [null, undefined, "", "nocolon", ":", 42]) {
    assert.equal(verifyPassword("x", bad), false);
  }
});

test("a signed token round-trips", () => {
  const token = signToken({ uid: "u1", exp: 5000 }, "secret");
  assert.deepEqual(verifyToken(token, "secret", 1000), { uid: "u1", exp: 5000 });
});

test("a token signed with another secret is rejected", () => {
  const token = signToken({ uid: "u1", exp: 5000 }, "secret");
  assert.equal(verifyToken(token, "other", 1000), null);
});

test("a tampered token is rejected", () => {
  const token = signToken({ uid: "u1", exp: 5000 }, "secret");
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "admin", exp: 5000 })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`, "secret", 1000), null);
  assert.equal(verifyToken(`${body}.x${sig.slice(1)}`, "secret", 1000), null);
});

test("an expired token is rejected", () => {
  const token = signToken({ uid: "u1", exp: 5000 }, "secret");
  assert.equal(verifyToken(token, "secret", 5001), null);
});

test("garbage is rejected without throwing", () => {
  for (const bad of [undefined, null, "", "abc", "a.b", "a.b.c", 12]) {
    assert.equal(verifyToken(bad, "secret"), null);
  }
});
