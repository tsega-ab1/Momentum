"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/history", label: "History", icon: "📜" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        paddingBottom: 16,
        zIndex: 50,
      }}
    >
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 72,
            display: "flex",
            gap: 12,
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: pathname === link.href ? "0 0 0 2px var(--accent)" : "none",
              }}
              aria-label={link.label}
            >
              {link.icon}
            </Link>
          ))}
          <button
            onClick={toggle}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontSize: 16,
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--accent)",
          border: "none",
          color: "white",
          fontSize: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 0.2s ease",
        }}
        aria-label="Open navigation"
      >
        +
      </button>
    </nav>
  );
}
