# Chinese Translation — Sprint Plan & Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-zh.md](./glossary-zh.md) ·
writing rules: [style-guide-zh.md](./style-guide-zh.md).

## How to read and update this file

Every translatable unit (route or shared namespace) tracks four stages, defined
precisely in [README.md §8](./README.md):

- **E — Extracted:** no hardcoded user-facing strings remain; English catalog/content
  entries exist; English rendering unchanged.
- **T — Translated:** Chinese written per glossary + style guide.
- **R — Reviewed:** two-pass review done (accuracy pass + native blind-fluency pass).
- **Q — QA'd:** verified in-context on the rendered `/zh` page.

Cells contain `☐` (not done) → replace with `✅` when the stage is complete. A unit is
**done** when all four are `✅`. Stages complete in order; a glossary change that touches
shipped strings resets affected units to T.

Scope covers **everything**: visible text, tooltips, toasts, errors, empty/loading
states, `aria-label`s, form validation, SEO title/description, OG image text, JSON-LD.

## Dashboard

| Sprint | Theme                                                                      | Units                        | Status     |
| ------ | -------------------------------------------------------------------------- | ---------------------------- | ---------- |
| 0      | Foundations (infra, no visible translation)                                | 14 tasks                     | **Done**   |
| 1      | Global chrome (nav, footer, wallet, shared UI)                             | 12 namespaces + 2 routes     | **Done**   |
| 2      | Landing site + Learn hub                                                   | 7 routes (incl. 11 articles) | **Done**   |
| 3      | Core dApp (home, cycle, gallery, detail, how-it-works)                     | 6 routes                     | **Done**   |
| 4      | Transactions & holdings (allocations, anchoring, my-\*, transfers, toasts) | 13 routes + toasts           | **Done**   |
| 5      | Statistics & data tables + locale formatting                               | 14 routes + formats          | **Done**   |
| 6      | FAQ, legal & trust pages                                                   | 10 routes                    | **Done\*** |
| 7      | Long tail + SEO completion                                                 | 14 routes + SEO sweep        | **Done**   |
| 8      | QA hardening & full-site fluency pass                                      | site-wide                    | **Done\*** |

Route accounting: 2 + 7 + 6 + 13 + 14 + 10 + 14 = **66 routes** = every `page.tsx` in
`app/` as of 2026-09-02 (Sprint 2 gained `/white-paper`, `/quiz`, and `/quiz/[tier]`;
Sprint 7 gained `/experimental-ui`). New routes added to the app **must** be added here
(add a row in the matching sprint section, or Sprint 7 if unclear).

\* Sprint 8's external native-fluency and legal reviews remain owner-waived; "Done"
records the automated hardening plus the 2026-09-02 deployment verification (see the
Sprint 8 section), not human certification.

---

## Sprint 0 — Foundations

Goal: ship the i18n machinery with **zero visible change** to the English site.
Chinese exists at `/zh` (rendering English fallback text) but is not yet linked in the UI.

| #    | Task                                                                                                                                                                                         | Done |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1  | Install `next-intl`; add `i18n/routing.ts` (`locales: ['en','zh']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'`), `i18n/request.ts` with en-fallback deep merge, `i18n/navigation.ts` | ✅   |
| 0.2  | Wrap `next.config.ts` with `createNextIntlPlugin()` (compose with Sentry + analyzer)                                                                                                         | ✅   |
| 0.3  | Move `app/(app)` and `app/(landing)` under `app/[locale]/`; `api/` stays outside; fix relative imports                                                                                       | ✅   |
| 0.4  | Locale layouts: validate `hasLocale`, `setRequestLocale`, `generateStaticParams`, `NextIntlClientProvider`; `RootDocument` takes `locale` and sets `<html lang>`                             | ✅   |
| 0.5  | Compose `proxy.ts` with next-intl middleware; host checks run on locale-stripped path; `/zh` → `/zh/landing-site` rewrite; redirects preserve prefix (README §2.3)                           | ✅   |
| 0.6  | Codemod `next/link` + `next/navigation` imports to `i18n/navigation.ts` wrappers; add `localeHref()` for cross-host absolute URLs                                                            | ✅   |
| 0.7  | Seed `messages/en/*.json` namespaces from `content/dapp.ts`, then delete `content/dapp.ts`; create empty-object `messages/zh/*.json`                                                         | ✅   |
| 0.8  | Language switcher component (English / 中文) in app header + mobile drawer, landing header, both footers; `NEXT_LOCALE` cookie persistence                                                   | ✅   |
| 0.9  | Fonts: add Noto Sans SC per README §5, `html[lang="zh"]` heading overrides                                                                                                                   | ✅   |
| 0.10 | SEO plumbing: `createMetadata` emits hreflang alternates + `og:locale`; sitemap alternates; fix hardcoded `en_US`                                                                            | ✅   |
| 0.11 | `scripts/i18n-parity.ts` + CI report job                                                                                                                                                     | ✅   |
| 0.12 | zh banned-term list wired into lexicon scanner for `messages/zh/**` and `content/**/zh*` (from glossary §5)                                                                                  | ✅   |
| 0.13 | E2E: zh smoke spec (`/zh` home/gallery/learn/faq render, switcher round-trip, cookie, host redirects with prefix); extend host-routing specs                                                 | ✅   |
| 0.14 | Docs: update README.md §9 commands if they changed during implementation                                                                                                                     | ✅   |

**Acceptance:** English site is behaviorally identical at every existing URL (full e2e
suite green, no URL changes, static rendering preserved — verify build output). `/zh/...`
renders every route with English fallback. Switcher works both directions on both hosts.
Parity report runs in CI.

