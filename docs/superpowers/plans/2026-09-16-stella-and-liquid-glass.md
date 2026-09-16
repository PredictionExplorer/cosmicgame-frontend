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

## Initial draft verification receipt

Supported Node 24.19.0 / npm 10.9.8. Full Jest coverage: 504 suites, 8,216 tests passed; statements 84.09%, branches 77.29%, functions 80.07%, lines 85.62%. Locale/terminology/lexicon checks, full lint, TypeScript, and dependency audit passed. Targeted supported dependency patches leave zero advisories and no exceptions. Production build and app/landing bundle budgets passed using local fixture configuration.

Browser checks: 21 theme checks passed across desktop Chromium, mobile Chromium, and mobile WebKit; three ambient-canvas cases skipped (mobile by design, desktop headless WebGL unavailable). Six permission-inheritance checks passed in desktop/mobile Chromium. The permission regression first failed with the external-only policy and passed after including the required parent self permission. Real Holloway iframe QA confirmed both canonical hosts, first welcome, no automatic audio, persistent dismissal, shared theme preference, one loader/frame across navigation, and allowed iframe microphone policy with camera blocked. No device capture, paid provider session, wallet transaction, or Cosmic production deployment was performed by this frontend verification.

## Owner correction: preserve the saved look

Restore the full e58da429 palette, fixed brand colors/gradients and original control
material together under the display name Original Glass. Keep the current layout,
Midnight default, other palettes and Stella integration. Preserve white CTA labels
and exact original gradient stops rather than the initial readability substitutions.
The original CTA contrast shortfall is documented in theme-system.md and explicitly
reported by a known-limitation browser assertion; do not describe this preset as fully AA.
The original 68%-white muted text is now contrast-checked after alpha compositing.

## Saved-look restoration verification receipt

Restored the saved palette, brand gradients and control material under the Original
Glass label in all eight locales. Compatibility fixes compose the saved muted-text
alpha correctly in the wallet, scrollbar and three charts. Independent review found
no outstanding issues.

Full Jest coverage passed: 504 suites, 8,216 tests. After the five alpha-consumer
changes, their 44 focused chart tests also passed. Locale/terminology/lexicon,
lint, TypeScript, production build and bundle budgets passed. App/landing bundles
remain 632.5/292.0 KB gzip against 640/320 KB budgets.

Browser verification: 24 theme checks passed across desktop Chromium, mobile
Chromium and mobile WebKit; six permission-inheritance checks passed in Chromium.
Three explicitly expected failures record the retained original CTA source-color
contrast shortfall. Three ambient-canvas cases skipped (mobile by design; desktop
headless WebGL unavailable). Playwright summarizes the expected failures as passed:
33 expected outcomes, three skips, zero unexpected failures. The saved-color
regression was first confirmed failing against the adapted draft and passes with
the restored source colors. Screenshots use fixture cycle data.

## Owner correction: restore the rendered atmosphere

The owner identified the missing softer indigo appearance and drifting stars. A
source comparison found that the saved palette alone did not reproduce the old
rendering: the signature background, translucent Surface/Card materials and header
effects had been removed upstream. Earlier screenshots also forced reduced motion,
which suppressed the app particle engine and hid the whole ambient backdrop.

Restore those archived layers only for Original Glass. Keep the current dashboard
geometry and other palettes. Use the historical signature background on the current
home page, map its raw panels to the saved surface materials, and reuse the unchanged
desktop particle engine. Reduced motion retains static colors while stopping
animation. Verify both static and normal-motion views, including actual changing
particle canvas frames and theme switching without layout movement.

## Atmosphere restoration verification receipt

The saved signature atmosphere, translucent panels and header now render on the
current dashboard. Existing palettes retain their backgrounds and layout. A browser
regression verifies panel geometry and preserves the gallery toolbar's sticky
position. Normal-motion verification keeps the home responsive beyond ten seconds,
checks changing particle frames, and switches themes; a headed desktop recording
also confirms sustained movement. Updated desktop/mobile screenshots and a
10-second clip use fixture cycle data.

That longer check exposed an existing contract-error recursion: the empty-read
classifier recursively called viem's self-first `walk` predicate. A separate fix
traverses Error causes once with cycle protection. Its bounded regression failed
before the fix; actual viem errors and cyclic causes pass afterward. Independent
review found no remaining blockers in the fix or theme changes.

Supported Node 24.19.0 / npm 10.9.8. Full coverage: 504 suites, 8,220 tests passed;
statements 84.11%, branches 77.33%, functions 80.14%, lines 85.64%. Locale/terminology/
lexicon, full lint, TypeScript, dependency audit and production build passed. Audit:
zero advisories/exceptions. App/landing bundles: 633.7/292.0 KB gzip, within 640/320 KB.
Jest emitted a worker-teardown warning but exited zero with every suite passing.

Browser checks: 28 ordinary theme passes and six permission passes; three explicitly
expected original-CTA contrast failures; five intentional skips (three landing
WebGL checks and two mobile particle checks). Playwright reports 37 expected
outcomes, five skips, zero unexpected failures. The previously documented headless
WebKit black rectangle remains visible across existing themes and this preset;
real Safari visual review remains needed before rollout. No Cosmic deployment or
merge was performed.
