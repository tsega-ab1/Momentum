import { ImageResponse } from "next/og";
import { getPublicSystem } from "@/lib/systems";

export const alt = "A Momentum color system";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The share image is drawn from the palette itself, so every system gets its own preview.
export default async function Image({ params }) {
  const { id } = await params;
  const system = getPublicSystem(id);
  const colors = system?.colors ?? ["#c9f27a", "#a9d85a", "#7fb23a", "#56821f", "#2f4f10"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#171815",
          color: "#f1f1e9",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#c9f27a" }}>Momentum</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>{system?.name ?? "Color systems"}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#a6a79d", marginTop: 8 }}>
            {system ? `${system.base} · ${system.count} shades` : "Build a color system once. Use it everywhere."}
          </div>
        </div>
        <div style={{ display: "flex", height: 120, width: "100%", borderRadius: 18, overflow: "hidden" }}>
          {colors.map((color, i) => (
            <div key={i} style={{ display: "flex", flex: 1, background: color }} />
          ))}
        </div>
      </div>
    ),
    size
  );
}
