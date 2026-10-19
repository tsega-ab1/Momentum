import test from "node:test";
import assert from "node:assert/strict";
import { previewTheme } from "../lib/preview.js";
import { makeShades, isValidHex } from "../lib/color.js";

test("builds a light and a dark theme from a scale, all valid colors", () => {
  const p = previewTheme(makeShades("#6485f5", 11));
  for (const theme of [p.light, p.dark]) {
    for (const key of ["bg", "card", "text", "muted", "accent", "accentText"]) {
      assert.ok(isValidHex(theme[key]), `${key} should be a hex color, got ${theme[key]}`);
    }
    assert.equal(theme.checks.length, 3);
  }
});

test("light theme uses the lightest shade as background, dark uses the darkest", () => {
  const colors = makeShades("#6485f5", 11);
  const p = previewTheme(colors);
  assert.equal(p.light.bg, colors[0]);
  assert.equal(p.dark.bg, colors[10]);
});

test("the main text pairs pass AA for a typical blue", () => {
  const p = previewTheme(makeShades("#6485f5", 11));
  assert.notEqual(p.light.checks[0].level, "Fail");
  assert.notEqual(p.dark.checks[0].level, "Fail");
});

test("works with every supported shade count", () => {
  for (const n of [5, 7, 9, 11]) {
    const p = previewTheme(makeShades("#c9f27a", n));
    assert.equal(p.light.checks.length, 3);
  }
});

test("reports a failing pair honestly instead of hiding it", () => {
  // A mid-grey scale produces weak muted text somewhere; the point is that the level is computed, not assumed.
  const p = previewTheme(makeShades("#808080", 5));
  for (const c of [...p.light.checks, ...p.dark.checks]) {
    assert.ok(["AAA", "AA", "Fail"].includes(c.level));
    assert.match(c.display, /^\d+\.\d\d:1$/);
  }
});