**Sprint 0 completed 2026-07-16.** Verification: type-check, lint, jest (5,209 tests),
`yarn build` (all 62 routes SSG'd for both `/en/*` and `/zh/*`, ISR timings preserved),
lexicon scan (en + zh phases), parity report (262 en keys), and the e2e routing subset
(proxy incl. `/zh` cases, zh-smoke, smoke, navigation, landing, static-pages).

Implementation notes / deviations:

- **0.6:** ~95 files codemodded. Jest gained global mocks for `@/i18n/navigation`
  (delegating to the existing `next/navigation` mocks) and `next-intl` (hooks echo
  message keys), so component tests keep working without providers.
- **0.7:** 8 namespaces seeded (262 keys): `common`, `errors`, `home`, `meta`,
  `statistics`, `tables`, `toasts`, `wallet`. Registered in `i18n/request.ts`
  `NAMESPACES` — new namespaces must be added there and in every locale.
- **0.8:** the landing has no header bar, so the switcher floats top-right in the hero.
  Bonus: RainbowKit wallet modal follows the locale (`zh-CN`).
- **0.10 (progressive activation):** `createMetadata` only emits hreflang + locale
  canonical when a page passes `locale`. Untranslated pages must not pass it — their
  `/zh` variant is an English duplicate and keeps canonicalizing to the English URL.
  Activate per page as translations ship (Sprints 2–7); sitemap alternates follow in
  Sprint 7.
- **Locale detection** follows next-intl defaults: URL prefix → `NEXT_LOCALE` cookie →
  `Accept-Language` → `en`. Chinese-browser first-timers are auto-redirected to `/zh`.
- **The middleware is read-only over `NEXT_LOCALE`** (`withoutLocaleCookieWrites` in
  `proxy.ts`). next-intl's middleware normally rewrites the cookie on every request
  whose URL locale differs from it — including App Router prefetches, which Next 16
  strips the `Next-Router-Prefetch` header from before middleware runs. That let
  prefetches of still-mounted `/zh/...` links clobber a fresh `en` choice, so switching
  back to English "didn't stick". Now the cookie is written only client-side by
  next-intl's router on an explicit switch (with `maxAge` 1 year from
  `routing.localeCookie`), and the middleware only reads it for redirects.
- **Cross-host locale carry-over:** the `NEXT_LOCALE` cookie is host-scoped, so the
  choice does not yet follow users between the landing and app hosts. Sprint 1 must
  build cross-host links (nav, footers, landing CTAs) with `localeHref()` so the URL
  prefix carries the locale across.
- **Denial copy must never live in JSON catalogs** (JSON has no comment pragmas for
  `lexicon-allow`) — it belongs in per-locale TS content modules.
- The dApp home (`/[locale]`) renders dynamically because it reads `headers()` —
  pre-existing behavior, unrelated to i18n.

## Sprint 1 — Global chrome

Every page shares this layer; translating it first makes every subsequent `/zh` page
look mostly-translated instead of mostly-English.

**Shared namespaces** (`messages/*/…`):

| Namespace  | Contents (key sources)                                                                          | E   | T   | R   | Q   |
| ---------- | ----------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `common`   | generic buttons/status/empty/loading (spread across `components/`)                              | ✅  | ✅  | ✅  | ✅  |
| `nav`      | `config/nav.tsx` titles + descriptions, drawer, ecosystem (`config/ecosystem.ts`)               | ✅  | ✅  | ✅  | ✅  |
| `footer`   | `components/layout/Footer.tsx` link groups + tagline                                            | ✅  | ✅  | ✅  | ✅  |
| `wallet`   | connect/disconnect, RainbowKit locale (`zh-CN` built-in), network prompts, balances             | ✅  | ✅  | ✅  | ✅  |
| `tables`   | shared headers/pagination/sorting/empty in `components/tables/` (26 files)                      | ✅  | ✅  | ✅  | ✅  |
| `tooltips` | shared/global tooltips (`components/ui/info-tooltip.tsx` call sites in shared components)       | ✅  | ✅  | ✅  | ✅  |
| `toasts`   | toast infrastructure + `utils/errors.ts` shared messages (page-specific texts land in Sprint 4) | ✅  | ✅  | ✅  | ✅  |
| `errors`   | error boundaries, `error-state` components, API-failure copy                                    | ✅  | ✅  | ✅  | ✅  |
| `forms`    | shared validation/input copy, date-picker labels (`components/ui/date-picker.tsx`)              | ✅  | ✅  | ✅  | ✅  |
| `formats`  | duration/countdown unit labels (full locale formatting lands in Sprint 5)                       | ✅  | ✅  | ✅  | ✅  |
| `meta`     | shared metadata fragments (site name pattern, OG defaults)                                      | ✅  | ✅  | ✅  | ✅  |
| `search`   | header/gallery search placeholder + results copy                                                | ✅  | ✅  | ✅  | ✅  |

**Routes:**

| Route                  | Sources                                                | E   | T   | R   | Q   |
| ---------------------- | ------------------------------------------------------ | --- | --- | --- | --- |
| `/[...notFound]` (404) | `(app)/not-found.tsx`, `(app)/[...notFound]/`          | ✅  | ✅  | ✅  | ✅  |
| `/site-map`            | `(app)/site-map/SiteMapPage.tsx` (large label catalog) | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** on any `/zh` page, header, footer, wallet flow, tables chrome, and error
states are fully Chinese. Parity enforcement flips on for these namespaces. Glossary
amendments from first contact with real UI are merged (glossary §6). The glossary remains
amendable through Sprint 2, then freezes through the change process.

**Sprint 1 completed 2026-07-17.** Verification: type-check, lint, Jest (5,236 tests),
production build (120 static pages), lexicon scan, full parity report, strict Sprint 1
required-key gate, zh smoke (desktop + mobile), proxy routing, and rendered layout QA at
320 / 768 / 1440 px with screenshots.

Implementation notes / deviations:

- Added and registered `nav`, `footer`, `tooltips`, `forms`, `formats`, `search`, and
  route-owned `siteMap` catalogs. Sprint 1 owns 548 required zh keys; later-sprint
  `home`, `statistics`, route metadata, and transaction-specific toast keys intentionally
  continue to report English fallback.
- `scripts/i18n-sprint1-required.json` makes completed keys fail CI without forcing mixed
  namespaces (`common`, `meta`, `toasts`) to translate future-sprint entries early.
- Every component-owned string in the 26 `components/tables/` files is localized; imported
  statistics prose and locale-aware number/date formatting remain Sprint 5.
- Cross-host user links now carry `/zh` explicitly; third-party links remain unchanged.
  Shared root metadata and `/site-map` metadata/JSON-LD are locale-aware.
- **R-stage exception requested by the project owner:** independent agent accuracy and
  Chinese-only blind-fluency passes both returned PASS after corrections. This is recorded
  as agent review, not native-human sign-off; Sprint 8's native reviewer launch gate remains.
