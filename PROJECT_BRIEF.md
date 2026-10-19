# Momentum: Color Systems Studio

**Build a color system once. Use it everywhere.**

Capstone brief, version 3. This replaces the earlier job-tracker and AI-routine-coach briefs.

## Problem

A developer picks one brand color, then hand-builds ten shades, guesses at contrast, and copies hex values between tools. Accessibility failures slip through because checking every text and background pair by hand is tedious.

## Main user

A developer or designer setting up the colors for a site or app, including students who need a palette that works in both light and dark themes.

## What the user does

1. Enters a brand color and gets an 11-step scale (50 to 950).
2. Checks contrast for text/background pairs against WCAG, in light and dark.
3. Tweaks the scale, then saves it to their collection.
4. Exports it as CSS variables, Tailwind v4 `@theme`, SCSS, or JSON design tokens.
5. Shares a public link to the system.

## Screens (6, plus a landing page)

| # | Screen | Route | Notes |
|---|---|---|---|
| 1 | Studio | `/studio`, `/studio/[id]` | The editor. Live preview, contrast panel, export dialog |
| 2 | My Systems | `/systems` | Your saved systems and favorites. Signed-in only |
| 3 | System detail | `/systems/[id]` | Public, read-only, shareable link |
| 4 | Explore | `/explore` | Popular public systems with search and pagination |
| 5 | Sign in | `/signin` | |
| 6 | Settings | `/settings` | Theme, default export format, default shade count |

Also: `/` landing page, `not-found`, `error`, `loading` states.

## Data model

```
System { id, ownerId, name, baseColor, colors[11], isPublic, createdAt, updatedAt }
User   { id, name }
Favorite { userId, systemId }
```

Storage starts as a server-side JSON file behind one `lib/db.js` interface, so a real database can replace it later. Limitation to state in the README: a JSON file does not persist on serverless hosting.

## Rendering and data strategy

| Route | Strategy | Why |
|---|---|---|
| `/` | Static | Nothing request-specific |
| `/explore` | Server-rendered first page, cached with a tag; client search with SWR | Public data that changes rarely, but search is interactive |
| `/systems/[id]` | Prebuilt for popular systems via `generateStaticParams`; own metadata and share image | Public and SEO-relevant |
| `/studio` | Server page shell, client editor island | Only the editor needs the browser |
| `/systems` | Dynamic | Reads the session, owner-only |
| `/api/systems` | Route Handler | Search and pagination for the client |
| `/api/systems/[id]/export` | Route Handler | Returns the file for a chosen format |
| Save, delete | Server Actions with Zod validation | Writes from our own UI |
| Favorite toggle | POST to a Route Handler, then update the shared SWR favorites entry and refresh the lists | One client data library for the whole app |

## Where each course topic is used

| Topic | Used for |
|---|---|
| Forms and validation (Day 33) | Save form: name and hex validation, errors after blur, ARIA |
| Error boundaries, lazy loading, portals (Day 34) | Boundary around the preview, export dialog as a portal, lazy-loaded editor panels |
| File routing, layouts, server/client boundary (Days 36 to 38) | App shell with sidebar, `BOUNDARY.md` |
| Caching and tags (Day 37) | Cached explore list, invalidated when a system is saved |
| Route Handlers, Server Actions, Zod (Day 39) | The API and the save flow |
| SWR (Day 41) | Debounced Explore search, pagination, favorites. One client library on purpose; TanStack Query is the documented alternative |
| Auth and ownership (Day 42) | Only the owner can edit or delete |
| Performance and env (Day 43) | Lazy loading, secrets in env vars |
| Metadata and SEO (Day 44) | Per-system titles, share image drawn from the palette, sitemap |

## Core logic is already written and tested

`lib/color.js` is pure functions with no React or browser code, covered by 14 tests. Compared with the original prototype it fixes four bugs:

- **Contrast was rounded before comparing.** `4.48:1` showed as `4.5` and passed AA. It now compares the exact value and truncates for display.
- **OKLCH was fake.** Every color printed the same hue. It is now a real conversion.
- **Bad hex input returned NaN.** It is now validated.
- **Names with spaces broke exports.** `Fresh Start` produced an invalid CSS variable. Names are now slugified.

## Explicitly deferred

Batch generator, pattern editor, community posting and comments, Figma and Style Dictionary export, color extraction from images. Also a known limitation: shades are mixed in sRGB, so mid-tones can look slightly muddy. Interpolating in OKLCH would be better and is a candidate improvement.

## Build order (one branch per feature, merged before the next)

1. `feature/color-core`: `lib/color.js` and tests
2. `feature/app-shell`: theme tokens (light and dark), layout, navigation
3. `feature/studio`: editor, live preview, contrast panel, export
4. `feature/systems-store`: data layer, Server Actions, Zod
5. `feature/explore`: server list, SWR search, pagination
6. `feature/system-detail-seo`: page, metadata, share image, sitemap
7. `feature/auth`: sign-in and ownership checks
8. `feature/favorites`: favorites through SWR
9. `feature/polish`: loading and error states, README, `STRATEGY.md`, `BOUNDARY.md`, `DATA.md`
