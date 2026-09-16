# Stella and optional Liquid Glass

Goal: submit a focused review branch based on current upstream main, preserving its dashboard layout while adding an optional scheme recovered from Andrew's prior visual work and the previously built Holloway website assistant.

Architecture: extend SITE_THEMES and the existing CSS-token/cookie/local-storage system. Scope material effects to the selected liquid-glass root theme. Load the existing external Holloway widget from the shared root document; enable the parent and delegate microphone permission only to the Holloway iframe origin on the two canonical Cosmic hosts. No provider credentials or wallet actions enter this repository.

Stack: existing Next.js App Router, TypeScript, Tailwind v4, next-intl, Radix and Jest/Playwright. Use supported Node 24 and pinned npm 10.9.8.

## Theme

- [x] Inspect old b675472/e58da429 visual sources and upstream 6deb8c3 theme contract; baseline theme tests: 40 passed.
- [x] Add a failing menu-selection/persistence regression for liquid-glass.
- [x] Extend lib/theme/config.ts, styles/themes.css, all eight common.json catalogs, and scoped material CSS plus semantic control hooks. Retain midnight default and every current layout/state component.
- [x] Preserve keyboard focus, disabled states, reduced motion/transparency, print and readable text. Verify gradient foreground contrast at every color stop.
- [x] Update theme browser coverage for a material variant that can legitimately share a base palette; verify both hosts and mobile/desktop dimensions.

## Stella

- [x] Add shared-document script integration with the existing public installation ID; Next Script loads once across navigation.
- [x] Add a host-scoped Permissions-Policy exception for the Holloway iframe; preserve the default deny policy for other origins and camera/location everywhere.
- [x] Test script configuration and policy boundaries. Verify the installed widget on local rendering of the current site without changing production or creating paid conversations.
- [x] Document owner enable/disable, public knowledge scope, exact origin restrictions, welcome gesture, first-visit storage, and preview requirements.

## Review and delivery

- [x] Run i18n/terminology/lexicon gates, lint, type-check, dependency audit, full Jest coverage and production build. Resolve any baseline gate issue narrowly and record it separately.
- [x] Run focused theme/integration browser checks, inspect screenshots, then independent code review.
- [x] Prepare reviewable commits on a fresh branch for Andrew's fork and draft PR delivery against current main. Leave PR55 and its old layout branch unchanged. Vercel preview authorization and production merging remain with the upstream team.

## Verification receipt

Supported Node 24.19.0 / npm 10.9.8. Full Jest coverage: 504 suites, 8,216 tests passed; statements 84.09%, branches 77.29%, functions 80.07%, lines 85.62%. Locale/terminology/lexicon checks, full lint, TypeScript, and dependency audit passed. Targeted supported dependency patches leave zero advisories and no exceptions. Production build and app/landing bundle budgets passed using local fixture configuration.

Browser checks: 21 theme checks passed across desktop Chromium, mobile Chromium, and mobile WebKit; three ambient-canvas cases skipped (mobile by design, desktop headless WebGL unavailable). Six permission-inheritance checks passed in desktop/mobile Chromium. The permission regression first failed with the external-only policy and passed after including the required parent self permission. Real Holloway iframe QA confirmed both canonical hosts, first welcome, no automatic audio, persistent dismissal, shared theme preference, one loader/frame across navigation, and allowed iframe microphone policy with camera blocked. No device capture, paid provider session, wallet transaction, or Cosmic production deployment was performed by this frontend verification.
