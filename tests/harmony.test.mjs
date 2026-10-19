import test from "node:test";
import assert from "node:assert/strict";
import { HARMONY_TYPES, harmonyAsCss, makeHarmony } from "../lib/harmony.js";

test("all harmony types generate valid colors", () => {
  for (const { id } of HARMONY_TYPES) {
    const colors = makeHarmony("#6485f5", id);
    assert.ok(colors.length >= 2, `${id} should generate a palette`);
    for (const color of colors) assert.match(color.hex, /^#[0-9a-f]{6}$/);
  }
});

test("harmony keeps the normalized base color", () => {
  for (const { id } of HARMONY_TYPES) {
    assert.ok(makeHarmony("#ABC", id).some((color) => color.hex === "#aabbcc"));
  }
});

test("invalid colors and harmony types are rejected", () => {
  assert.throws(() => makeHarmony("not-a-color"), /Invalid base/);
  assert.throws(() => makeHarmony("#123456", "unknown"), /Unknown harmony type/);
});

test("CSS export produces usable custom properties", () => {
  const css = harmonyAsCss(makeHarmony("#6485f5", "complementary"));
  assert.match(css, /--harmony-1: #6485f5;/);
  assert.match(css, /--harmony-2: #[0-9a-f]{6};/);
});
