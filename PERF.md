# Performance and Accessibility Report

## Status

This document records performance measurements from the deployed Momentum application.

- **Deployment URL:** https://momentum-gs6i.onrender.com/
- **Measurement date:** 20 October 2026
- **Tool:** Lighthouse 13.5.0
- **Profile:** Mobile
- **Test type:** Lighthouse lab audit of the production deployment
- **Number of successful Lighthouse runs recorded here:** 1

These results represent one lab run and should not be interpreted as real-user field data.

## Performance Results

| Metric | Target | Measured result | Status |
|---|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5 s | 2.88 s | Needs improvement |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.00 | Meets target |
| Interaction to Next Paint (INP) | < 200 ms | Not measured | Not verified |
| First Contentful Paint (FCP) | Informational | 1.28 s | Recorded |
| Total Blocking Time (TBT) | Informational | 0.31 s | Recorded |
| Speed Index | Informational | 4.18 s | Recorded |
| Lighthouse Performance Score | Informational | 86/100 | Recorded |

INP was not reported by this Lighthouse run. TBT is a lab metric and is not a substitute for INP.

## Measurement Environment

- **URL tested:** https://momentum-gs6i.onrender.com/
- **Date:** 20 October 2026
- **Lighthouse version:** 13.5.0
- **Form factor:** Mobile
- **Browser mode:** Headless Chrome
- **Hosting:** Render
- **Audit scope:** Performance category on the landing page
- **Repeatability:** One successful audit is recorded; additional runs and other routes have not yet been documented.

The site returned HTTP 200 in five consecutive curl checks before the successful Lighthouse run. The observed response times ranged from approximately 0.51 to 1.47 seconds. These are curl request timings, not Lighthouse LCP measurements.

## Measurement Command

The successful audit was run with:

\`\`\`bash
npx --yes lighthouse https://momentum-gs6i.onrender.com/ \\
  --only-categories=performance \\
  --form-factor=mobile \\
  --output=json \\
  --output-path=/tmp/momentum-lighthouse.json \\
  --chrome-flags="--headless" \\
  --no-enable-error-reporting
\`\`\`

The recorded values were extracted from the resulting JSON report.

## Results Log

| Date | Route | Profile | LCP | CLS | INP | Performance score |
|---|---|---|---:|---:|---|---:|
| 20 Oct 2026 | `/` | Lighthouse Mobile | 2.88 s | 0.00 | Not measured | 86/100 |

## Observations

### Strengths

- CLS was 0.00 in this audit, meeting the target of less than 0.1.
- FCP was 1.28 seconds in this run.
- The production site responded with HTTP 200 in five consecutive availability checks.
- The project build and automated tests passed in the latest previously recorded terminal checks.

### Improvement Opportunities

LCP was 2.88 seconds, which is 0.38 seconds above the target of less than 2.5 seconds.

Potential next steps:

- Inspect the LCP element and identify what delays its rendering.
- Check whether large hero images can be resized, compressed, or served in more efficient formats.
- Ensure the LCP image, if applicable, is discoverable early and is not lazy-loaded unnecessarily.
- Review render-blocking CSS and JavaScript.
- Repeat Lighthouse measurements after any optimization and record the new results separately.

These are proposed investigation steps, not confirmed causes of the measured LCP result.

## Accessibility and Metadata Checklist

The following checks remain to be completed and recorded against the deployed application. Do not mark an item complete without testing it.

- [ ] Complete the primary user flow using only the keyboard.
- [ ] Confirm visible focus indicators and sensible focus order.
- [ ] Confirm that the skip link works.
- [ ] Check heading structure, including one clear main \`h1\` per page.
- [ ] Confirm meaningful images have suitable alternative text and decorative images have empty alt text.
- [ ] Check text and interactive-control color contrast.
- [ ] Test at a phone-sized viewport and, if possible, on a physical phone.
- [ ] Check loading, empty, and error states.
- [ ] Inspect the page source for an absolute \`og:image\` URL.
- [ ] Verify the social-sharing preview.
- [ ] Verify that \`/sitemap.xml\` and \`/robots.txt\` respond correctly.
- [ ] Confirm private routes are not exposed in the sitemap.
- [ ] Run audits on Studio, Explore, and a public system page.

## Automated Project Validation

The latest previously recorded project checks were:

| Check | Result |
|---|---|
| \`npm run build\` | Passed |
| \`npm test\` | 70 tests passed |
| \`npm run lint\` | Exited successfully with two warnings |

The two lint warnings were \`@next/next/no-img-element\` warnings in \`components/systems/ColorWorkspace.jsx\`. These results are separate from the deployed Lighthouse measurements above.

## Deployment Notes

The application is hosted on Render. The site returned HTTP 503 during an earlier Lighthouse attempt, but five subsequent curl checks returned HTTP 200 and the later Lighthouse audit completed successfully.

A single successful audit does not establish consistent performance across visits, devices, or network conditions. Repeat the audit and document additional results before drawing broader conclusions.
