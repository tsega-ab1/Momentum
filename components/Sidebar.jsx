"use client";

import { Suspense } from "react";
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

// Pure list of links: `pathname` decides which one is marked as the current page.
function NavList({ pathname }) {
  return (
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
  );
}

// Only this piece reads the URL. On routes with a dynamic id the URL is not known at build time,
// so it sits behind <Suspense>; the links render at once and the highlight arrives right after.
function ActiveNav() {
  return <NavList pathname={usePathname()} />;
}

// `account` is a server-rendered slot (sign in / sign out), passed in as a prop.
export default function Sidebar({ account }) {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          M
        </span>
        Momentum
      </Link>

      <Suspense fallback={<NavList pathname="" />}>
        <ActiveNav />
      </Suspense>

      <div className="sidebar-footer">
        {account}
        <ThemeToggle />
      </div>
    </aside>
  );
}
