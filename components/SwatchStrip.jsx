// Pure presentation: works in both server and client trees.
export default function SwatchStrip({ colors, label, tall = false }) {
  return (
    <div
      className={tall ? "strip strip-tall" : "strip"}
      role="img"
      aria-label={label ?? `Color scale from ${colors[0]} to ${colors[colors.length - 1]}`}
    >
      {colors.map((color, i) => (
        <span key={i} style={{ background: color }} />
      ))}
    </div>
  );
}
