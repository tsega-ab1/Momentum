# Performance and Accessibility Report

## Status

This document is a measurement record. **Do not enter estimated values
as measured results.** The deployed URL and actual Lighthouse/browser
measurements have not been provided in the available project review, so
the result fields below are intentionally blank.

## Target budget

The capstone reading sheet calls for measurements from the deployed
build and gives these targets:

  -------------------------------------------------------------------------
  Metric                        Target      Measured result Pass?
  --------------- -------------------- -------------------- ---------------
  Largest                     \< 2.5 s     Not measured yet Pending
  Contentful                                                
  Paint (LCP)                                               

  Cumulative                    \< 0.1     Not measured yet Pending
  Layout Shift                                              
  (CLS)                                                     

  Interaction to             \< 200 ms     Not measured yet Pending
  Next Paint                                                
  (INP)                                                     
  -------------------------------------------------------------------------

Record the measurement environment, including deployment URL, date,
browser, device or emulation profile, and Lighthouse throttling
settings.

## How to measure

1.  Deploy a production build and open the public URL in a fresh browser
    session.
2.  Run Lighthouse on the landing page, Studio, Explore, and a public
    system page. Use the same mobile/throttled settings for comparable
    runs.
3.  Record reported LCP and CLS. For INP, use real interaction data when
    available; if Lighthouse does not report INP for the run, record
    that fact rather than substituting another metric without
    explanation.
4.  Repeat the run and record the observed values and test conditions.
    Do not select only the best run without noting the method.
5.  Check the browser Network panel for large images and unnecessary
    assets.
6.  Test keyboard-only navigation, focus visibility, skip link behavior,
    heading structure (one main `h1` per page), and meaningful
    alternative text for images.
7.  Inspect page source for an absolute `og:image` URL and test that
    sharing the URL produces a preview card with an image.
8.  Verify `/sitemap.xml` and `/robots.txt` are valid routes and that
    private routes are not exposed in the sitemap.

## Results log

  -----------------------------------------------------------------------------------
  Date      URL /      Device /            LCP          CLS INP or         Notes
            route      profile                              availability   
                                                            note           
  --------- ---------- ---------- ------------ ------------ -------------- ----------
  Not run   Not        Not                 ---          --- ---            Fill after
            provided   recorded                                            testing
                                                                           the
                                                                           deployed
                                                                           build.

  -----------------------------------------------------------------------------------

## Accessibility checklist

-   [ ] Complete the primary flow using only the keyboard.
-   [ ] Confirm visible focus indicators and sensible focus order.
-   [ ] Confirm a skip link works.
-   [ ] Confirm one clear `h1` per page.
-   [ ] Confirm every meaningful image has suitable `alt` text;
    decorative images should use empty alt text.
-   [ ] Check color contrast for text and interactive controls.
-   [ ] Test at a real phone-sized viewport and, if possible, on a
    physical phone.
-   [ ] Check loading, empty, and error states.

## Known automated checks

In the latest terminal output supplied during the review,
`npm run build` succeeded, `npm test` passed 70 tests, and
`npm run lint` exited successfully with two `@next/next/no-img-element`
warnings in `components/systems/ColorWorkspace.jsx`. These are automated
project checks, not deployed performance measurements.
