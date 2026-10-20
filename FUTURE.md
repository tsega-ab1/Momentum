# Future Work and Deliberate Scope Cuts

This file records work that is not required for the current capstone
delivery. Items below are possible follow-ups, not promises that they
already exist.

## Priorities after submission

1.  **Replace JSON-file storage with a persistent database.** The
    current `data/db.json` approach is simple for a demo but has
    limitations for concurrent writes, scaling, backups, and serverless
    deployment.
2.  **Harden production session configuration.** Require a strong
    `SESSION_SECRET` in production, set secure cookies on HTTPS, and
    document key rotation and session invalidation.
3.  **Complete deployed security verification.** Run and record the
    authentication, ownership, private-record, and redirect tests in
    `AUTH.md`.
4.  **Complete the browser regression pass.** Verify favorite
    persistence, My Systems and Favorites tabs, editing, deletion,
    private-system 404 behavior, API responses, share images, sitemap,
    robots, Settings, sign-out, and mobile layout.
5.  **Measure and improve performance.** Fill `PERF.md` with actual
    deployed-build measurements, then address any failed budget or
    accessibility checks.
6.  **Improve image handling.** Review the two `<img>` lint warnings in
    `components/systems/ColorWorkspace.jsx`; use the appropriate Next.js
    image strategy where it fits the actual upload/gallery behavior.

## Possible future enhancements

-   Automated end-to-end browser tests for sign-up, sign-in, saving,
    editing, deleting, favorites, and private-record access.
-   Database migrations, backups, and a documented recovery process.
-   Rate limiting and abuse protection for authentication and write
    endpoints.
-   Account recovery and email verification, if the project scope
    expands to support real users.
-   More robust observability for server errors and failed actions.
-   Additional export formats or design-system integrations based on
    user feedback.

## Intentionally not claimed

-   No deployed performance numbers are recorded until they are
    measured.
-   No live security test is marked as passed until it is run against
    the deployed site.
-   A persistent production database is not claimed while the app uses
    JSON-file storage.
-   Future enhancements listed above should not be presented as
    completed features.
