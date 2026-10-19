import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHex,
  isValidHex,
  hexToRgb,
  rgbToHex,
  mix,
  makeShades,
  shadeNumbers,
  contrastRatio,
  wcagLevel,
  formatRatio,
  readableTextOn,
  toHslString,
  toOklchString,
  slugify,
  exportSystem,
} from "../lib/color.js";

test("normalizeHex accepts 3 and 6 digit hex, with or without #", () => {
  assert.equal(normalizeHex("#ABC"), "#aabbcc");
  assert.equal(normalizeHex("c9f27a"), "#c9f27a");
  assert.equal(normalizeHex("  #C9F27A "), "#c9f27a");
});

test("normalizeHex rejects bad input instead of returning NaN", () => {
  for (const bad of ["", "#12", "#12345", "#gggggg", "red", null, undefined, 12]) {
    assert.equal(normalizeHex(bad), null, `should reject ${String(bad)}`);
  }
  assert.equal(isValidHex("#6485f5"), true);
  assert.throws(() => hexToRgb("nope"), /Invalid hex/);
});

test("hex <-> rgb round trip", () => {
  assert.deepEqual(hexToRgb("#c9f27a"), [201, 242, 122]);
  assert.equal(rgbToHex(201, 242, 122), "#c9f27a");
  assert.equal(rgbToHex(-5, 300, 12.4), "#00ff0c"); // clamped and rounded
});

test("mix endpoints", () => {
  assert.equal(mix("#000000", "#ffffff", 0), "#000000");
  assert.equal(mix("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(mix("#000000", "#ffffff", 0.5), "#808080");
});

test("makeShades: 11 shades, middle one is exactly the base, light to dark", () => {
  const base = "#6485f5";
  const shades = makeShades(base, 11);
  assert.equal(shades.length, 11);
  assert.equal(shades[5], base);
  const lum = (h) => hexToRgb(h).reduce((a, b) => a + b, 0);
  for (let i = 1; i < shades.length; i++) {
    assert.ok(lum(shades[i]) <= lum(shades[i - 1]), `shade ${i} should not be lighter than ${i - 1}`);
  }
  assert.throws(() => makeShades("nope"), /Invalid base/);
});

test("shadeNumbers labels 11 shades 50..950", () => {
  assert.deepEqual(shadeNumbers(11), [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  assert.deepEqual(shadeNumbers(5), [0, 250, 500, 750, 1000]);
});

test("contrast: black on white is 21:1, identical colours are 1:1", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#ffffff")), 21);
  assert.equal(contrastRatio("#c9f27a", "#c9f27a"), 1);
  assert.equal(contrastRatio("#ffffff", "#000000"), contrastRatio("#000000", "#ffffff"));
});

test("REGRESSION: 4.48:1 must fail AA (the prototype rounded it up to 4.5 and passed it)", () => {
  const r = contrastRatio("#777777", "#ffffff");
  assert.ok(r > 4.47 && r < 4.5, `expected ~4.48, got ${r}`);
  assert.equal(r.toFixed(1), "4.5"); // this is what the prototype compared against 4.5
  assert.equal(wcagLevel(r), "Fail"); // exact comparison is correct
  assert.equal(formatRatio(r), "4.47:1"); // truncated, never displays as 4.50
  assert.equal(wcagLevel(contrastRatio("#767676", "#ffffff")), "AA");
});

test("wcagLevel thresholds for normal and large text", () => {
  assert.equal(wcagLevel(7), "AAA");
  assert.equal(wcagLevel(4.5), "AA");
  assert.equal(wcagLevel(4.5, true), "AAA");
  assert.equal(wcagLevel(3, true), "AA");
  assert.equal(wcagLevel(3), "Fail");
  assert.equal(wcagLevel(2.99, true), "Fail");
});

test("readableTextOn picks the more readable of dark and light text", () => {
  assert.equal(readableTextOn("#c9f27a"), "#111111"); // lime needs dark text
  assert.equal(readableTextOn("#171815"), "#ffffff"); // near-black needs light text
});

test("hsl", () => {
  assert.equal(toHslString("#ff0000"), "hsl(0, 100%, 50%)");
  assert.equal(toHslString("#ffffff"), "hsl(0, 0%, 100%)");
  assert.equal(toHslString("#000000"), "hsl(0, 0%, 0%)");
});

test("REGRESSION: OKLCH is a real conversion (prototype printed hue 245 for everything)", () => {
  assert.equal(toOklchString("#ffffff"), "oklch(100.0% 0.0000 0.0)");
  assert.equal(toOklchString("#000000"), "oklch(0.0% 0.0000 0.0)");
  // Published reference value for sRGB red: oklch(62.8% 0.2577 29.23)
  const red = toOklchString("#ff0000");
  assert.match(red, /^oklch\(62\.8% 0\.2577 29\.\d\)$/);
  // Different colours must give different hues.
  const blue = toOklchString("#0000ff");
  assert.notEqual(red.split(" ")[2], blue.split(" ")[2]);
});

test("slugify makes safe CSS identifiers", () => {
  assert.equal(slugify("Fresh Start"), "fresh-start");
  assert.equal(slugify("  Night  Garden! "), "night-garden");
  assert.equal(slugify("!!!"), "color");
});

test("REGRESSION: export with a spaced name produces valid CSS variable names", () => {
  const system = { name: "Fresh Start", colors: makeShades("#6485f5", 11) };
  const css = exportSystem(system, "css");
  assert.match(css, /--fresh-start-50: #[0-9a-f]{6};/);
  assert.match(css, /--fresh-start-500: #6485f5;/);
  assert.doesNotMatch(css, /--fresh start/);
  assert.match(exportSystem(system, "tailwind"), /^@theme \{\n  --color-fresh-start-50:/);
  assert.match(exportSystem(system, "scss"), /^\$fresh-start-50: #/);
  const json = JSON.parse(exportSystem(system, "json"));
  assert.equal(json.color["fresh-start-500"].$type, "color");
  assert.equal(json.color["fresh-start-500"].$value, "#6485f5");
  assert.throws(() => exportSystem(system, "xml"), /Unknown export format/);
});

test("randomColor always returns a valid hex and is deterministic with a seeded source", async () => {
  const { randomColor } = await import("../lib/color.js");
  for (let i = 0; i < 200; i++) assert.ok(isValidHex(randomColor()));
  const fixed = () => 0.5;
  assert.equal(randomColor(fixed), randomColor(fixed));
  assert.notEqual(randomColor(() => 0.1), randomColor(() => 0.6));
});