- No glossary amendments were needed. The documented freeze point is after Sprint 2, when
  landing/Learn transcreation has exercised the terminology in long-form copy.

## Sprint 2 — Landing site + Learn hub

The public face; highest transcreation bar (style guide §2 landing register). Convert
`content/landing.ts` and `content/learn.ts` to per-locale modules (README §3.2).

| Route           | Sources                                                                                                                                        | E   | T   | R   | Q   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/` (landing)   | `(landing)/landing-site/`, `content/landing/` (hero, cycle, art, tracks, anchoring, public goods, council, verifiability, landing FAQ, footer) | ✅  | ✅  | ✅  | ✅  |
| `/about`        | `(landing)/about/page.tsx`                                                                                                                     | ✅  | ✅  | ✅  | ✅  |
| `/learn` (hub)  | `(landing)/learn/`, `content/learn/` hub copy                                                                                                  | ✅  | ✅  | ✅  | ✅  |
| `/learn/[slug]` | `content/learn/` articles — tracked per article below                                                                                          | ✅  | ✅  | ✅  | ✅  |
| `/white-paper`  | `(landing)/white-paper/`, `content/white-paper/`, `public/white-paper/*-zh.pdf` — post-sprint addition, see notes                              | ✅  | ✅  | ✅  | ✅  |
| `/quiz` (hub)   | `(landing)/quiz/`, `content/quiz/text.zh.ts` — post-sprint addition, no review pass recorded (see notes)                                       | ✅  | ✅  | ☐   | ✅  |
| `/quiz/[tier]`  | `(landing)/quiz/[tier]/`, `content/quiz/text.{basic,medium,hard}.zh.ts` — post-sprint addition, no review pass recorded                        | ✅  | ✅  | ☐   | ✅  |

Per-article tracking (all four stages apply to each):

| Article slug                              | E   | T   | R   | Q   |
| ----------------------------------------- | --- | --- | --- | --- |
| `what-is-cosmic-signature`                | ✅  | ✅  | ✅  | ✅  |
| `how-the-performance-cycle-works`         | ✅  | ✅  | ✅  | ✅  |
| `how-gestures-work`                       | ✅  | ✅  | ✅  | ✅  |
| `three-body-nft-art`                      | ✅  | ✅  | ✅  | ✅  |
| `cosmic-signature-on-arbitrum`            | ✅  | ✅  | ✅  | ✅  |
| `contracts-security-verification`         | ✅  | ✅  | ✅  | ✅  |
| `cst-token-and-cosmic-council`            | ✅  | ✅  | ✅  | ✅  |
| `anchoring-nfts`                          | ✅  | ✅  | ✅  | ✅  |
| `protocol-guild-public-goods`             | ✅  | ✅  | ✅  | ✅  |
| `collecting-and-trading-cosmic-signature` | ✅  | ✅  | ✅  | ✅  |
| `not-a-lottery-not-an-investment`         | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** `cosmicsignature.com/zh` is 100% Chinese including metadata and landing
FAQ JSON-LD; denial copy (landing FAQ + `not-a-lottery-not-an-investment`) reviewed
against glossary §5 with allow-pragmas in place; fluency pass done by a reviewer reading
only Chinese.

**Sprint 2 completed 2026-07-18.** Verification: type-check, lint, Jest (5,253 tests),
production build, English/Chinese lexicon scan, Sprint 1 + Sprint 2 required-key gates,
and 64 rendered routing/landing/SEO Playwright checks. Chinese layout QA covered 320 /
768 / 1440 px on the landing page, About, Learn hub, and a representative article.

Implementation notes / deviations:

- `content/landing.ts` and `content/learn.ts` became typed `en.ts` / `zh.ts` modules with
  locale accessors; About received the same structure. Server pages select one locale and
  pass serializable section props to client components, so both content models do not enter
  the landing client bundle.
- Dynamic landing-clock copy lives in the strict `landing` message namespace (37 required
  keys). All four routes now emit localized canonicals, hreflang, Open Graph locale, and
  route-owned JSON-LD; CJK Open Graph image rendering remains the scheduled Sprint 7 item.
- Landing denial copy and the denial Learn article use narrowly scoped `lexicon-allow`
  pragmas. Independent agent bilingual-accuracy and Chinese-only blind-fluency passes both
  returned PASS after corrections. The project owner waived human review for this sprint;
  R records agent review and does not claim human sign-off.
- The glossary now permits `收官倒计时` as the natural running-copy form of
  `周期收官时间`. With long-form transcreation complete, the glossary is now frozen except
  through its §6 change process.
- QA exposed and fixed a locale-root rewrite bug that served the dApp at the landing host's
  `/zh`; proxy tests now assert Chinese landing copy, not only `lang=\"zh\"`.
- **Post-sprint addition (2026-08-25):** the `/white-paper` landing page shipped after this
  sprint (English first, 2026-08-24) and is now fully translated. `content/white-paper/zh.ts`
  follows the same typed en/zh module pattern; the route emits localized canonicals and
  hreflang; denial and tax-disclaimer copy sit inside `lexicon-allow` pragmas; and a natively
  typeset Chinese PDF (`cosmic-signature-white-paper-v1.0-zh.pdf`, xeCJK with Songti SC)
  accompanies the English one. R records agent bilingual-accuracy and blind-fluency passes,
  consistent with this sprint's convention.
- **Post-sprint addition (recorded 2026-09-02):** the `/quiz` hub and `/quiz/[tier]`
  (`caf90a94`) shipped bilingual — `content/quiz/text*.zh.ts` mirrors the white paper's
  terminology, structural parity is enforced by `content/__tests__/quiz-content.test.ts`,
  the numbers join the numeric-claims gate, and both routes sit in the Sprint 8 inventory
  that the `zh-site-qa` suite renders (Q). No separate accuracy or blind-fluency pass was
  recorded for the quiz copy, so R stays ☐ until one is.

## Sprint 3 — Core dApp

The main user journey: land on the app, watch the cycle, browse art, understand the
mechanics. Heavy inline-JSX extraction (~99 strings in how-it-works alone;
`components/home/` 11 files incl. `RoundInfoSection.tsx` with 7 tooltips;
`GalleryNFTCard.tsx` with 10).

| Route            | Sources                                                            | E   | T   | R   | Q   |
| ---------------- | ------------------------------------------------------------------ | --- | --- | --- | --- |
| `/` (app home)   | `(app)/page.tsx`, `components/home/`                               | ✅  | ✅  | ✅  | ✅  |
| `/current-cycle` | `(app)/current-cycle/`                                             | ✅  | ✅  | ✅  | ✅  |
| `/gallery`       | `(app)/gallery/`, `GalleryNFTCard.tsx`                             | ✅  | ✅  | ✅  | ✅  |
| `/detail/[id]`   | `(app)/detail/[id]/`, `components/nft/`, `components/detail-page/` | ✅  | ✅  | ✅  | ✅  |
| `/gesture/[id]`  | `(app)/gesture/[id]/`                                              | ✅  | ✅  | ✅  | ✅  |
| `/how-it-works`  | `(app)/how-it-works/components/` (incl. `StepByStep.tsx`)          | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** a Chinese-speaking first-time user can land on `app…/zh`, read how the
protocol works, watch the live cycle, and browse the gallery entirely in Chinese —
including every tooltip and countdown on those pages.

**Sprint 3 completed 2026-07-18.** Verification: type-check, lint, Jest (5,267 tests),
production build (all routes SSG'd for `/en/*` and `/zh/*`, ISR timings preserved),
English + Chinese lexicon scans, ICU compile check over all 2,540 catalog messages,
en↔zh placeholder-parity check, Sprint 1 + 2 + 3 required-key gates, and the full
Playwright e2e suite (desktop + mobile) including the new `zh-sprint3` spec and
Sprint 3 layout QA at 320 / 768 / 1440 px with screenshots.

Implementation notes / deviations:

- New namespaces `currentCycle`, `detail`, `gallery`, `gesture` (registered in
  `i18n/request.ts`); `home.json` was **rewritten** — the Sprint 0 seed keys were
  consumed by nothing and had drifted from the live UI, so live copy won (322 keys).
  Sprint 3 owns 638 required zh keys via `scripts/i18n-sprint3-required.json`
  (`yarn i18n:sprint3`, enforced in CI).
- `/how-it-works` became a per-locale content module `content/how-it-works/`
  (README §3.2) rather than a JSON catalog — its ~99 strings are structured
  section arrays. Six additional protocol numbers now interpolate from
  `protocol-facts.ts` (25%, 4%, 50%, 1,000 CST, 48-hour, 0.4%); a JSX bug that
  rendered a literal `\u2019` in CallToAction was fixed in passing.
- `meta.json` was reconciled to the live page metadata (live copy wins; the seed
  wording had drifted): `gestureDetail` added, `tokenDetail`/`gallery`/
  `currentCycleFull`/`home` aligned, and the unused `howItWorks` + short
  `currentCycle` seeds deleted (the content module owns how-it-works metadata).
  The home description interpolates the live reserve via `{reserve}`.
- Locale-aware formatting, Sprint 3 surfaces only: `convertTimestampToDateTime`,
  `formatSeconds`, and `getRelativeTime` accept a `locale` argument (default
  `'en'` is byte-identical; zh renders 1月1日 12:34 / 1天2小时30分45秒 /
  3 小时前). Only Sprint 3 call sites pass it; the site-wide sweep stays Sprint 5.
- **English copy fix forced by the lexicon gate:** the gallery card tooltips
  "Minted in game round {n}" / "Minted on {date}" contained banned vocabulary
  that had survived only because the strings predated scanner coverage; they are
  now "Imprinted in cycle {round}" / "Imprinted on {date}". No test or e2e spec
  referenced the old copy.
- `PublicGoodsImpactCard`'s legal disclaimer stays in `content/landing/` (selected
  by locale) instead of moving into `home.json`: it contains denial vocabulary
  that requires a `lexicon-allow` pragma, which JSON cannot carry.
- Intentionally still English (later sprints): transaction toast/submit feedback
  (`hooks/useGestureForm.ts`, NFT name/transfer toasts in `NFTTrait`) — Sprint 4's
  sweep; `*SeoSummary.tsx` crawler content and OG images — Sprint 7;
  `attachedNftLinks.ts` helper labels for the `/attached-nfts` consumer — Sprint 5
  (the Sprint 3 showcase translates them by link kind).
- e2e: new `zh-sprint3.spec.ts` covers all six routes incl. tooltip content; it
  uses a zh-aware tooltip locator because InfoTooltip aria-labels are translated
  ("更多信息…"), which the shared English-prefix helper cannot match.
  `zh-layout.desktop.spec.ts` gained a Sprint 3 section (home, current-cycle,
  gallery, how-it-works at three viewports with screenshots).
- **R-stage per the owner-approved Sprints 1–2 precedent** (approved with the
  Sprint 3 plan): an independent agent bilingual-accuracy pass (2 corrections:
  a terminology drift, a strengthened outage-state claim) and a Chinese-only
  blind-fluency pass (15 polish edits) both returned PASS after corrections.
  Recorded as agent review; the native-human launch gate remains Sprint 8.
- Glossary amendment proposals recorded for the §6 process (glossary unchanged):
  add 流转记录 (Ownership History) + 命名记录 (Name History), pin 星选池
  (Stellar Selection Pool), and consider 落笔留言板 (Gesture Chat).
- **Pre-existing e2e flakes surfaced during verification (not Sprint 3 regressions;
  reproduced identically on pre-sprint HEAD `d0362cc` in a clean worktree):**
  `home-gesture-chat.spec.ts` fails when the live protocol cycle is between
  cycles — the server renders the real "opening soon" state while the test
  mocks a live cycle, and the settled DOM can briefly carry both trees — and
  `a11y.spec.ts` "skip link jumps to #main" fails on Mobile Chrome. Both are
  live-cycle-state/emulation dependent and pass when the cycle is active.

## Sprint 4 — Transactions & holdings

Everything a participant does with assets. Includes the **full toast/error sweep**
(~80+ call sites: `hooks/useGestureForm.ts` ~17, `MarketingCstRewardForm.tsx` ~13,
`CstTransferForm.tsx` ~12, `useAnchorActions.ts`, `useAllocationFinalize.ts`, NFT/ETH
transfer forms). Transaction copy must be unambiguous — errors follow style guide §2.

| Route                                         | Sources                                                                          | E   | T   | R   | Q   |
| --------------------------------------------- | -------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/allocation`                                 | `(app)/allocation/`, `components/tables/AllocationTable.tsx` (5 tooltips)        | ✅  | ✅  | ✅  | ✅  |
| `/allocation/[id]`                            | `AllocationInfoPage.tsx` (11 tooltips — densest file)                            | ✅  | ✅  | ✅  | ✅  |
| `/allocation-finalized`                       | `(app)/allocation-finalized/`, `useAllocationFinalize.ts`                        | ✅  | ✅  | ✅  | ✅  |
| `/anchoring`                                  | `(app)/anchoring/`, `components/anchoring/` (15 files), `useAnchorActions.ts`    | ✅  | ✅  | ✅  | ✅  |
| `/anchor-action/[IsRwalk]/[actionId]`         | `(app)/anchor-action/`                                                           | ✅  | ✅  | ✅  | ✅  |
| `/my-allocations`                             | `(app)/my-allocations/`, `components/winnings/`                                  | ✅  | ✅  | ✅  | ✅  |
| `/my-anchors`                                 | `(app)/my-anchors/`                                                              | ✅  | ✅  | ✅  | ✅  |
| `/my-statistics`                              | `(app)/my-statistics/`, `components/user-statistics/`                            | ✅  | ✅  | ✅  | ✅  |
| `/my-tokens`                                  | `(app)/my-tokens/`, `components/tokens/`                                         | ✅  | ✅  | ✅  | ✅  |
| `/transfer-cst`                               | `(app)/transfer-cst/`, `CstTransferForm.tsx`                                     | ✅  | ✅  | ✅  | ✅  |
| `/cosmic-signature-transfer/[address]`        | `(app)/cosmic-signature-transfer/`                                               | ✅  | ✅  | ✅  | ✅  |
| `/cosmic-token-transfer/[address]`            | `(app)/cosmic-token-transfer/`                                                   | ✅  | ✅  | ✅  | ✅  |
| `/distributions-by-token/[address]/[tokenId]` | `(app)/distributions-by-token/`                                                  | ✅  | ✅  | ✅  | ✅  |
| Toast/error sweep (cross-cutting)             | `hooks/`, `components/tokens/`, `utils/errors.ts` → `toasts`/`errors` namespaces | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** every transaction flow (gesture, anchor, release, retrieve, transfer,
finalize) runs end-to-end in Chinese — every confirmation, pending, success, and failure
message. Wallet-rejection and RPC-failure paths explicitly QA'd in Chinese.

**Sprint 4 completed 2026-07-19.** Verification: lint, type-check, Jest coverage
(5,345 tests), production build (120 static pages; `/en/*` and `/zh/*` output preserved),
English + Chinese lexicon scans, Sprint 1–4 required-key gates, en↔zh placeholder/tag
parity, targeted Playwright coverage for every Sprint 4 route on desktop + mobile,
allocation/anchoring tooltips, a rendered Chinese Sonner toast, and layout QA at
320 / 768 / 1440 px with screenshots.

Implementation notes / deviations:

- Added and registered `allocation` (152 keys), `anchoring` (205), and `myPages`
  (266) catalogs. The expanded `toasts` namespace has 129 translated keys. Sprint 4
  owns 802 required zh keys across those catalogs plus its `tables` and `meta` keys
  via `scripts/i18n-sprint4-required.json` (`yarn i18n:sprint4`, enforced in CI).
- All 13 route metadata surfaces now use locale-aware `generateMetadata`; crawler-only
  `PublicDataRouteSeoSummary`, JSON-LD/OG-image completion, and the broader SEO sweep
  remain Sprint 7.
- Transaction feedback was extracted from 17 production owners. Wallet cancellation
  is consistently informational; known contract reverts use locale-independent
  descriptors; arbitrary provider diagnostics are logged but replaced by actionable
  Chinese RPC/receipt fallbacks on `/zh`. Code-4001 rejection and RPC/receipt failures
  are covered deterministically in hook/form tests. A real-wallet signing matrix stays
  in Sprint 8 because the production public-client balance read cannot be stably driven
  through the injected Playwright provider.
- Locale-aware dates/durations were wired through every Sprint 4 route dependency
  touched by the 13-route surface. The site-wide mechanical formatting sweep remains
  Sprint 5.
- `e2e/zh-sprint4.spec.ts` covers all 13 routes with deterministic API fixtures,
  localized metadata, representative tooltips, and rendered toast output.
  `zh-layout.desktop.spec.ts` covers representative allocation, anchoring, holdings,
  and transfer pages at all three release widths.
- **R-stage per the owner-approved Sprints 1–3 precedent:** an independent bilingual
  accuracy review and a Chinese-only blind-fluency review both returned PASS after
  mechanics, terminology, and transaction-copy corrections. Recorded as agent review;
  the native-human launch gate remains Sprint 8.
- Full Playwright regression run: 530 passed, 3 skipped. It exposed one stale English
  allocation-tooltip assertion, which was corrected and then passed on desktop +
  mobile with the full Sprint 4/layout subset (47/47). The only remaining full-suite
  failures were the already documented live-cycle `home-gesture-chat` race; the known
  Mobile Chrome skip-link case passed on retry. Production builds also continue to log
  the pre-existing live `stakedTokensCST` schema warning without failing.

## Sprint 5 — Statistics & data tables + locale formatting

Migrate `content/statistics-copy.ts` (~33 tooltips + labels + SEO descriptions) into
per-locale catalogs. Roll out locale-aware number/date/duration formatting site-wide
(README §4) — mechanical but wide; English output must stay byte-identical (unit tests).

| Unit                                      | Sources                                                                                       | E   | T   | R   | Q   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/statistics` (hub)                       | `(app)/statistics/`, `components/statistics/` (14 files)                                      | ✅  | ✅  | ✅  | ✅  |
| `/statistics/activity`                    | `(app)/statistics/activity/`                                                                  | ✅  | ✅  | ✅  | ✅  |
| `/statistics/anchoring`                   | `(app)/statistics/anchoring/`                                                                 | ✅  | ✅  | ✅  | ✅  |
| `/statistics/participation`               | `(app)/statistics/participation/`                                                             | ✅  | ✅  | ✅  | ✅  |
| `/statistics/performance`                 | `(app)/statistics/performance/`                                                               | ✅  | ✅  | ✅  | ✅  |
| `/statistics/tokens`                      | `(app)/statistics/tokens/`                                                                    | ✅  | ✅  | ✅  | ✅  |
| `/recipient-history`                      | `RecipientHistoryTable.tsx` (4 tooltips)                                                      | ✅  | ✅  | ✅  | ✅  |
| `/named-nfts`                             | `(app)/named-nfts/`                                                                           | ✅  | ✅  | ✅  | ✅  |
| `/attached-nfts`                          | `(app)/attached-nfts/`, `components/attachments/`                                             | ✅  | ✅  | ✅  | ✅  |
| `/used-rwlk-nfts`                         | `(app)/used-rwlk-nfts/`                                                                       | ✅  | ✅  | ✅  | ✅  |
| `/user/[address]`                         | `(app)/user/[address]/`                                                                       | ✅  | ✅  | ✅  | ✅  |
| `/user/stellar-selection-eth/[address]`   | `(app)/user/stellar-selection-eth/`                                                           | ✅  | ✅  | ✅  | ✅  |
| `/user/stellar-selection-nft/[address]`   | `(app)/user/stellar-selection-nft/`                                                           | ✅  | ✅  | ✅  | ✅  |
| `/system-event/[round]/[start]/[end]`     | `(app)/system-event/`                                                                         | ✅  | ✅  | ✅  | ✅  |
| Locale formatting rollout (cross-cutting) | `utils/format.ts`, `*SeoSummary.tsx`, chart axes/tooltips (recharts), countdowns, date-picker | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** all statistics render in Chinese with locale-correct dates (1月1日
12:34), durations (3天5小时), and chart labels; every `statisticsCopy` tooltip
translated; `content/statistics-copy.ts` retired into catalogs; formatting unit tests
green for both locales.

**Sprint 5 completed 2026-07-20.** `statistics-copy.ts` and its obsolete test were
retired after all consumers moved to catalogs. Locale-aware number, date, duration,
relative-time, countdown, chart, table, and date-picker formatting is covered in both
locales. `i18n:sprint5`, strict parity, lexicon/terminology scans, unit tests, and the
desktop/mobile `zh-sprint5` routes passed.

## Sprint 6 — FAQ, legal & trust pages

Meaning-critical surfaces (style guide §2: legal fidelity outranks elegance). FAQ data
(~65 Q&As) becomes per-locale content module; Terms/Privacy get per-locale content
components. Denial copy uses glossary §5 sanctioned terms inside allow-pragmas. A person
with legal review authority signs off the R stage for Terms/Privacy/Risk.

| Route               | Sources                                                                                      | E   | T   | R   | Q   |
| ------------------- | -------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/faq`              | `faq/data/faq-data.ts` (~65 Q&As, 6 categories) → `content/faq/`, `FAQPage.tsx`, FAQ JSON-LD | ✅  | ✅  | ✅  | ✅  |
| `/terms`            | `TermsPage.tsx` (377 lines) → `TermsContent.{en,zh}.tsx`                                     | ✅  | ✅  | ✅  | ✅  |
| `/privacy`          | `PrivacyPage.tsx` (242 lines) → per-locale content                                           | ✅  | ✅  | ✅  | ✅  |
| `/risk-disclosures` | `(app)/risk-disclosures/page.tsx`                                                            | ✅  | ✅  | ✅  | ✅  |
| `/security`         | `(app)/security/page.tsx`                                                                    | ✅  | ✅  | ✅  | ✅  |
| `/audits`           | `(app)/audits/page.tsx`                                                                      | ✅  | ✅  | ✅  | ✅  |
| `/imprint`          | `(app)/imprint/Imprint.tsx`                                                                  | ✅  | ✅  | ✅  | ✅  |
| `/contracts`        | `(app)/contracts/`, `contractAddressData.ts` display names/descriptions                      | ✅  | ✅  | ✅  | ✅  |
| `/code`             | `(app)/code/page.tsx`                                                                        | ✅  | ✅  | ✅  | ✅  |
| `/source-code`      | `(app)/source-code/page.tsx`                                                                 | ✅  | ✅  | ✅  | ✅  |

**Acceptance:** legal reviewer confirms zh Terms/Privacy/Risk match English meaning
clause-by-clause; zh lexicon scan passes with allow-pragmas only in denial copy; FAQ
JSON-LD serves Chinese Q&As on `/zh/faq`.

**Sprint 6 completed 2026-07-20 with an owner-approved review exception.** All 67 FAQ
entries preserve IDs, hashes, links, and protocol facts; FAQ JSON-LD is Chinese with
`inLanguage: zh-Hans`. Legal/trust content has structural and numeric parity tests.
`i18n:sprint6`, lexicon/terminology scans, route metadata tests, and `zh-sprint6` passed.
The owner explicitly waived external legal/native review; R records agent accuracy and
Chinese-only review and is not legal certification.

## Sprint 7 — Long tail + SEO completion

Remaining routes (contribution flows, outreach, governance changes, admin/internal/embed)
plus the site-wide SEO finish.

| Route                                   | Sources                                                    | E   | T   | R   | Q   |
| --------------------------------------- | ---------------------------------------------------------- | --- | --- | --- | --- |
| `/eth-contribution`                     | `(app)/eth-contribution/`, `components/donations/`         | ✅  | ✅  | ✅  | ✅  |
| `/eth-contribution/detail/[id]`         | `(app)/eth-contribution/detail/`                           | ✅  | ✅  | ✅  | ✅  |
| `/eth-contribution/round/[round]`       | `(app)/eth-contribution/round/`                            | ✅  | ✅  | ✅  | ✅  |
| `/public-goods-contributions-cg`        | `(app)/public-goods-contributions-cg/`                     | ✅  | ✅  | ✅  | ✅  |
| `/public-goods-contributions-voluntary` | `(app)/public-goods-contributions-voluntary/`              | ✅  | ✅  | ✅  | ✅  |
| `/public-goods-retrievals`              | `(app)/public-goods-retrievals/`                           | ✅  | ✅  | ✅  | ✅  |
| `/marketing` (Outreach Reserve)         | `(app)/marketing/`, `components/marketing/`                | ✅  | ✅  | ✅  | ✅  |
| `/marketing/[address]`                  | `(app)/marketing/[address]/`, `MarketingCstRewardForm.tsx` | ✅  | ✅  | ✅  | ✅  |
| `/coordination-changes`                 | `(app)/coordination-changes/`                              | ✅  | ✅  | ✅  | ✅  |
| `/admin`                                | `(app)/admin/page.tsx`                                     | ✅  | ✅  | ✅  | ✅  |
| `/admin/admin`                          | `(app)/admin/admin/page.tsx`                               | ✅  | ✅  | ✅  | ✅  |
| `/internal/cst-outreach-transfer`       | `(app)/internal/`                                          | ✅  | ✅  | ✅  | ✅  |
| `/embed/endurance/[round]`              | `(app)/embed/endurance/`                                   | ✅  | ✅  | ✅  | ✅  |
| `/experimental-ui` (noindex)            | `(app)/experimental-ui/`, `components/home/deck/`          | ✅  | ✅  | ☐   | ✅  |

**SEO sweep (cross-cutting):**

| Task                                                                                                                 | Done |
| -------------------------------------------------------------------------------------------------------------------- | ---- |
| All ~59 `page.tsx` metadata title/description pairs served from `meta` namespace, verified per route in both locales | ✅   |
| All 12 `opengraph-image.tsx` generators: each emitted endpoint directly returns `200 image/png` in Playwright        | ✅   |
| JSON-LD (`utils/jsonLd.ts`): translated names/descriptions, `inLanguage: 'zh-Hans'`                                  | ✅   |
| `app/sitemap.ts` / `lib/seoRoutes.ts` hreflang alternates verified for all indexable routes                          | ✅   |
| `*SeoSummary.tsx` components localized                                                                               | ✅   |
| `public/llms.txt` Chinese section                                                                                    | ✅   |

**Acceptance:** parity script reports **zero missing zh keys** repo-wide and flips to
hard-fail in CI; every route in this file shows E/T/R complete; Google Rich Results test
passes on zh FAQ + landing.

**Sprint 7 completed 2026-07-20.** All long-tail routes and SEO summaries are localized;
all 59 metadata surfaces, JSON-LD languages/URLs, and reciprocal sitemap hreflang entries
are covered. OG remains complete only while the Playwright SEO check visits representative
pages for all 12 generators and every emitted image endpoint returns a direct
`200 image/png`. OG uses a checked-in 141,448-byte Noto Sans SC subset with OFL license.
Both LLM documents include Chinese sections. Strict parity is enforced in CI at
3,302/3,302 keys. In-repo rich-result/raw-HTML tests pass; the external Google service
requires a deployed URL and remains a deployment verification.

**Post-sprint addition (recorded 2026-09-02):** `/experimental-ui` (`d96532a9`, noindex)
shipped with bilingual routing, `meta.experimentalUi.*` and `home.deck.*` catalog keys in
every locale, and a place in the Sprint 8 inventory that the site-QA suites render (Q).
No separate review pass was recorded for its copy, so R stays ☐ until one is.

## Sprint 8 — QA hardening & full-site fluency pass

The "extremely natural" gate. No new extraction — polish and verification only.

| Task                                                                                                                                | Done                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Full-site blind fluency read (style guide §8 pass 2) by native reviewer, every route on both hosts; findings filed and fixed        | Waived                          |
| Visual QA sweep at 320 / 768 / 1440 px on all zh routes: truncation, overflow, font rendering, punctuation width, CJK line breaks   | ✅                              |
| Interactive QA: discoverable tooltips on 8 deterministic routes; state-gated triggers catalog-tested; localized toasts/timers       | ✅\*                            |
| Terminology consistency grep: every glossary term, one rendering, zero drift (scripted check over `messages/zh` + `content/**/zh*`) | ✅                              |
| zh e2e suite expanded beyond smoke: key journeys (gesture flow, anchoring flow, FAQ, learn article) asserted in Chinese             | ✅                              |
| Accessibility spot-check on zh pages (axe run; translated aria-labels present)                                                      | ✅                              |
| Lighthouse/perf check on `/zh` (font loading, CLS from fallback swap)                                                               | Local measured / deploy pending |
| Final sign-off recorded here with date + reviewer names                                                                             | Waived                          |

**Acceptance / launch criteria:** all 62 routes at Q; parity CI hard-fail on; zh lexicon
scan green; native reviewer sign-off; language switcher announced/visible. 上线。

**Sprint 8 automated hardening completed 2026-07-20 with an owner-approved external
review waiver.** The canonical inventory covers all 62 routes; 186 route/viewport checks
cover 320 / 768 / 1440 px. The final re-verification completed with 685 Playwright tests
passed and 3 skipped, 386 Jest suites / 5,556 tests passed with coverage, and 120 static
pages generated by the production build. Strict parity, all Sprint 1–7 manifests, the
24-rule terminology check, lexicon, lint, type-check, SEO, accessibility,
font/CLS/performance, and diff checks passed.

For interactive QA, `✅*` means browser interaction is exhaustive only for discoverable
tooltip triggers on 8 deterministic routes. State-gated triggers are catalog-tested; the
browser run did not open all ~134 tooltip call sites. Performance has stable in-repo
font/CLS coverage and a local Lighthouse baseline; external Lighthouse and Google Rich
Results were not run against an undeployed build. Native fluency, external legal review,
named reviewer sign-off, and real-wallet/live-chain writes were explicitly waived or
excluded by the owner; no such certification is claimed.

### Production-readiness re-verification — 2026-07-20

The owner retained the native-fluency and legal-review waivers but raised the release bar
to include deployed SEO/performance checks and non-mutating wallet validation.
Localization and release-build verification is green: strict parity remains 3,302/3,302;
every Sprint 1–7 manifest, terminology, and lexicon gate passes; 386 Jest suites / 5,556
tests pass with coverage; the 120-page production build succeeds; protocol facts match
live chain values; and the full app-home client payload is 703.4 KB gzip against the
enforced 750 KB budget.

The bundle gate now reads Next 16's client-reference manifest, counts the full initial app
shell plus home-route chunks, and runs in CI. The previous 600 KB check was absent from CI
and could no longer read the current build output, so no working budget was enforced. Noto
Sans SC now uses one variable-weight set instead of duplicating every Unicode slice for
three static weights; `font-display: optional` keeps the approved system CJK fallback on
slow links instead of swapping metrics late. Two consecutive throttled local app runs held
CLS at 0.002 and scored 46 and 60 for performance; accessibility / best practices / SEO
were 98 / 96 / 92. The landing page scored 62 / 100 / 96 / 100 with zero CLS. These are
diagnostic baselines, not deployed release scores. Notification permission now waits for
a gesture submission, and its five-minute warning is localized in both catalogs. Chinese wallet
QA opens the `zh-CN` RainbowKit chooser and connects through an injected EIP-1193 test
provider without signing or submitting a transaction.

**Deployment was the remaining blocker at that verification.** At the time,
`https://cosmicsignature.com/zh` and `https://app.cosmicsignature.com/zh` both returned
HTTP 404, `https://cosmicsignature.com/sitemap.xml` returned HTTP 500, and the deployed
`llms.txt` did not contain the Chinese section from this branch. External Lighthouse,
Google Rich Results, and an actual browser-wallet check could not produce valid
Chinese-site evidence until the branch was deployed, so Sprint 8 stayed **Deploy pending**
until the check below.

