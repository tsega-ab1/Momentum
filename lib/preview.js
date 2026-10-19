// Builds a small light and dark UI sample from a shade scale, with its own contrast checks,
// so the person sees whether their palette actually works as a theme.
import { contrastRatio, wcagLevel, formatRatio, readableTextOn } from "./color.js";

function pick(colors, fraction) {
  return colors[Math.round(fraction * (colors.length - 1))];
}

// Starts from the shade at `fraction` along the scale. If it is not readable enough on every
// background in `bgs`, uses the nearest shade that reaches `min`. If no shade can, uses the
// one with the best worst-case contrast, so the check below still reports the truth.
function pickReadable(colors, fraction, bgs, min) {
  const start = Math.round(fraction * (colors.length - 1));
  const candidates = colors.map((color, i) => ({
    color,
    dist: Math.abs(i - start),
    ratio: Math.min(...bgs.map((bg) => contrastRatio(color, bg))),
  }));
  const passing = candidates.filter((c) => c.ratio >= min);
  if (passing.length > 0) {
    return passing.reduce((a, b) =>
      a.dist !== b.dist ? (a.dist < b.dist ? a : b) : a.ratio >= b.ratio ? a : b
    ).color;
  }
  return candidates.reduce((a, b) => (a.ratio >= b.ratio ? a : b)).color;
}

function checks(theme) {
  return [
    ["Text on background", theme.text, theme.bg],
    ["Muted text on background", theme.muted, theme.bg],
    ["Button text on button", theme.accentText, theme.accent],
  ].map(([label, fg, bg]) => {
    const ratio = contrastRatio(fg, bg);
    return { label, ratio, display: formatRatio(ratio), level: wcagLevel(ratio) };
  });
}

export function previewTheme(colors) {
  const light = {
    bg: pick(colors, 0),
    card: "#ffffff",
    accent: pick(colors, 0.55),
  };
  light.text = pickReadable(colors, 0.9, [light.bg, light.card], 7);
  light.muted = pickReadable(colors, 0.7, [light.bg, light.card], 4.5);
  light.accentText = readableTextOn(light.accent);

  const dark = {
    bg: pick(colors, 1),
    card: pick(colors, 0.9),
    accent: pick(colors, 0.4),
  };
  dark.text = pickReadable(colors, 0.05, [dark.bg, dark.card], 7);
  dark.muted = pickReadable(colors, 0.3, [dark.bg, dark.card], 4.5);
  dark.accentText = readableTextOn(dark.accent);

  return {
    light: { ...light, checks: checks(light) },
    dark: { ...dark, checks: checks(dark) },
  };
}
