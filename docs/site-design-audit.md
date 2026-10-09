# Site design and page audit

Audited against the landing page reference on 2026-09-05. The inventory covers all 66 route patterns under `app/[locale]`, including both hosts, the source-code redirect, the not-found catch-all and the chart embed. Route completeness is also tracked by `e2e/locale-route-inventory.ts`. The shared locale architecture applies the same templates to en, zh, zh-TW, zh-HK, uk, ko, ja and vi.

## Scope and evidence

This document records the source/template audit and implemented corrections. Browser results are recorded separately by the site design verification suite; a source review is not a claim that every live account, record, wallet transaction or API failure was exercised. Dynamic routes use representative test records.

The landing reference is an almost-black canvas, pale lavender accents, display typography, generous space, fine borders, and artwork as the focal point. The implementation brings the common app shell, cards, tables, controls, headings and informational templates into that same visual language. Translated copy, contract actions and protocol facts are preserved. Quiz routes now follow their intended canonical landing host, including missing tiers; the new landing recovery boundary keeps invalid learning and quiz links in the correct shell.

## Cross-site corrections

- Landing subpages now have the lightweight landing header and full footer. The landing homepage retains its own integrated chrome.
- App pages inherit one shared header/footer; the experimental page was verified to already retain both, and that behavior is preserved. Only the chart embed intentionally omits chrome.
- Seventeen public data routes previously rendered their primary headings and summaries outside `main`, ahead of the fixed-header clearance. These server-rendered summaries are now passed into each client page as content and rendered inside every applicable shell state. Statistics already renders inside its shared layout main.
- Three address history pages now have actual primary headings; address metadata and actions wrap at phone widths.
- Summary-backed pages have one authoritative introduction. Duplicate client titles are suppressed while marketplace actions, live counts, network metadata and scope tooltips remain in compact rows.
- Audits, security and risk disclosures now use the canonical page shell, correcting inconsistent fixed-header clearance.
- FAQ, how-it-works, legal and outreach prose/cards no longer begin hidden while waiting for scroll intersection.
- Informational titles, legal reading widths, section rhythm and surfaces follow the common design. Chart category colors and artwork retain their meaningful color differences.

## Route-by-route review

