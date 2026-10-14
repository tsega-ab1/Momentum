import Link from "next/link";
import { makeShades } from "@/lib/color";

export default function HomePage() {
  // Pure function from lib/color.js, run on the server at build time.
  const shades = makeShades("#c9f27a");

  return (
    <section className="hero">
      <h1>Make room for color.</h1>
      <p className="lede">
        Build one color system, check it for accessibility, and export it everywhere you build.
      </p>
      <div className="actions">
        <Link className="btn btn-primary" href="/studio">
          Open the studio
        </Link>
        <Link className="btn" href="/explore">
          Explore systems
        </Link>
      </div>
      <div className="swatch-row" role="img" aria-label="Sample 11-step shade scale built from lime green">
        {shades.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
    </section>
  );
}
