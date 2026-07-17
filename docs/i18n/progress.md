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

| Sprint | Theme                                                                      | Units                        | Status      |
| ------ | -------------------------------------------------------------------------- | ---------------------------- | ----------- |
| 0      | Foundations (infra, no visible translation)                                | 14 tasks                     | Not started |
| 1      | Global chrome (nav, footer, wallet, shared UI)                             | 12 namespaces + 2 routes     | Not started |
| 2      | Landing site + Learn hub                                                   | 4 routes (incl. 11 articles) | Not started |
| 3      | Core dApp (home, cycle, gallery, detail, how-it-works)                     | 6 routes                     | Not started |
| 4      | Transactions & holdings (allocations, anchoring, my-\*, transfers, toasts) | 13 routes + toasts           | Not started |
| 5      | Statistics & data tables + locale formatting                               | 14 routes + formats          | Not started |
| 6      | FAQ, legal & trust pages                                                   | 10 routes                    | Not started |
| 7      | Long tail + SEO completion                                                 | 13 routes + SEO sweep        | Not started |
| 8      | QA hardening & full-site fluency pass                                      | site-wide                    | Not started |

Route accounting: 2 + 4 + 6 + 13 + 14 + 10 + 13 = **62 routes** = every `page.tsx` in
`app/` as of 2026-07-16. New routes added to the app **must** be added here (add a row in
the matching sprint section, or Sprint 7 if unclear).

---

## Sprint 0 — Foundations

Goal: ship the i18n machinery with **zero visible change** to the English site.
Chinese exists at `/zh` (rendering English fallback text) but is not yet linked in the UI.

| #    | Task                                                                                                                                                                                         | Done |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1  | Install `next-intl`; add `i18n/routing.ts` (`locales: ['en','zh']`, `defaultLocale: 'en'`, `localePrefix: 'as-needed'`), `i18n/request.ts` with en-fallback deep merge, `i18n/navigation.ts` | ☐    |
| 0.2  | Wrap `next.config.ts` with `createNextIntlPlugin()` (compose with Sentry + analyzer)                                                                                                         | ☐    |
| 0.3  | Move `app/(app)` and `app/(landing)` under `app/[locale]/`; `api/` stays outside; fix relative imports                                                                                       | ☐    |
| 0.4  | Locale layouts: validate `hasLocale`, `setRequestLocale`, `generateStaticParams`, `NextIntlClientProvider`; `RootDocument` takes `locale` and sets `<html lang>`                             | ☐    |
| 0.5  | Compose `proxy.ts` with next-intl middleware; host checks run on locale-stripped path; `/zh` → `/zh/landing-site` rewrite; redirects preserve prefix (README §2.3)                           | ☐    |
| 0.6  | Codemod `next/link` + `next/navigation` imports to `i18n/navigation.ts` wrappers; add `localeHref()` for cross-host absolute URLs                                                            | ☐    |
| 0.7  | Seed `messages/en/*.json` namespaces from `content/dapp.ts`, then delete `content/dapp.ts`; create empty-object `messages/zh/*.json`                                                         | ☐    |
| 0.8  | Language switcher component (English / 中文) in app header + mobile drawer, landing header, both footers; `NEXT_LOCALE` cookie persistence                                                   | ☐    |
| 0.9  | Fonts: add Noto Sans SC per README §5, `html[lang="zh"]` heading overrides                                                                                                                   | ☐    |
| 0.10 | SEO plumbing: `createMetadata` emits hreflang alternates + `og:locale`; sitemap alternates; fix hardcoded `en_US`                                                                            | ☐    |
| 0.11 | `scripts/i18n-parity.ts` + CI report job                                                                                                                                                     | ☐    |
| 0.12 | zh banned-term list wired into lexicon scanner for `messages/zh/**` and `content/**/zh*` (from glossary §5)                                                                                  | ☐    |
| 0.13 | E2E: zh smoke spec (`/zh` home/gallery/learn/faq render, switcher round-trip, cookie, host redirects with prefix); extend host-routing specs                                                 | ☐    |
| 0.14 | Docs: update README.md §9 commands if they changed during implementation                                                                                                                     | ☐    |

