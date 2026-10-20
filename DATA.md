# Data Access, Ownership, and Caching

## Data storage

The current implementation uses a JSON-file database. `lib/db.js` reads
and writes `data/db.json`, with initial seed data from `data/seed.json`
when the database file does not exist. `MOMENTUM_DB_PATH` can override
the database file path.

Writes are made to a temporary file and renamed into place to reduce the
chance of leaving a partially written JSON file after a crash. This is
still a small file-backed data store, not a multi-user production
database.

**Hosting constraint:** the database file must live on persistent
writable storage. Ephemeral or serverless filesystems can lose changes
between instances or deployments. Confirm the host's storage guarantees
before relying on this database for a live demonstration.

## Main data paths

  ------------------------------------------------------------------------------------------------------
  Data / operation  Entry point                              Access rule       Refresh / consistency
                                                                               notes
  ----------------- ---------------------------------------- ----------------- -------------------------
  Public systems    `app/api/systems/route.js` and Explore   Public records    Public list and Explore
  list              UI                                       only              pages use caching/SWR
                                                                               behavior; verify exact
                                                                               refresh behavior in the
                                                                               current implementation
                                                                               before documenting
                                                                               timings.

  Individual system `app/systems/[id]/page.js`               Public systems    Public system pages are
                                                             are viewable;     cached and refreshed
                                                             private records   using the `systems` cache
                                                             require their     tag, according to the
                                                             owner             README and server
                                                                               actions.

  Current user's    `app/systems/page.js`, `lib/systems.js`  Signed-in user;   User-specific data should
  systems                                                    filter by owner   be fetched in request
                                                             ID                context and must not leak
                                                                               through shared public
                                                                               caches.

  Create or update  `app/actions.js`, `lib/systems.js`       Authenticated     Successful writes call
  system                                                     user; update      `updateTag("systems")` to
                                                             checks record     refresh tagged system
                                                             ownership         data.

  Delete system     `app/actions.js`, `lib/systems.js`       Authenticated     Successful deletes call
                                                             user; delete      `updateTag("systems")`.
                                                             checks record     
                                                             ownership         

  Favorite systems  `app/api/favorites/route.js`,            Authenticated     Verify persistence after
                    `lib/systems.js`                         user; favorites   refresh and verify that
                                                             are scoped to the one account cannot read
                                                             user              or modify another
                                                                               account's favorites.

  Saved color       `app/actions.js`, `lib/systems.js`       Authenticated     The action creates a
  palette                                                    user              palette for the current
                                                                               session user and
                                                                               refreshes the `systems`
                                                                               tag.

  Sitemap           `app/sitemap.js` or configured sitemap   Public URLs only  Check deployed output and
                    route                                                      ensure private
                                                                               records/routes are not
                                                                               listed.

  Export            `app/api/systems/[id]/export/route.js`   Must follow the   Test public export and
                                                             same              private export as owner
                                                             public/private    and non-owner.
                                                             access rules as   
                                                             the corresponding 
                                                             system            
  ------------------------------------------------------------------------------------------------------

## Server versus client

-   Authentication, ownership checks, JSON database access, and Server
    Actions run on the server.
-   Interactive color editing and browser preferences run in client
    components where needed.
-   The browser must not be treated as an authority for the current
    user, record ownership, or trusted color-system data.
-   The README states that the server recomputes a system's colors from
    its base color rather than trusting browser-provided generated
    colors.

## Cache and refresh rules

The project configuration enables Cache Components and partial
prefetching. The README describes public system pages and lists as
cached and states that write actions call `updateTag("systems")`.

Before final submission, inspect the current implementation and verify
these cases against a running build:

1.  Create a public system and confirm it appears in the public list and
    its public URL works.
2.  Edit the system and confirm the displayed data updates without a
    stale version persisting.
3.  Delete the system and confirm it no longer appears in public
    listings.
4.  Confirm private records do not appear in public API responses,
    shared caches, sitemap output, or another user's account.
5.  Confirm favorites remain associated with the correct account after a
    page refresh and sign-out/sign-in.

Do not promise a specific cache lifetime or consistency guarantee unless
it has been verified in the deployed build.