### Deployment verification — 2026-09-02

The i18n branch (through `7615841d`, which also added Ukrainian) is live. Checked from
outside the deployment: `https://cosmicsignature.com/zh`, `https://cosmicsignature.com/uk`,
`https://app.cosmicsignature.com/zh`, and `https://app.cosmicsignature.com/uk` return
HTTP 200 with `<html lang="zh">` / `<html lang="uk">`; both hosts' `sitemap.xml` return
200 and carry the `zh` and `uk` hreflang alternates; the deployed `llms.txt` contains the
Chinese and Ukrainian sections; the per-locale white-paper PDFs are served. Sprint 8 moves
to **Done\***. The asterisk is unchanged in meaning: native fluency, external legal review,
and named reviewer sign-off remain owner-waived, and external Lighthouse / Google Rich
Results runs against the deployed locale pages have still not been recorded here.

The same check found one live Chinese copy defect, fixed the same day: the FAQ answer for
`how-is-participation-cst-calculated` interpolated the English `protocolFacts` gap labels
("1 hour 后为 104 CST"). `content/faq/text.zh.ts` now maps them (`ELAPSED_ZH`, as the
white-paper module already did), the FAQ and Terms modules pass `'zh-CN'` to every
`toLocaleString` call, and `content/__tests__/faq.test.ts` pins the Chinese rendering.
RainbowKit's connect-modal group headers ("Popular" / "More"), which its locale pack does
not translate, now come from `wallet.groups.*` in every catalog.

