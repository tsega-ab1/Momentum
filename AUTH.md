# Authentication and Authorization

## Purpose

Momentum uses account sessions to protect user-owned systems and
palettes. Public systems may be viewed without signing in; private
records and write operations must be authorized on the server.

## Session design

-   The session cookie is named `momentum_session`.
-   `lib/session.js` creates a signed token containing a user ID (`uid`)
    and expiry (`exp`).
-   `lib/crypto.js` signs and verifies tokens using HMAC-SHA256.
-   The cookie is configured as `HttpOnly`, `SameSite=Lax`, and
    `Path=/`.
-   The cookie's `Secure` attribute is enabled when
    `COOKIE_SECURE=true`.
-   Each authenticated request verifies the token and looks the user up
    again, so a deleted user does not remain authenticated solely
    because an old cookie exists.
-   `SESSION_SECRET` signs tokens. The current implementation has a
    development fallback if it is unset; production must use a strong,
    unique secret and must not rely on that fallback.

## Authorization layers

1.  **Page layer:** private pages such as `/systems` and `/studio/[id]`
    check the current user and redirect or return not-found behavior
    when appropriate.
2.  **Server Action / API layer:** write actions and favorite endpoints
    obtain the current user from the session rather than trusting a user
    ID supplied by the browser.
3.  **Service layer:** `lib/systems.js` checks record ownership before
    editing or deleting systems and restricts private-system access.
4.  **Validation layer:** form inputs are parsed before being used by
    write actions. Server-side validation remains necessary even when
    the UI validates inputs.

## Important implementation references

-   Session creation and verification: `lib/session.js`
-   Token signing and verification; password hashing: `lib/crypto.js`
-   Redirect allow-listing: `lib/safe-next.js`
-   Authentication and system write actions: `app/actions.js`
-   System ownership rules: `lib/systems.js`
-   Favorites API authentication: `app/api/favorites/route.js`
-   Private system page: `app/studio/[id]/page.js`

## Security verification checklist

Run these checks against the **deployed** application before submission.
Record the date, deployment URL, result, and evidence. Do not mark a
test passed until it has actually been performed.

-   [ ] **Unauthenticated write:** In a private browser window, sign out
    and attempt a write action with a valid-looking system ID. The
    server must refuse the action and must not change data.
-   [ ] **Cross-account ownership:** Sign in as User A, then attempt to
    edit or delete a system owned by User B using User B's record ID.
    The server must refuse the action and leave the record unchanged.
-   [ ] **External redirect:** Visit `/signin?next=https://example.com`,
    sign in, and confirm the app does not navigate to `example.com`. The
    `safeNext` helper rejects values that do not begin with a single
    `/`, values beginning with `//`, and values containing a backslash.
-   [ ] **Private record ID tampering:** While signed in as User A,
    change the ID in a private-system URL to a record owned by User B.
    The private record must not be disclosed.
-   [ ] **Secret exposure:** Search browser-delivered JavaScript and
    page source for the actual session secret and other server-only
    secrets. They must not be present.

## Current known caveats

-   `lib/session.js` uses a predictable development fallback when
    `SESSION_SECRET` is unset. Configure a long random production value
    and update the implementation to fail closed in production if the
    variable is missing.
-   The cookie's `Secure` flag depends on `COOKIE_SECURE=true`; use
    HTTPS and set this value to `true` in production.
-   These are documentation and test instructions, not evidence that
    deployed security checks have passed.

## Production configuration

Set `SESSION_SECRET` to a unique random value generated securely (for
example, `openssl rand -hex 32`). Set `COOKIE_SECURE=true` when the site
is served over HTTPS. Never commit `.env.local` or publish secret
values.
