import { hexToRgb, makeShades, mix, normalizeHex, rgbToHex } from "./color.js";

export const HARMONY_TYPES = [
  { id: "complementary", label: "Complementary", description: "Opposite hues for strong contrast." },
  { id: "analogous", label: "Analogous", description: "Neighboring hues for a cohesive palette." },
  { id: "triadic", label: "Triadic", description: "Three evenly spaced hues." },
  { id: "split", label: "Split complementary", description: "A complement split into two neighboring hues." },
  { id: "tetradic", label: "Tetradic", description: "Four hues arranged in two complementary pairs." },
  { id: "square", label: "Square", description: "Four evenly spaced hues with balanced variety." },
  { id: "monochromatic", label: "Monochromatic", description: "Light and dark variations of one hue." },
];

function rgbToHsl(hex) {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r0, g0, b0);
  const min = Math.min(r0, g0, b0);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r0) h = 60 * (((g0 - b0) / delta) % 6);
    else if (max === g0) h = 60 * ((b0 - r0) / delta + 2);
    else h = 60 * ((r0 - g0) / delta + 4);
  }

  return [(h + 360) % 360, s, l];
}

function hslToHex(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;

  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex(...rgb.map((v) => (v + m) * 255));
}

const SCHEME_OFFSETS = {
  complementary: [0, 180],
  analogous: [-30, 0, 30],
  triadic: [0, 120, 240],
  split: [0, 150, 210],
  tetradic: [0, 90, 180, 270],
  square: [0, 90, 180, 270],
};

export function makeHarmony(base, type = "complementary") {
  const normalized = normalizeHex(base);
  if (!normalized) throw new Error(`Invalid base colour: ${base}`);

  if (type === "monochromatic") {
    return makeShades(normalized, 5).map((hex, index) => ({
      hex,
      role: ["Lightest", "Light", "Base", "Dark", "Darkest"][index],
      isBase: hex === normalized,
    }));
  }

  const [h, s, l] = rgbToHsl(normalized);
  const offsets = SCHEME_OFFSETS[type];
  if (!offsets) throw new Error(`Unknown harmony type: ${type}`);

  return offsets.map((offset, index) => ({
    hex: offset === 0 ? normalized : hslToHex(h + offset, s, l),
    role: offset === 0 ? "Base" : `Hue ${index + 1}`,
    isBase: offset === 0,
  }));
}

export function harmonyAsCss(colors) {
  return `:root {\n${colors.map(({ hex }, i) => `  --harmony-${i + 1}: ${hex};`).join("\n")}\n}\n`;
}