---

## Decisions log

| Date       | Decision                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-16 | Target Simplified Chinese (`zh`, zh-Hans) first; architecture N-locale ready                                                         |
| 2026-07-16 | URL strategy: locale prefix, `as-needed` — English URLs unchanged, Chinese under `/zh` on both hosts                                 |
| 2026-07-16 | Library: next-intl; messages in `messages/{en,zh}/*.json`; long-form content as per-locale TS modules                                |
| 2026-07-16 | `content/dapp.ts` seeds the en catalogs, then is deleted                                                                             |
| 2026-07-16 | Register: 你 (never 您); core coinages per glossary §2 (落笔 / 演绎周期 / 收官 / 星选 / 锚定 / 取回 / 铭刻 …)                        |
| 2026-07-17 | Sprint 1 R used owner-approved independent agent accuracy + blind-fluency passes; native launch review remains Sprint 8              |
| 2026-07-17 | Glossary freeze reconciled to after Sprint 2, matching `glossary-zh.md`; Sprint 1 required no amendments                             |
| 2026-07-18 | Sprint 2 R used owner-approved agent accuracy + Chinese-only fluency passes; human review was waived for this sprint                 |
| 2026-07-18 | `收官倒计时` approved for running clock copy; post-Sprint-2 glossary freeze is now active                                            |
| 2026-07-18 | Sprint 3 R used the same owner-approved agent review flow (approved with the Sprint 3 plan); native gate stays Sprint 8              |
| 2026-07-18 | Gallery card tooltips reworded off banned vocabulary ("Minted in game round" → "Imprinted in cycle") — lexicon gate                  |
| 2026-07-18 | Glossary §6 proposals queued: 流转记录 / 命名记录 / 星选池 / 落笔留言板 (glossary itself unchanged, frozen)                          |
| 2026-07-20 | Owner expanded the request through Sprints 5–8 and waived external native/legal review; agent review is not certification            |
| 2026-07-20 | Repo-wide zh parity reached 3,302/3,302 and now hard-fails in CI; terminology consistency is a separate CI gate                      |
| 2026-07-20 | Owner retained native/legal waivers but requires deployed SEO/performance and non-mutating wallet validation for production sign-off |
| 2026-09-02 | `/zh` and `/uk` verified live on both hosts; Sprint 8 moves from Deploy pending to Done\* (native/legal waivers unchanged)           |

