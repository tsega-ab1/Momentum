// Builds a small light and dark UI sample from a shade scale, with its own contrast checks,
// so the person sees whether their palette actually works as a theme.
import { contrastRatio, wcagLevel, formatRatio, readableTextOn } from "./color.js";

function pick(colors, fraction) {
  return colors[Math.round(fraction * (colors.length - 1))];
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
    text: pick(colors, 0.9),
    muted: pick(colors, 0.7),
    accent: pick(colors, 0.55),
  };
  light.accentText = readableTextOn(light.accent);

  const dark = {
    bg: pick(colors, 1),
    card: pick(colors, 0.9),
    text: pick(colors, 0.05),
    muted: pick(colors, 0.3),
    accent: pick(colors, 0.4),
  };
  dark.accentText = readableTextOn(dark.accent);

  return {
    light: { ...light, checks: checks(light) },
    dark: { ...dark, checks: checks(dark) },
  };
}
