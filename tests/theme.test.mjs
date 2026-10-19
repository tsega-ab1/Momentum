import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contrastRatio, formatRatio } from "../lib/color.js";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

// Reads the hex custom properties out of one CSS block, e.g. { "--bg": "#f7f7f5", ... }
function tokens(selectorPattern) {
  const block = css.match(new RegExp(selectorPattern + "\\s*\\{([^}]*)\\}"));
  assert.ok(block, `could not find ${selectorPattern} in globals.css`);
  const out = {};
  for (const m of block[1].matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

const themes = {
  light: tokens(":root"),
  dark: tokens('\\[data-theme="dark"\\]'),
};

const TEXT_PAIRS = [
  ["--ink", "--bg"],
  ["--ink", "--surface"],
  ["--ink", "--surface2"],
  ["--muted", "--bg"],
  ["--muted", "--surface"],
  ["--muted", "--surface2"],
  ["--accent-ink", "--accent"],
  ["--danger", "--bg"],
  ["--danger", "--surface"],
  ["--danger", "--surface2"],
];

for (const [name, t] of Object.entries(themes)) {
  test(`${name} theme: every text pair meets WCAG AA (4.5:1)`, () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      assert.ok(t[fg] && t[bg], `${name}: missing ${fg} or ${bg}`);
      const r = contrastRatio(t[fg], t[bg]);
      assert.ok(r >= 4.5, `${name}: ${fg} ${t[fg]} on ${bg} ${t[bg]} is ${formatRatio(r)}, needs 4.5:1`);
    }
  });

  test(`${name} theme: focus ring is visible against backgrounds (3:1)`, () => {
    for (const bg of ["--bg", "--surface"]) {
      const r = contrastRatio(t["--focus"], t[bg]);
      assert.ok(r >= 3, `${name}: --focus on ${bg} is ${formatRatio(r)}, needs 3:1`);
    }
  });
}