**Acceptance:** English site is behaviorally identical at every existing URL (full e2e
suite green, no URL changes, static rendering preserved — verify build output). `/zh/...`
renders every route with English fallback. Switcher works both directions on both hosts.
Parity report runs in CI.

## Sprint 1 — Global chrome

Every page shares this layer; translating it first makes every subsequent `/zh` page
look mostly-translated instead of mostly-English.

**Shared namespaces** (`messages/*/…`):

| Namespace  | Contents (key sources)                                                                          | E   | T   | R   | Q   |
| ---------- | ----------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `common`   | generic buttons/status/empty/loading (spread across `components/`)                              | ☐   | ☐   | ☐   | ☐   |
| `nav`      | `config/nav.tsx` titles + descriptions, drawer, ecosystem (`config/ecosystem.ts`)               | ☐   | ☐   | ☐   | ☐   |
| `footer`   | `components/layout/Footer.tsx` link groups + tagline                                            | ☐   | ☐   | ☐   | ☐   |
| `wallet`   | connect/disconnect, RainbowKit locale (`zh-CN` built-in), network prompts, balances             | ☐   | ☐   | ☐   | ☐   |
| `tables`   | shared headers/pagination/sorting/empty in `components/tables/` (26 files)                      | ☐   | ☐   | ☐   | ☐   |
| `tooltips` | shared/global tooltips (`components/ui/info-tooltip.tsx` call sites in shared components)       | ☐   | ☐   | ☐   | ☐   |
| `toasts`   | toast infrastructure + `utils/errors.ts` shared messages (page-specific texts land in Sprint 4) | ☐   | ☐   | ☐   | ☐   |
| `errors`   | error boundaries, `error-state` components, API-failure copy                                    | ☐   | ☐   | ☐   | ☐   |
| `forms`    | shared validation/input copy, date-picker labels (`components/ui/date-picker.tsx`)              | ☐   | ☐   | ☐   | ☐   |
| `formats`  | duration/countdown unit labels (full locale formatting lands in Sprint 5)                       | ☐   | ☐   | ☐   | ☐   |
| `meta`     | shared metadata fragments (site name pattern, OG defaults)                                      | ☐   | ☐   | ☐   | ☐   |
| `search`   | header/gallery search placeholder + results copy                                                | ☐   | ☐   | ☐   | ☐   |

**Routes:**

| Route                  | Sources                                                | E   | T   | R   | Q   |
| ---------------------- | ------------------------------------------------------ | --- | --- | --- | --- |
| `/[...notFound]` (404) | `(app)/[...notFound]/`                                 | ☐   | ☐   | ☐   | ☐   |
| `/site-map`            | `(app)/site-map/SiteMapPage.tsx` (large label catalog) | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** on any `/zh` page, header, footer, wallet flow, tables chrome, and error
states are fully Chinese. Parity enforcement flips on for these namespaces. Glossary
amendments from first contact with real UI are merged (glossary §6) — after this sprint
the glossary is frozen except through the change process.

## Sprint 2 — Landing site + Learn hub

The public face; highest transcreation bar (style guide §2 landing register). Convert
`content/landing.ts` and `content/learn.ts` to per-locale modules (README §3.2).

