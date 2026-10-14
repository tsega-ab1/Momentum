"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const groups = [
  { label: "Create", links: [{ href: "/studio", text: "Studio" }] },
  { label: "Workspace", links: [{ href: "/systems", text: "My systems" }] },
  { label: "Explore", links: [{ href: "/explore", text: "Explore" }] },
  { label: "Preferences", links: [{ href: "/settings", text: "Settings" }] },
];

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(href + "/");
}

// Client component only because it needs usePathname to mark the current page.
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          M
        </span>
        Momentum
      </Link>

      <nav aria-label="Main">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <span className="nav-label">{group.label}</span>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {link.text}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link
          href="/signin"
          className="nav-link"
          aria-current={isActive(pathname, "/signin") ? "page" : undefined}
        >
          Sign in
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
