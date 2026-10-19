# Momentum: Color Systems Studio

Build a color system once. Use it everywhere. Pick a base color, get a full shade scale,
check contrast against WCAG, preview it as a light and dark theme, then export it as CSS
variables, Tailwind v4, SCSS or JSON tokens. Save systems, share a public link, favorite others.

## Run it

```bash
npm install swr zod
npm pkg set type=module
cp .env.example .env.local        # then set SESSION_SECRET (openssl rand -hex 32)
npm run dev                       # or: npm run build && npm start
npm test                          # unit tests (no browser needed)
```

## Routes

| Route | What it does | Rendering |
|---|---|---|
| `/` | Landing page | Static, with a streamed account slot |
| `/studio`, `/studio/[id]` | The editor: scale, contrast, preview, export, save | Server shell, client editor |
| `/systems` | Your systems and favorites (signed in) | Dynamic |
| `/systems/[id]` | Public page, share image, export | Prebuilt, cached, tag-refreshed |
| `/explore` | Public systems: search, sort, pages | Cached first page, SWR after |
| `/signin` | Sign in or create an account | Server Actions |
| `/settings` | Default export format and shade count, theme | Client preferences |
| `/api/systems` | Public list (search, sort, page) | Route Handler |
| `/api/systems/[id]/export` | File download in 4 formats | Route Handler |
| `/api/favorites` | Read and toggle favorites | Route Handler |

## How it is organised

- `lib/color.js`: all colour math, pure functions. `lib/systems.js`: every rule about systems and ownership.
- Server Actions (`app/actions.js`) are thin: validate with Zod, call the service layer, refresh the cache tag.
- The server recomputes a system's colors from its base color. The browser's colors are never trusted.
- Only the interactive pieces are client components. Pages that read the session sit behind `<Suspense>`.

## Tested so far

- 65 unit tests: colour math, contrast, exports, Studio undo/redo, validation, passwords and signed
  cookies, the data layer (ownership, favorites, search, pagination), and the theme's contrast ratios.
- `next build` succeeds on Next 16.4.1 with Cache Components and partial prefetching on.
- In a real browser, these passed: theme toggle and persistence, skip link, Explore (server-rendered,
  debounced search, sort, pagination, empty state), Studio (hex, shades, undo/redo, invalid input,
  contrast, previews, export dialog), sign-up validation, draft kept across sign-in, saving a system,
  and the Explore cache refreshing right after a save.

## NOT tested yet (please check these first)

The browser run stopped at **favoriting a system, then reloading the page**. Everything after it
has not been run: favorite persistence, My systems and the Favorites tab, editing, private
systems returning 404, another user being refused, delete, the API responses, the share image,
sitemap and robots, Settings, sign-out, and mobile layout.

## Things to know

- Data lives in `data/db.json`, created from `data/seed.json` on first run. It does not persist on serverless hosting.
- Next 16 keeps previously visited pages mounted but hidden, so the same `id` can exist twice in the DOM. Hidden copies are ignored by assistive tech.
- Without `SESSION_SECRET` a development default is used. Set a real one before any real use.