| Route           | Sources                                                                                                                                        | E   | T   | R   | Q   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/` (landing)   | `(landing)/landing-site/`, `content/landing/` (hero, cycle, art, tracks, anchoring, public goods, council, verifiability, landing FAQ, footer) | ☐   | ☐   | ☐   | ☐   |
| `/about`        | `(landing)/about/page.tsx`                                                                                                                     | ☐   | ☐   | ☐   | ☐   |
| `/learn` (hub)  | `(landing)/learn/`, `content/learn/` hub copy                                                                                                  | ☐   | ☐   | ☐   | ☐   |
| `/learn/[slug]` | `content/learn/` articles — tracked per article below                                                                                          | ☐   | ☐   | ☐   | ☐   |

Per-article tracking (all four stages apply to each):

| Article slug                              | E   | T   | R   | Q   |
| ----------------------------------------- | --- | --- | --- | --- |
| `what-is-cosmic-signature`                | ☐   | ☐   | ☐   | ☐   |
| `how-the-performance-cycle-works`         | ☐   | ☐   | ☐   | ☐   |
| `how-gestures-work`                       | ☐   | ☐   | ☐   | ☐   |
| `three-body-nft-art`                      | ☐   | ☐   | ☐   | ☐   |
| `cosmic-signature-on-arbitrum`            | ☐   | ☐   | ☐   | ☐   |
| `contracts-security-verification`         | ☐   | ☐   | ☐   | ☐   |
| `cst-token-and-cosmic-council`            | ☐   | ☐   | ☐   | ☐   |
| `anchoring-nfts`                          | ☐   | ☐   | ☐   | ☐   |
| `protocol-guild-public-goods`             | ☐   | ☐   | ☐   | ☐   |
| `collecting-and-trading-cosmic-signature` | ☐   | ☐   | ☐   | ☐   |
| `not-a-lottery-not-an-investment`         | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** `cosmicsignature.com/zh` is 100% Chinese including metadata and landing
FAQ JSON-LD; denial copy (landing FAQ + `not-a-lottery-not-an-investment`) reviewed
against glossary §5 with allow-pragmas in place; fluency pass done by a reviewer reading
only Chinese.

## Sprint 3 — Core dApp

The main user journey: land on the app, watch the cycle, browse art, understand the
mechanics. Heavy inline-JSX extraction (~99 strings in how-it-works alone;
`components/home/` 11 files incl. `RoundInfoSection.tsx` with 7 tooltips;
`GalleryNFTCard.tsx` with 10).

| Route            | Sources                                                            | E   | T   | R   | Q   |
| ---------------- | ------------------------------------------------------------------ | --- | --- | --- | --- |
| `/` (app home)   | `(app)/page.tsx`, `components/home/`                               | ☐   | ☐   | ☐   | ☐   |
| `/current-cycle` | `(app)/current-cycle/`                                             | ☐   | ☐   | ☐   | ☐   |
| `/gallery`       | `(app)/gallery/`, `GalleryNFTCard.tsx`                             | ☐   | ☐   | ☐   | ☐   |
| `/detail/[id]`   | `(app)/detail/[id]/`, `components/nft/`, `components/detail-page/` | ☐   | ☐   | ☐   | ☐   |
| `/gesture/[id]`  | `(app)/gesture/[id]/`                                              | ☐   | ☐   | ☐   | ☐   |
| `/how-it-works`  | `(app)/how-it-works/components/` (incl. `StepByStep.tsx`)          | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** a Chinese-speaking first-time user can land on `app…/zh`, read how the
protocol works, watch the live cycle, and browse the gallery entirely in Chinese —
including every tooltip and countdown on those pages.

## Sprint 4 — Transactions & holdings

Everything a participant does with assets. Includes the **full toast/error sweep**
(~80+ call sites: `hooks/useGestureForm.ts` ~17, `MarketingCstRewardForm.tsx` ~13,
`CstTransferForm.tsx` ~12, `useAnchorActions.ts`, `useAllocationFinalize.ts`, NFT/ETH
transfer forms). Transaction copy must be unambiguous — errors follow style guide §2.

| Route                                         | Sources                                                                          | E   | T   | R   | Q   |
| --------------------------------------------- | -------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/allocation`                                 | `(app)/allocation/`, `components/tables/AllocationTable.tsx` (5 tooltips)        | ☐   | ☐   | ☐   | ☐   |
| `/allocation/[id]`                            | `AllocationInfoPage.tsx` (11 tooltips — densest file)                            | ☐   | ☐   | ☐   | ☐   |
| `/allocation-finalized`                       | `(app)/allocation-finalized/`, `useAllocationFinalize.ts`                        | ☐   | ☐   | ☐   | ☐   |
| `/anchoring`                                  | `(app)/anchoring/`, `components/anchoring/` (15 files), `useAnchorActions.ts`    | ☐   | ☐   | ☐   | ☐   |
| `/anchor-action/[IsRwalk]/[actionId]`         | `(app)/anchor-action/`                                                           | ☐   | ☐   | ☐   | ☐   |
| `/my-allocations`                             | `(app)/my-allocations/`, `components/winnings/`                                  | ☐   | ☐   | ☐   | ☐   |
| `/my-anchors`                                 | `(app)/my-anchors/`                                                              | ☐   | ☐   | ☐   | ☐   |
| `/my-statistics`                              | `(app)/my-statistics/`, `components/user-statistics/`                            | ☐   | ☐   | ☐   | ☐   |
| `/my-tokens`                                  | `(app)/my-tokens/`, `components/tokens/`                                         | ☐   | ☐   | ☐   | ☐   |
| `/transfer-cst`                               | `(app)/transfer-cst/`, `CstTransferForm.tsx`                                     | ☐   | ☐   | ☐   | ☐   |
| `/cosmic-signature-transfer/[address]`        | `(app)/cosmic-signature-transfer/`                                               | ☐   | ☐   | ☐   | ☐   |
| `/cosmic-token-transfer/[address]`            | `(app)/cosmic-token-transfer/`                                                   | ☐   | ☐   | ☐   | ☐   |
| `/distributions-by-token/[address]/[tokenId]` | `(app)/distributions-by-token/`                                                  | ☐   | ☐   | ☐   | ☐   |
| Toast/error sweep (cross-cutting)             | `hooks/`, `components/tokens/`, `utils/errors.ts` → `toasts`/`errors` namespaces | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** every transaction flow (gesture, anchor, release, retrieve, transfer,
finalize) runs end-to-end in Chinese — every confirmation, pending, success, and failure
message. Wallet-rejection and RPC-failure paths explicitly QA'd in Chinese.