## Risk register

| Risk                                                                       | Mitigation                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `[locale]` restructure breaks host routing or static rendering             | Sprint 0 acceptance = full English e2e green + build-output audit before anything else lands                                                                       |
| Translationese slips through                                               | Two-pass review (style guide §8); Sprint 8 blind read; R stage is mandatory, not optional                                                                          |
| Term drift across 2,500+ strings                                           | Single glossary + change process (§6); scripted consistency grep in Sprint 8                                                                                       |
| Banned-flavor Chinese (gambling/finance vocabulary) creates legal exposure | zh lexicon scanner from Sprint 0 (task 0.12); denial copy only via allow-pragmas; legal sign-off in Sprint 6                                                       |
| OG images render tofu for CJK                                              | Dedicated Sprint 7 task with per-image spot render                                                                                                                 |
| en/zh catalogs diverge over time                                           | Parity script: report during rollout, hard-fail from Sprint 7; new-route rule at top of this file                                                                  |
| Untranslated strings hide behind fallback                                  | Parity report lists every fallback; Q stage requires visual page check                                                                                             |
| Terms governing-law/jurisdiction language remains generic                  | Chain/custody copy is reconciled in both locales; counsel must resolve jurisdiction before any future certified release                                            |
| External native/legal review was waived for this rollout                   | Waiver is explicit in Sprint 6/8 notes; no reviewer names or legal/native certification are claimed                                                                |
| Third-party material is accidentally swept into the project CC0 dedication | Root `LICENSE` scopes CC0 to project-owned material; `THIRD_PARTY_NOTICES.md` preserves dependency/asset terms and links the bundled Noto subset to its OFL notice |