| Host    | Public route                                  | Template / outcome                                                                                                                                                                                       |
| ------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App     | `/[...notFound]`                              | Recovery view uses display typography, common shell and suggested routes; app navigation/footer remain available.                                                                                        |
| App     | `/admin/admin`                                | Narrow settings form retains permission/loading states; common title, panel and control styles.                                                                                                          |
| App     | `/admin`                                      | Operational view inherits PageShell, editorial PageHeader, cards, controls and common app chrome.                                                                                                        |
| App     | `/allocation/[id]`                            | Removed the decorative hero wash and glowing amount; display title and readable figures. Invalid/missing states have primary headings.                                                                   |
| App     | `/allocation`                                 | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/allocation-finalized`                       | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/anchor-action/[IsRwalk]/[actionId]`         | Record detail uses common PageHeader, narrow detail panels, status/loading states and responsive tables.                                                                                                 |
| App     | `/anchoring`                                  | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/attached-nfts`                              | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/audits`                                     | Corrected fixed-header clearance by adopting PageShell; shared trust reading layout, display titles and source links.                                                                                    |
| App     | `/code`                                       | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/contracts`                                  | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/coordination-changes`                       | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/cosmic-signature-transfer/[address]`        | Address history uses common PageHeader, detail panels, responsive address/table treatments and retained invalid/loading states.                                                                          |
| App     | `/cosmic-token-transfer/[address]`            | Address history uses common PageHeader, detail panels, responsive address/table treatments and retained invalid/loading states.                                                                          |
| App     | `/current-cycle`                              | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls. Simplified custom cycle hero and primary action.       |
| App     | `/detail/[id]`                                | Artwork detail deliberately gives the art most space; common shell, app chrome and shared detail surfaces apply.                                                                                         |
| App     | `/distributions-by-token/[address]/[tokenId]` | Detail history uses PageHeader, restrained panels, responsive tables and retained loading/empty states.                                                                                                  |
| App     | `/embed/endurance/[round]`                    | Intentional chrome exception for embedding. Main now exposes the shared skip-target id; chart remains a compact standalone surface.                                                                      |
| App     | `/eth-contribution/detail/[id]`               | Narrow record detail uses common PageHeader and panels; invalid, loading and unavailable branches retained.                                                                                              |
| App     | `/eth-contribution`                           | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/eth-contribution/round/[round]`             | Cycle history uses common PageHeader and tables; invalid/loading states retained.                                                                                                                        |
| App     | `/experimental-ui`                            | Experimental art view retains its specialized composition; its existing app header/footer were verified and preserved.                                                                                   |
| App     | `/faq`                                        | Replaced boxed neon hero with open display typography, left-aligned search and restrained icon surfaces. Content renders visible before scrolling.                                                       |
| App     | `/gallery`                                    | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls. Restrained filter/stat icon colors let artwork lead.   |
| App     | `/gesture/[id]`                               | Record detail uses common PageHeader, panels and responsive data; invalid/loading states retained.                                                                                                       |
| App     | `/how-it-works`                               | Open editorial hero, consistent section reading edge and quieter icon/cards. Informational sections render visible before scrolling.                                                                     |
| App     | `/imprint`                                    | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls. Form width and disconnected prompt retained.           |
| App     | `/internal/cst-outreach-transfer`             | Restricted form retains role/loading/wallet states and common title, panel and control design.                                                                                                           |
| App     | `/marketing/[address]`                        | Promoted the label to a real PageHeader h1; address wraps on narrow screens and invalid state has a primary heading.                                                                                     |
| App     | `/marketing`                                  | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls. Open outreach header and visible explanatory sections. |
| App     | `/my-allocations`                             | Wallet, error and populated states share the canonical shell/title; revised common empty-state, card, button and table styles apply.                                                                     |
| App     | `/my-anchors`                                 | Common shell/title and restrained stats/cards; disconnected wallet prompt retained.                                                                                                                      |
| App     | `/my-statistics`                              | Shared UserStatisticsView now aligns address metadata with its editorial title; common stats/panels apply.                                                                                               |
| App     | `/my-tokens`                                  | Common shell/title, collection cards and dedicated wallet/error states; app header/footer inherited.                                                                                                     |
| App     | `/named-nfts`                                 | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/`                                           | Art-led control room. Retains its immersive composition; uses common app palette, navigation, footer and action styling.                                                                                 |
| App     | `/privacy`                                    | Left-aligned legal header and date, quieter cards, readable paragraph rhythm; text is visible before scrolling.                                                                                          |
| App     | `/public-goods-contributions-cg`              | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/public-goods-contributions-voluntary`       | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/public-goods-retrievals`                    | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/recipient-history`                          | Common shell/title and history table; disconnected/empty states retained.                                                                                                                                |
| App     | `/risk-disclosures`                           | Corrected fixed-header clearance by adopting PageShell; shared trust reading layout, display titles and source links.                                                                                    |
| App     | `/security`                                   | Corrected fixed-header clearance by adopting PageShell; shared trust reading layout, display titles and source links.                                                                                    |
| App     | `/site-map`                                   | Aligned page title and link groups to one reading edge; server crawl links and all groups retained.                                                                                                      |
| App     | `/source-code`                                | Intentional permanent redirect to localized /code; destination supplies all chrome.                                                                                                                      |
| App     | `/statistics/activity`                        | Shared statistics main and sub-navigation; display introduction, consistent divider, chart/table cards and loading/error boundary.                                                                       |
| App     | `/statistics/anchoring`                       | Shared statistics main and sub-navigation; display introduction, consistent divider, chart/table cards and loading/error boundary.                                                                       |
| App     | `/statistics`                                 | Already inside the shared statistics main. Open summary, quieter statistics surfaces and section navigation.                                                                                             |
| App     | `/statistics/participation`                   | Shared statistics main and sub-navigation; display introduction, consistent divider, chart/table cards and loading/error boundary.                                                                       |
| App     | `/statistics/performance`                     | Shared statistics main and sub-navigation; display introduction, consistent divider, chart/table cards and loading/error boundary.                                                                       |
| App     | `/statistics/tokens`                          | Shared statistics main and sub-navigation; display introduction, consistent divider, chart/table cards and loading/error boundary.                                                                       |
| App     | `/system-event/[round]/[start]/[end]`         | Record detail uses common title/panels; loading/error branches and responsive table retained.                                                                                                            |
| App     | `/terms`                                      | Left-aligned legal header and date, quieter cards, readable paragraph rhythm; text is visible before scrolling.                                                                                          |
| App     | `/transfer-cst`                               | Narrow transfer form uses common title, panels and wallet-state component; app chrome inherited.                                                                                                         |
| App     | `/used-rwlk-nfts`                             | Moved the server-rendered h1/summary inside every main state; open editorial introduction and canonical secondary heading, surfaces and controls.                                                        |
| App     | `/user/[address]`                             | Shared UserStatisticsView now aligns address metadata with its editorial title; invalid address gets PageHeader.                                                                                         |
| App     | `/user/stellar-selection-eth/[address]`       | Added primary h1, wrapping address metadata and wrapping action row. Retrieval behavior and ownership guards preserved.                                                                                  |
| App     | `/user/stellar-selection-nft/[address]`       | Added primary h1 and wrapping address metadata. History/loading/invalid address behavior preserved.                                                                                                      |
| Landing | `/about`                                      | Added the landing display face and shared surface tokens; common landing header and full footer now frame the reading page.                                                                              |
| Landing | `/`                                           | Visual reference retained. Homepage owns its integrated header/footer; the shell avoids duplicate chrome.                                                                                                |
| Landing | `/learn/[slug]`                               | All 11 article slugs share display headings, readable prose, breadcrumbs and related links; common landing header/footer.                                                                                |
| Landing | `/learn`                                      | Display headline, restrained cards, generous reading rhythm; common landing header and full footer.                                                                                                      |
| Landing | `/quiz/[tier]`                                | All 3 tiers share display heading and readable description; existing accessible quiz state machine retained and common landing header/footer added.                                                      |
| Landing | `/quiz`                                       | Display headline and restrained tier cards; common landing header/footer.                                                                                                                                |
| Landing | `/white-paper`                                | Display hierarchy and readable prose/tables; source citations, in-page contents, download, and common landing header/footer retained.                                                                    |