## Sprint 5 — Statistics & data tables + locale formatting

Migrate `content/statistics-copy.ts` (~33 tooltips + labels + SEO descriptions) into
per-locale catalogs. Roll out locale-aware number/date/duration formatting site-wide
(README §4) — mechanical but wide; English output must stay byte-identical (unit tests).

| Unit                                      | Sources                                                                                       | E   | T   | R   | Q   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/statistics` (hub)                       | `(app)/statistics/`, `components/statistics/` (14 files)                                      | ☐   | ☐   | ☐   | ☐   |
| `/statistics/activity`                    | `(app)/statistics/activity/`                                                                  | ☐   | ☐   | ☐   | ☐   |
| `/statistics/anchoring`                   | `(app)/statistics/anchoring/`                                                                 | ☐   | ☐   | ☐   | ☐   |
| `/statistics/participation`               | `(app)/statistics/participation/`                                                             | ☐   | ☐   | ☐   | ☐   |
| `/statistics/performance`                 | `(app)/statistics/performance/`                                                               | ☐   | ☐   | ☐   | ☐   |
| `/statistics/tokens`                      | `(app)/statistics/tokens/`                                                                    | ☐   | ☐   | ☐   | ☐   |
| `/recipient-history`                      | `RecipientHistoryTable.tsx` (4 tooltips)                                                      | ☐   | ☐   | ☐   | ☐   |
| `/named-nfts`                             | `(app)/named-nfts/`                                                                           | ☐   | ☐   | ☐   | ☐   |
| `/attached-nfts`                          | `(app)/attached-nfts/`, `components/attachments/`                                             | ☐   | ☐   | ☐   | ☐   |
| `/used-rwlk-nfts`                         | `(app)/used-rwlk-nfts/`                                                                       | ☐   | ☐   | ☐   | ☐   |
| `/user/[address]`                         | `(app)/user/[address]/`                                                                       | ☐   | ☐   | ☐   | ☐   |
| `/user/stellar-selection-eth/[address]`   | `(app)/user/stellar-selection-eth/`                                                           | ☐   | ☐   | ☐   | ☐   |
| `/user/stellar-selection-nft/[address]`   | `(app)/user/stellar-selection-nft/`                                                           | ☐   | ☐   | ☐   | ☐   |
| `/system-event/[round]/[start]/[end]`     | `(app)/system-event/`                                                                         | ☐   | ☐   | ☐   | ☐   |
| Locale formatting rollout (cross-cutting) | `utils/format.ts`, `*SeoSummary.tsx`, chart axes/tooltips (recharts), countdowns, date-picker | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** all statistics render in Chinese with locale-correct dates (1月1日
12:34), durations (3天5小时), and chart labels; every `statisticsCopy` tooltip
translated; `content/statistics-copy.ts` retired into catalogs; formatting unit tests
green for both locales.

## Sprint 6 — FAQ, legal & trust pages

Meaning-critical surfaces (style guide §2: legal fidelity outranks elegance). FAQ data
(~65 Q&As) becomes per-locale content module; Terms/Privacy get per-locale content
components. Denial copy uses glossary §5 sanctioned terms inside allow-pragmas. A person
with legal review authority signs off the R stage for Terms/Privacy/Risk.

| Route               | Sources                                                                                      | E   | T   | R   | Q   |
| ------------------- | -------------------------------------------------------------------------------------------- | --- | --- | --- | --- |
| `/faq`              | `faq/data/faq-data.ts` (~65 Q&As, 6 categories) → `content/faq/`, `FAQPage.tsx`, FAQ JSON-LD | ☐   | ☐   | ☐   | ☐   |
| `/terms`            | `TermsPage.tsx` (377 lines) → `TermsContent.{en,zh}.tsx`                                     | ☐   | ☐   | ☐   | ☐   |
| `/privacy`          | `PrivacyPage.tsx` (242 lines) → per-locale content                                           | ☐   | ☐   | ☐   | ☐   |
| `/risk-disclosures` | `(app)/risk-disclosures/page.tsx`                                                            | ☐   | ☐   | ☐   | ☐   |
| `/security`         | `(app)/security/page.tsx`                                                                    | ☐   | ☐   | ☐   | ☐   |
| `/audits`           | `(app)/audits/page.tsx`                                                                      | ☐   | ☐   | ☐   | ☐   |
| `/imprint`          | `(app)/imprint/Imprint.tsx`                                                                  | ☐   | ☐   | ☐   | ☐   |
| `/contracts`        | `(app)/contracts/`, `contractAddressData.ts` display names/descriptions                      | ☐   | ☐   | ☐   | ☐   |
| `/code`             | `(app)/code/page.tsx`                                                                        | ☐   | ☐   | ☐   | ☐   |
| `/source-code`      | `(app)/source-code/page.tsx`                                                                 | ☐   | ☐   | ☐   | ☐   |

**Acceptance:** legal reviewer confirms zh Terms/Privacy/Risk match English meaning
clause-by-clause; zh lexicon scan passes with allow-pragmas only in denial copy; FAQ
JSON-LD serves Chinese Q&As on `/zh/faq`.

## Sprint 7 — Long tail + SEO completion

Remaining routes (contribution flows, outreach, governance changes, admin/internal/embed)
plus the site-wide SEO finish.

| Route                                   | Sources                                                    | E   | T   | R   | Q   |
| --------------------------------------- | ---------------------------------------------------------- | --- | --- | --- | --- |
| `/eth-contribution`                     | `(app)/eth-contribution/`, `components/donations/`         | ☐   | ☐   | ☐   | ☐   |
| `/eth-contribution/detail/[id]`         | `(app)/eth-contribution/detail/`                           | ☐   | ☐   | ☐   | ☐   |
| `/eth-contribution/round/[round]`       | `(app)/eth-contribution/round/`                            | ☐   | ☐   | ☐   | ☐   |
| `/public-goods-contributions-cg`        | `(app)/public-goods-contributions-cg/`                     | ☐   | ☐   | ☐   | ☐   |
| `/public-goods-contributions-voluntary` | `(app)/public-goods-contributions-voluntary/`              | ☐   | ☐   | ☐   | ☐   |
| `/public-goods-retrievals`              | `(app)/public-goods-retrievals/`                           | ☐   | ☐   | ☐   | ☐   |
| `/marketing` (Outreach Reserve)         | `(app)/marketing/`, `components/marketing/`                | ☐   | ☐   | ☐   | ☐   |
| `/marketing/[address]`                  | `(app)/marketing/[address]/`, `MarketingCstRewardForm.tsx` | ☐   | ☐   | ☐   | ☐   |
| `/coordination-changes`                 | `(app)/coordination-changes/`                              | ☐   | ☐   | ☐   | ☐   |
| `/admin`                                | `(app)/admin/page.tsx`                                     | ☐   | ☐   | ☐   | ☐   |
| `/admin/admin`                          | `(app)/admin/admin/page.tsx`                               | ☐   | ☐   | ☐   | ☐   |
| `/internal/cst-outreach-transfer`       | `(app)/internal/`                                          | ☐   | ☐   | ☐   | ☐   |
| `/embed/endurance/[round]`              | `(app)/embed/endurance/`                                   | ☐   | ☐   | ☐   | ☐   |

**SEO sweep (cross-cutting):**

| Task                                                                                                                 | Done |
| -------------------------------------------------------------------------------------------------------------------- | ---- |
| All ~59 `page.tsx` metadata title/description pairs served from `meta` namespace, verified per route in both locales | ☐    |
| `opengraph-image.tsx` files render CJK (embedded Noto Sans SC subset) — spot-render every OG image on `/zh`          | ☐    |
| JSON-LD (`utils/jsonLd.ts`): translated names/descriptions, `inLanguage: 'zh-Hans'`                                  | ☐    |
| `app/sitemap.ts` / `lib/seoRoutes.ts` hreflang alternates verified for all indexable routes                          | ☐    |
| `*SeoSummary.tsx` components localized                                                                               | ☐    |
| `public/llms.txt` Chinese section                                                                                    | ☐    |

**Acceptance:** parity script reports **zero missing zh keys** repo-wide and flips to
hard-fail in CI; every route in this file shows E/T/R complete; Google Rich Results test
passes on zh FAQ + landing.

## Sprint 8 — QA hardening & full-site fluency pass

The "extremely natural" gate. No new extraction — polish and verification only.

| Task                                                                                                                                | Done |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Full-site blind fluency read (style guide §8 pass 2) by native reviewer, every route on both hosts; findings filed and fixed        | ☐    |
| Visual QA sweep at 320 / 768 / 1440 px on all zh routes: truncation, overflow, font rendering, punctuation width, CJK line breaks   | ☐    |
| Interactive QA: all ~134 tooltips open in Chinese; toasts fire in Chinese on success/failure paths; countdowns/timers localized     | ☐    |
| Terminology consistency grep: every glossary term, one rendering, zero drift (scripted check over `messages/zh` + `content/**/zh*`) | ☐    |
| zh e2e suite expanded beyond smoke: key journeys (gesture flow, anchoring flow, FAQ, learn article) asserted in Chinese             | ☐    |
| Accessibility spot-check on zh pages (axe run; translated aria-labels present)                                                      | ☐    |
| Lighthouse/perf check on `/zh` (font loading, CLS from fallback swap)                                                               | ☐    |
| Final sign-off recorded here with date + reviewer names                                                                             | ☐    |

**Acceptance / launch criteria:** all 62 routes at Q; parity CI hard-fail on; zh lexicon
scan green; native reviewer sign-off; language switcher announced/visible. 上线。

---

## Decisions log

| Date       | Decision                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-07-16 | Target Simplified Chinese (`zh`, zh-Hans) first; architecture N-locale ready                                  |
| 2026-07-16 | URL strategy: locale prefix, `as-needed` — English URLs unchanged, Chinese under `/zh` on both hosts          |
| 2026-07-16 | Library: next-intl; messages in `messages/{en,zh}/*.json`; long-form content as per-locale TS modules         |
| 2026-07-16 | `content/dapp.ts` seeds the en catalogs, then is deleted                                                      |
| 2026-07-16 | Register: 你 (never 您); core coinages per glossary §2 (落笔 / 演绎周期 / 收官 / 星选 / 锚定 / 取回 / 铭刻 …) |

## Risk register

| Risk                                                                       | Mitigation                                                                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `[locale]` restructure breaks host routing or static rendering             | Sprint 0 acceptance = full English e2e green + build-output audit before anything else lands                 |
| Translationese slips through                                               | Two-pass review (style guide §8); Sprint 8 blind read; R stage is mandatory, not optional                    |
| Term drift across 2,500+ strings                                           | Single glossary + change process (§6); scripted consistency grep in Sprint 8                                 |
| Banned-flavor Chinese (gambling/finance vocabulary) creates legal exposure | zh lexicon scanner from Sprint 0 (task 0.12); denial copy only via allow-pragmas; legal sign-off in Sprint 6 |
| OG images render tofu for CJK                                              | Dedicated Sprint 7 task with per-image spot render                                                           |
| en/zh catalogs diverge over time                                           | Parity script: report during rollout, hard-fail from Sprint 7; new-route rule at top of this file            |
| Untranslated strings hide behind fallback                                  | Parity report lists every fallback; Q stage requires visual page check                                       |
