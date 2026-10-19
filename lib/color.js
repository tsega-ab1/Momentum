// Momentum colour core: pure functions only (no React, no DOM, no browser APIs).
// Because nothing here touches the browser, it runs the same in a Server
// Component, a Route Handler, a Server Action, or a client component, and it
// can be tested with plain Node.
//
// Ported from the Supa Colors Studio prototype, with these fixes:
//  - hex input is validated (the prototype crashed or returned NaN on bad input)
//  - contrast is NOT rounded before it is compared with WCAG thresholds
//    (the prototype rounded to 1 decimal, so 4.48:1 showed as 4.5 and "passed")
//  - OKLCH is a real conversion (the prototype printed a fixed chroma and hue)
//  - palette names are slugified for CSS (a name with a space made an invalid variable)

export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// ---------- parsing and conversion ----------

// Accepts "#abc", "abc", "#aabbcc", "AABBCC". Returns "#aabbcc" or null.
export function normalizeHex(input) {
  if (typeof input !== "string") return null;
  let h = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/.test(h) ? `#${h}` : null;
}

export function isValidHex(input) {
  return normalizeHex(input) !== null;
}

export function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) throw new Error(`Invalid hex colour: ${hex}`);
  const v = parseInt(n.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Linear interpolation between two hex colours. t = 0 gives a, t = 1 gives b.
export function mix(a, b, t) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t
  );
}

// ---------- shade scale ----------

// Builds n shades from near-white to near-black. For odd n the middle shade is
// exactly the base colour (shade 500 when n = 11).
export function makeShades(base, n = 11) {
  const b = normalizeHex(base);
  if (!b) throw new Error(`Invalid base colour: ${base}`);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return t < 0.5 ? mix("#ffffff", b, t * 1.8) : mix(b, "#111111", (t - 0.5) * 1.65);
  });
}

export function shadeNumbers(n) {
  if (n === 11) return SHADE_STEPS;
  return Array.from({ length: n }, (_, i) => Math.round((i * 1000) / (n - 1)));
}

// ---------- accessibility ----------

function channelToLinear(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Returns a NUMBER (e.g. 4.4778), never a rounded string. Round only for display.
export function contrastRatio(a, b) {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// WCAG 2.x. `large` means 18pt+ or 14pt+ bold. Compares the exact ratio.
export function wcagLevel(ratio, large = false) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return large ? "AAA" : "AA";
  if (ratio >= 3) return large ? "AA" : "Fail";
  return "Fail";
}

export function formatRatio(ratio) {
  // Truncate (not round) so 4.4999 can never display as "4.50".
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}

// Picks black-ish or white text for a given background, whichever reads better.
export function readableTextOn(bg) {
  return contrastRatio(bg, "#111111") >= contrastRatio(bg, "#ffffff") ? "#111111" : "#ffffff";
}

// ---------- display formats ----------

export function toRgbString(hex) {
  return `rgb(${hexToRgb(hex).join(", ")})`;
}

export function toHslString(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// sRGB -> linear -> OKLab -> OKLCH (Bjorn Ottosson's published matrices).
export function toOklchString(hex) {
  const [r, g, b] = hexToRgb(hex).map(channelToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  // Near-greys have no meaningful hue.
  const hue = C < 0.0004 ? 0 : H;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(4)} ${hue.toFixed(1)})`;
}

// ---------- exporting ----------

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "color";
}

export const EXPORT_FORMATS = ["css", "tailwind", "scss", "json"];

// system = { name: string, colors: string[] }  (colors are hex shades, light to dark)
export function exportSystem(system, format) {
  const slug = slugify(system.name);
  const steps = shadeNumbers(system.colors.length);
  const entries = system.colors.map((value, i) => ({ name: `${slug}-${steps[i]}`, value }));

  switch (format) {
    case "css":
      return `:root {\n${entries.map((e) => `  --${e.name}: ${e.value};`).join("\n")}\n}\n`;
    case "tailwind":
      return `@theme {\n${entries.map((e) => `  --color-${e.name}: ${e.value};`).join("\n")}\n}\n`;
    case "scss":
      return entries.map((e) => `$${e.name}: ${e.value};`).join("\n") + "\n";
    case "json":
      return (
        JSON.stringify(
          {
            color: Object.fromEntries(
              entries.map((e) => [e.name, { $type: "color", $value: e.value }])
            ),
          },
          null,
          2
        ) + "\n"
      );
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

// A pleasant random base color: any hue, but saturation and lightness kept in a
// range that produces a usable scale. `rand` is injectable so tests are deterministic.
export function randomColor(rand = Math.random) {
  const h = rand() * 360;
  const s = 0.55 + rand() * 0.3;
  const l = 0.45 + rand() * 0.15;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}