## Generated content and exceptional states

The `/learn/[slug]` template covers the following article paths:

- `/learn/what-is-cosmic-signature`
- `/learn/how-the-performance-cycle-works`
- `/learn/how-gestures-work`
- `/learn/three-body-nft-art`
- `/learn/cosmic-signature-on-arbitrum`
- `/learn/contracts-security-verification`
- `/learn/cst-token-and-cosmic-council`
- `/learn/anchoring-nfts`
- `/learn/protocol-guild-public-goods`
- `/learn/collecting-and-trading-cosmic-signature`
- `/learn/not-a-lottery-not-an-investment`

The quiz template covers `/quiz/basic`, `/quiz/medium` and `/quiz/hard`. Locale prefixes are resolved by the existing routing registry; English remains unprefixed.

App route error boundaries continue to use `RouteError` inside the shared application shell. The landing route group now shares a branded not-found boundary across its home, learning and quiz routes, with the common main target and display typography. Unknown quiz tiers reach that boundary through the existing tier guard; known tiers remain statically generated. The app catch-all uses branded recovery links. Wallet-dependent and restricted pages preserve their existing disconnected, invalid, loading, access and error states rather than adding fabricated account data.

## Spacing follow-up

A second pass measured 76 non-home destinations in the production baseline and inspected settled browser layouts and targeted screenshots after the corrections. It checked stacked padding, independent columns, main-to-footer spacing, recovery-page minimum heights and hidden motion wrappers. The separate full-site spacing sweep also covers the home pages at desktop and phone widths.

- The main home layout moves attached assets below the chat/art row, reducing the measured empty space below chat from 1,547px to the intended 24px section gap. The experimental home now renders attached assets in a full-width section after its primary deck. Its chat column retains the live cycle status, so a tall list of attached assets cannot determine that row's height. A regression verifies the asset section is outside and after the deck, with the default responsive showcase layout.
- The site map uses independent responsive columns with intact link groups. Its former shared grid rows paired a 344px group with a 1,304px group and a 1,173px group with a 321px group, leaving large empty column areas. The new flow preserves all links and their document order without reserving those empty row tracks.
- Outreach and educational sections use a consistent 32px/40px vertical inset. Consecutive sections no longer add up to 112px–128px of padding, and the last educational callout no longer adds another spacer before the page footer.
- Landing articles, the learning hub, quizzes and the white paper use 64px/80px bottom spacing. App and landing recovery views use natural content height instead of stacked viewport-height minimums. FAQ and loading-state spacers were also reduced where they duplicated their surrounding shell.
- The shared page minimum-height floor was removed; the outer flex shell handles short-page footer placement. At 1920×1080, an empty outreach-address page now has a 431px main instead of a 760px floor; the outer flex shell places the footer bottom at 1080px without unnecessary document scrolling. Shared page/footer padding was reduced separately. Artwork surfaces and the dedicated full-window chart retain their intentional dimensions. Delayed entrance animations were checked after settling so temporary hidden content was not mistaken for permanent empty space.

Representative 1440px measurements, including the shared-shell changes:

| View                                                                            |  Before |   After |
| ------------------------------------------------------------------------------- | ------: | ------: |
| Site map main height                                                            | 2,973px | 2,112px |
| Outreach main height                                                            | 2,484px | 2,140px |
| How It Works main height                                                        | 5,251px | 4,915px |
| Blank space below the final text on an empty outreach-address page, inside main |   334px |    82px |
| About page space from final visible content to main end                         |   155px |   107px |

Existing experimental, outreach, educational, site-map and recovery tests passed after these adjustments. The experimental placement regression checks structure rather than pinning padding classes. No copy, translations, records or available actions were removed.

The spacing follow-up passed **176 / 176 checks against the rebuilt production site**: the complete 164-check route suite plus 12 new spacing regressions with eight assets, one or 24 chat messages, and 1920px / 1440px / 390px viewports. An independent capture using real API data confirmed 24px from the chat row to the next full-width section at both desktop widths. The existing chat interaction suite passed 21 checks (7 desktop-only cases intentionally skip on the mobile project). Focused home, attachment, shell, footer, directory, recovery and informational-page unit tests passed, as did the build, TypeScript, lint, formatting and lexicon gate.

## Initial redesign validation

Verified against the optimized production build on 2026-09-05:

- **164 / 164 browser checks passed without retries.** Every one of the 66 route templates is accounted for by the filesystem inventory guard. The suite renders 80 concrete destinations at 1440px desktop and 320px mobile widths, including all 11 learning articles, all 3 quiz tiers, branded recovery pages, redirected routes and the intentionally bare embed. It checks main/header/footer landmarks, primary headings, keyboard skip-link activation, header clearance and document/content overflow. Quiz host redirects additionally cover all 8 locales with paths and queries preserved.
- **All 7 translated locales passed representative landing/app checks:** 14 tests covering about and gallery at 320px, 768px and 1440px (42 localized page/width combinations). The existing header/responsive suite also passed across all 8 locales; desktop/mobile accessibility checks passed.
- **497 unit-test suites / 8,068 tests passed with coverage.** Line coverage is 85.46%; the configured coverage thresholds passed. Regressions cover quiz keyboard handling, heading placement across loaded/loading/failed gallery states, retained marketplace controls, shell behavior and canonical quiz routing.
- **Production build, TypeScript, lint, formatting and all internationalization gates passed.** No dependencies were added.
- **160 full-page production screenshots were captured and reviewed through desktop/mobile overview sheets.** API-backed pages use representative fixtures; this audit does not submit wallet transactions or verify every live account/record combination.

Run the complete page regression suite with:

```sh
HARNESS_E2E=0 npx playwright test e2e/site-cohesion.spec.ts --project="Desktop Chrome" --project="Mobile Chrome"
```

Set `SITE_AUDIT_SCREENSHOTS=1` to attach full-page captures. The Playwright configuration builds and starts a production server by default; `PLAYWRIGHT_REUSE_SERVER=1` and `PLAYWRIGHT_PORT` can target an existing local server.
