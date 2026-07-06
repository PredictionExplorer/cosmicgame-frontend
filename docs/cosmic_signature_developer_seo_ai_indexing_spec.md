# Cosmic Signature — SEO & AI Indexing: Status & Remaining Work

**Last verified:** 2026-07-06 (code implementation + test audit)
**Scope:** Site-side changes only — code and hosting/CDN config. Excludes off-site promotion, Search Console / Bing Webmaster submission, social posting, paid links, and PR.

This document started life as an implementation spec. **Most of it is now built and live.** It has been rewritten as a _living status doc_ so anyone improving SEO further can see, at a glance: what is done, what was proven by testing, and what is still open.

## How to read this

- **✅ Done** — implemented and (where possible) verified live.
- **🟡 Partial** — implemented but with a gap worth closing.
- **❌ Open** — not done / needs work.
- File references like [`utils/seo.ts`](../utils/seo.ts) point to the implementation.

## 2026-07-06 implementation update

The header-redesign follow-up and the static-rendering migration landed:

- **P16 resolved — static rendering + ISR.** The root layout's `headers()` host branch was removed. The app now uses two root layouts in route groups — [`app/(app)/layout.tsx`](<../app/(app)/layout.tsx>) (dApp + Providers) and [`app/(landing)/layout.tsx`](<../app/(landing)/layout.tsx>) (LandingShell) — sharing [`app/root-document.tsx`](../app/root-document.tsx) and [`app/root-metadata.ts`](../app/root-metadata.ts). Host separation is enforced entirely by [`proxy.ts`](../proxy.ts). Result (verified in the build route table and by e2e cache-control assertions in [`e2e/seo-raw-html.spec.ts`](../e2e/seo-raw-html.spec.ts)): content pages (`/faq`, `/how-it-works`, `/terms`, `/about`, `/learn/*`, …) are statically prerendered; data pages (`/statistics*`, `/gallery`, `/allocation`, `/anchoring`, …) use ISR with `revalidate = 300`; dynamic-param data routes also revalidate every 300s. Server SEO summaries now resolve API failures to fallbacks so ISR builds cannot crash on a temporarily unreachable API.
- **Global 404 with route groups:** a lowest-priority catch-all ([`app/(app)/[...notFound]/page.tsx`](<../app/(app)/[...notFound]/page.tsx>)) routes unknown URLs into the branded `not-found.tsx`, which is now a server component so the 404 HTML (copy + recovery links) is crawler-visible. Note: unknown paths on the landing host also render the (app) 404 chrome — acceptable for 404s (correct status + content) and the only cross-group compromise.
- **Ecosystem entities (Axiom Zero, Chaos Zero):** `llms.txt` / `llms-full.txt` gained an Ecosystem section (tested in [`public/__tests__/llms.test.ts`](../public/__tests__/llms.test.ts)); the FAQ gained marketplace/prediction-market Q&As; a new learn article (`collecting-and-trading-cosmic-signature`) covers trading venues; the app footer, `/site-map`, and landing footer link all three destinations.
- **Internal-link / crawl-path guarantees:** the header's dropdown panels are client-only, so [`app/(app)/__tests__/crawl-paths.test.tsx`](<../app/(app)/__tests__/crawl-paths.test.tsx>) enforces that every header-nav route and every XML-sitemap route keeps a server-rendered anchor in the footer or `/site-map` (which now mirrors the full sitemap, including statistics subpages and data routes).
- **Structured data:** `WebPage` + `BreadcrumbList` added to `/how-it-works`, `/contracts`, `/code`, `/site-map`; a new `CollectionPage` builder covers `/gallery`. Per-page JSON-LD `@type`s, title/description uniqueness, sitemap URL health (every `<loc>` returns 200 and is not noindex), and `llms.txt` availability are asserted in the raw-HTML e2e suite.

## 2026-05-31 implementation update

The remaining repository-implementable SEO backlog has been substantially implemented:

- Added a shared route policy in [`lib/seoRoutes.ts`](../lib/seoRoutes.ts) and refactored [`app/sitemap.ts`](../app/sitemap.ts) around it.
- Removed wallet-personal URLs from the XML sitemap and marked [`/recipient-history`](../app/recipient-history/page.tsx) `noindex,follow`.
- Added server-rendered crawler summaries to the public app data routes via [`app/PublicDataRouteSeoSummary.tsx`](../app/PublicDataRouteSeoSummary.tsx).
- Fixed structured-data accuracy in [`utils/jsonLd.tsx`](../utils/jsonLd.tsx): no false zero-price Offers, GitHub in `Organization.sameAs`, and no WebApplication schema on the landing host.
- Enriched custom Open Graph image metadata in [`utils/seo.ts`](../utils/seo.ts) with width, height, and alt text.
- Softened unsupported audit claims, fixed the broken IPFS gateway URL, added GitHub/source links, added homepage/FAQ biology disambiguation, and expanded [`content/learn.ts`](../content/learn.ts).
- Added SEO policy, structured-data, IndexNow, sitemap, raw-HTML, and SSR summary tests.

Still external / not fully provable from repo code: Vercel `www` domain status, WAF/CDN crawler logs, Search Console/Bing submission, and the larger route-group migration needed to remove root-layout `headers()` dynamic rendering.

---

## 1. Architecture (read this first)

One Next.js 16 app serves **two hosts**, split by [`proxy.ts`](../proxy.ts) + [`lib/hostRouting.ts`](../lib/hostRouting.ts):

| Host                            | Serves                                                                                                                                                           | Everything else                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `cosmicsignature.com` (landing) | `/`, `/about`, `/learn/*`                                                                                                                                        | 308-redirects to the app host                 |
| `app.cosmicsignature.com` (app) | dApp + `/faq`, `/how-it-works`, `/statistics`, `/contracts`, `/code`, `/gallery`, `/security`, `/audits`, `/terms`, `/privacy`, `/risk-disclosures`, `/site-map` | `/about` & `/learn/*` 308-redirect to landing |

Each host has its **own** [`robots.ts`](../app/robots.ts) and [`sitemap.ts`](../app/sitemap.ts), selected by `Host` header. Page metadata is built by `createMetadata()` in [`utils/seo.ts`](../utils/seo.ts); JSON-LD helpers live in [`utils/jsonLd.tsx`](../utils/jsonLd.tsx).

> **One consequence to know:** the root layout reads `headers()` for host detection ([`app/layout.tsx`](../app/layout.tsx)), which forces **every route to render dynamically**. See the Performance note in [§4](#performance-and-core-web-vitals).

---

## 2. Crawlability — tested live on 2026-05-31

All checks below were run with `curl` against the **raw HTML** (no JavaScript executed), which is what non-rendering AI/search crawlers see.

### Page rendering (all 200 OK, all server-rendered)

| URL                                                  |  Bytes | `<title>` set | Self-canonical | Single `<h1>`                                           |                `Loading`-only?                | JSON-LD                                                             |
| ---------------------------------------------------- | -----: | :-----------: | :------------: | ------------------------------------------------------- | :-------------------------------------------: | ------------------------------------------------------------------- |
| `cosmicsignature.com/`                               | 137 KB |      ✅       |       ✅       | `Cosmic Signature: Procedural On-Chain Art on Arbitrum` |                      No                       | Organization, WebSite, WebApplication, FAQPage, CreativeWork, Offer |
| `app.cosmicsignature.com/`                           |  52 KB |      ✅       |       ✅       | `Cosmic Signature App`                                  |                      No                       | Organization, WebSite, WebApplication                               |
| `app…/statistics`                                    |  64 KB |      ✅       |       ✅       | `Cosmic Signature Protocol Statistics`                  | No (2 stray "Loading" in client widgets only) | WebPage, Dataset                                                    |
| `app…/faq`                                           | 308 KB |      ✅       |       ✅       | `Cosmic Signature FAQ`                                  |                      No                       | FAQPage, Question, Answer, BreadcrumbList                           |
| `app…/how-it-works`                                  | 103 KB |      ✅       |       ✅       | `How Cosmic Signature Works`                            |                      No                       | —                                                                   |
| `cosmicsignature.com/about`                          |  36 KB |      ✅       |       ✅       | `About Cosmic Signature`                                |                      No                       | AboutPage, BreadcrumbList, Organization                             |
| `cosmicsignature.com/learn`                          |  43 KB |      ✅       |       ✅       | `Learn Cosmic Signature`                                |                      No                       | BreadcrumbList                                                      |
| `cosmicsignature.com/learn/what-is-cosmic-signature` |  49 KB |      ✅       |       ✅       | `What Is Cosmic Signature?`                             |                      No                       | Article, BreadcrumbList                                             |
| `app…/contracts`                                     |  79 KB |      ✅       |       ✅       | `Cosmic Signature Contracts`                            |                      No                       | —                                                                   |
| `app…/gallery`                                       |  78 KB |      ✅       |       ✅       | `Cosmic Signature Gallery`                              |                      No                       | —                                                                   |

**Result:** No page is an empty app shell or a "Loading…" spinner. Every page returns a unique title, an absolute self-referencing canonical, a meta description, `index, follow`, and exactly one `<h1>`. Titles/H1s match the planned metadata map verbatim.

### robots, sitemaps, redirects, status codes

| Check                                               | Result                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `robots.txt` (both hosts)                           | ✅ Valid; correct per-host `Sitemap:` + `Host:`; AI/search bots enumerated and allowed; sensible `Disallow` per host                 |
| `sitemap.xml` — landing                             | ✅ 13 URLs: `/`, `/about`, `/learn` + all 10 `/learn/*` articles                                                                     |
| `sitemap.xml` — app                                 | ✅ App routes come from [`lib/seoRoutes.ts`](../lib/seoRoutes.ts); wallet-personal routes such as `/recipient-history` are excluded  |
| `llms.txt` (both hosts)                             | ✅ 200; includes the biology disambiguation line; `llms-full.txt` also present                                                       |
| `http://…` → `https://…`                            | ✅ 308                                                                                                                               |
| `https://www.cosmicsignature.com/` → apex           | 🟡 **307 (temporary)** — should be 301/308 permanent                                                                                 |
| cross-host paths (e.g. landing `/faq` → app `/faq`) | ✅ 308                                                                                                                               |
| unknown route (e.g. `/this-does-not-exist`)         | ✅ Real **404** + "Page Not Found" H1 (no soft-404)                                                                                  |
| `X-Robots-Tag` on public pages                      | ✅ None present (good)                                                                                                               |
| `Cache-Control` on app `/` and `/statistics`        | 🟡 `private, no-cache, no-store` — pages render per-request, not CDN-cached (see [§4 Performance](#performance-and-core-web-vitals)) |

> **Still to confirm off-box:** WAF/CDN behavior toward real crawler user-agents can only be verified from Vercel/CDN logs. See [§6](#6-off-box-verification-not-doable-from-the-repo).

---

## 3. Status by area (the original priorities, condensed)

| #   | Area                              | Status | One-line summary                                                                                                                                                                                                          |
| --- | --------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0  | Canonical URLs & redirects        |   ✅   | Absolute self-canonicals, trailing slash normalized, query stripped ([`utils/seo.ts`](../utils/seo.ts)); 308 host/protocol redirects. _(www→apex is 307 — backlog #8.)_                                                   |
| P1  | Important pages server-rendered   |   ✅   | Public sitemap routes now have server-visible content. Data routes use [`app/PublicDataRouteSeoSummary.tsx`](../app/PublicDataRouteSeoSummary.tsx) before client hydration.                                               |
| P2  | Homepage entity signal            |   ✅   | Brand-first H1 live; poetic line kept as subhead. _(Minor: 2 of 8 entity terms fall past first ~150 words; disambiguation line not on home/FAQ — backlog #10.)_                                                           |
| P3  | FAQ crawlable Q&A                 |   ✅   | 58 Q&A / 6 categories, Radix `forceMount` keeps answers in DOM, `FAQPage` JSON-LD from same source ([`app/faq/`](../app/faq)).                                                                                            |
| P4  | Statistics page fixed             |   ✅   | Async server `StatisticsSeoSummary` with cycle/gestures/reserves/NFTs + "Last updated UTC" + source + links + fallback ([`app/statistics/`](../app/statistics)).                                                          |
| P5  | `/learn` content hub              |   🟡   | All 10 articles + structure + `Article`/`TechArticle` JSON-LD, but **thin (~270–370 words vs 700–1500) with ~217 words of boilerplate repeated across all 10** ([`content/learn.ts`](../content/learn.ts)) — backlog #11. |
| P6  | Entity home + Org/WebSite JSON-LD |   ✅   | `/about` + sitewide Organization/WebSite. _(About missing FAQ/Terms/Privacy links + support contact — backlog #12; `sameAs` missing GitHub — backlog #6.)_                                                                |
| P7  | Titles / descriptions / H1 map    |   ✅   | Implemented via `createMetadata`; live values match the planned map verbatim.                                                                                                                                             |
| P8  | Robots per host                   |   ✅   | Per-host `robots.ts`; AI/search bots allowed; sitemap referenced.                                                                                                                                                         |
| P9  | CDN/WAF crawler access            |   🟡   | No challenge/CAPTCHA/wallet-gate observed on public pages; **full WAF audit must be done from logs ([§6](#6-off-box-verification-not-doable-from-the-repo)).**                                                            |
| P10 | XML + HTML sitemaps               |   ✅   | Both hosts + `/site-map`; XML URLs are generated from [`lib/seoRoutes.ts`](../lib/seoRoutes.ts), noindex/demo routes are excluded, and learn articles use article update dates.                                           |
| P11 | Internal linking                  |   ✅   | Real `<a>`/`next/link`, descriptive anchors. _(Minor: landing home has no direct `/statistics` or `/gallery` link — backlog #13.)_                                                                                        |
| P12 | Structured data                   |   ✅   | Broad coverage, stable `@id`s. Removed misleading zero-price Offers, stopped WebApplication schema on the landing host, avoided landing duplicate org/site emission, and added GitHub to `sameAs`.                        |
| P13 | AI files (`llms.txt`)             |   ✅   | `llms.txt` + `llms-full.txt` on both hosts. _(IndexNow & `.md` mirrors not done — optional, P23.)_                                                                                                                        |
| P14 | Snippet / robots meta             |   ✅   | `index,follow,max-snippet:-1,max-image-preview:large`; no `noindex`/`nosnippet`/`X-Robots-Tag` on public pages.                                                                                                           |
| P15 | Images / OG / video               |   ✅   | OG = real PNG 1200×630 + alt; hero `priority` + alt; gallery explanatory text + per-item alt. _(Per-page string `og:image` lacks width/height/alt — backlog #13.)_                                                        |
| P16 | Performance / Core Web Vitals     |   ✅   | Route-group root layouts removed the `headers()` host branch (2026-07-06): content pages prerender statically, data pages use ISR (`revalidate = 300`), and e2e asserts content routes are CDN-cacheable.                 |
| P17 | HTTP status / 404                 |   ✅   | Real 404 verified live. Invalid non-numeric `/detail/[id]` values now call `notFound()`; missing API-token 404 responses also return the real not-found page.                                                             |
| P18 | Trust / security content          |   🟡   | Pages present; non-investment language strong; risky words clean. **Audit-claim inconsistency; addresses API-gated; broken IPFS link — backlog #5, #7.**                                                                  |
| P19 | Accessibility / semantic HTML     |   ✅   | `lang="en"`, header/nav/main/footer, skip link, one H1, keyboard accordions, decorative canvas `aria-hidden`.                                                                                                             |
| P20 | Index/noindex matrix              |   ✅   | Enforced by [`app/__tests__/seo-policy.test.ts`](../app/__tests__/seo-policy.test.ts). Wallet, admin, dynamic, and demo routes are noindex or omitted from XML sitemaps as appropriate.                                   |
| P21 | Next.js patterns                  |   ✅   | `createMetadata`, `revalidate`, `sitemap()`/`robots()` route handlers.                                                                                                                                                    |
| P22 | Dev QA checklist                  |   ✅   | Codified with expanded Jest SEO tests and [`e2e/seo-raw-html.spec.ts`](../e2e/seo-raw-html.spec.ts).                                                                                                                      |
| P23 | IndexNow (optional)               |   🟡   | Env-gated helper and submit script added ([`utils/indexNow.ts`](../utils/indexNow.ts), [`scripts/indexnow-submit.ts`](../scripts/indexnow-submit.ts)); activation still requires a real IndexNow key.                     |

### Things confirmed working well (don't regress these)

- Crawlable, non-cloaked HTML on every public page (proven in §2).
- Real `404` status (not a 200 app shell); skip link, landmarks, `lang`, keyboard-accessible accordions.
- Real PNG OG cards via `next/og` file convention (the old SVG-preview bug is fixed).
- Google Search Console verification token in [`app/layout.tsx`](../app/layout.tsx).
- Web3/wallet bundle excluded from the landing host.
- An existing unit test enforces the index/noindex policy.

---

## 4. Remaining work (backlog)

Ordered by SEO/trust impact. Each item: **what → where → why → fix.**

### High — affects what gets indexed / trust

**1. ✅ Done — public app data routes now have server-rendered content**: `anchoring`, `allocation`, `marketing`, `imprint`, `eth-contribution`, `attached-nfts`, `allocation-finalized`, `named-nfts`, `used-rwlk-nfts`, `coordination-changes`, `public-goods-contributions-cg`, `public-goods-contributions-voluntary`, `public-goods-retrievals`.

- **Where:** these dirs under [`app/`](../app); listed in [`app/sitemap.ts`](../app/sitemap.ts).
- **Why:** to a non-JS crawler they're a thin header + empty table — the exact problem fixed for `/statistics`. Only `current-cycle`, `gallery`, `statistics` (+ home/contracts/code) have a `*SeoSummary`.
- **Fix implemented:** added [`app/PublicDataRouteSeoSummary.tsx`](../app/PublicDataRouteSeoSummary.tsx) and inserted it before the client data tables.

**2. ✅ Done — `/recipient-history` is a wallet-personal view** ("My Allocation History" / "Please connect your wallet") and is now `noindex,follow` and absent from the sitemap.

- **Where:** [`app/recipient-history/`](../app/recipient-history).
- **Fix implemented:** `createMetadata(..., { index: false })` and route policy exclusion.

**3. ✅ Done — demo NFT route removed**: the former hardcoded demo page was deleted so users and crawlers only encounter real generated NFTs.

- **Where:** [`app/detail/[id]/`](../app/detail/[id]) now represents token detail pages; deleted sample-route code is no longer part of the app route policy.
- **Fix implemented:** removed the route, links, and route-policy entry instead of preserving a noindex placeholder.

**4. ✅ Done — soft-404 on `/detail/[id]`** — invalid non-numeric IDs now call `notFound()`, and API 404s for missing tokens also return the real 404 page.

- **Where:** [`app/detail/[id]/DetailPage.tsx`](../app/detail/[id]/DetailPage.tsx).
- **Fix implemented:** [`app/detail/[id]/page.tsx`](../app/detail/[id]/page.tsx) validates IDs and calls `notFound()` when appropriate.

**5. ✅ Done — audit-claim inconsistency softened** (trust/accuracy): marketing/FAQ/contracts no longer state unpublished audit/formal-verification claims as fact.

- **Where:** [`content/landing.ts`](../content/landing.ts) (≈ lines 262, 270), [`app/faq/data/faq-data.ts`](../app/faq/data/faq-data.ts) (≈ line 341), [`app/contracts/Contracts.tsx`](../app/contracts/Contracts.tsx) (≈ line 224) vs [`app/audits/page.tsx`](../app/audits/page.tsx).
- **Fix implemented:** softened the claims until actual reports are published.

### Medium

**6. ✅ Done — structured-data accuracy** in [`utils/jsonLd.tsx`](../utils/jsonLd.tsx):

- Removed `price:'0'` Offers from `WebApplication` and `Product`.
- `WebApplication` is emitted only on the app host.
- Landing host no longer double-emits root Organization/WebSite JSON-LD.
- `Organization.sameAs` includes the GitHub org URL.

**7. ✅ Done — contracts / source trust links** (P18):

- `/contracts` server summary now falls back to verified proxy/implementation addresses from [`content/protocol-facts.ts`](../content/protocol-facts.ts).
- `/code` uses a valid IPFS gateway URL and links the GitHub organization.

**8. `www → apex` redirect is 307 (temporary)** — make it 301/308 permanent (Vercel domain config) so canonical signals consolidate.

### Low / hygiene

**9. ✅ Done / partial by design — sitemap hygiene** ([`app/sitemap.ts`](../app/sitemap.ts)): route entries now come from [`lib/seoRoutes.ts`](../lib/seoRoutes.ts), noindex URLs are excluded, and learn article `lastmod` values use article update dates. `priority`/`changefreq` remain for compatibility with existing consumers, though Google ignores them.

**10. ✅ Done — disambiguation line** (not the COSMIC cancer/biology database) now appears on `/about`, landing home, FAQ, one learn article, and `llms.txt`.

**11. 🟡 Improved — `/learn` depth** — articles were expanded with topic-specific sections and the test threshold was raised. They are more substantial than before, but some are still below the ideal 700–1,500 word long-form target.

**12. ✅ Done — `/about`** — FAQ/Terms/Privacy links and `support@cosmicsignature.com` were added.

**13. ✅ Done / partial** — per-page `og:image` now includes width/height/alt in [`utils/seo.ts`](../utils/seo.ts), and landing home links directly to `/statistics` + `/gallery`. The 404 copy is already rendering an em dash correctly in code.

### <a id="performance-and-core-web-vitals"></a>Performance and Core Web Vitals (P16)

**✅ Resolved 2026-07-06.** The root layout's `headers()` call was eliminated by splitting the app into two route-group root layouts (`(app)` / `(landing)`); host separation lives exclusively in `proxy.ts`. Static pages (`/faq`, `/how-it-works`, `/learn/*`, `/about`, legal pages) are now prerendered at build time, data pages use ISR with `revalidate = 300` (the `/statistics` revalidate now actually works), and `e2e/seo-raw-html.spec.ts` fails if a content route regresses to `Cache-Control: private/no-store`. Remaining CDN-level cache verification (edge hit rates) is an off-box check.

### AI training bots (decision, not a bug)

`robots.txt` currently **allows** training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`, …). That maximizes AI visibility but means the site is **not** opting out of model training. Change only if that's a business preference.

---

## 5. Tests added / still useful

The project has Jest (unit) and Playwright (e2e). The key SEO checks from the original suggestion list are now implemented or partially implemented.

### A. ✅ Extended unit policy test — [`app/__tests__/seo-policy.test.ts`](../app/__tests__/seo-policy.test.ts)

| Test                  | Asserts                                                                              |           Today            |
| --------------------- | ------------------------------------------------------------------------------------ | :------------------------: |
| Sitemap ⊆ indexable   | every app sitemap route is indexable and server-visible                              |             ✅             |
| SSR-content allowlist | every app sitemap route has `hasServerVisibleContent:true` in route policy           |             ✅             |
| Unique metadata       | no two pages share the same `<title>` or meta description                            | Not separately implemented |
| noindex coverage      | wallet/personal/admin/demo/dynamic routes are noindex or omitted from XML sitemap    |             ✅             |
| JSON-LD sanity        | `organizationJsonLd().sameAs` includes GitHub; no misleading zero-price Offer claims |             ✅             |

### B. ✅ Raw-HTML crawlability — [`e2e/seo-raw-html.spec.ts`](../e2e/seo-raw-html.spec.ts)

The highest-value addition: it tests what non-rendering crawlers see. Use `request.get()` (not `page.goto`) so JavaScript never runs.

```ts
// e2e/seo-raw-html.spec.ts
import { test, expect, request } from '@playwright/test';

const PUBLIC_URLS = [
  'https://cosmicsignature.com/',
  'https://cosmicsignature.com/about',
  'https://cosmicsignature.com/learn',
  'https://cosmicsignature.com/learn/what-is-cosmic-signature',
  'https://app.cosmicsignature.com/',
  'https://app.cosmicsignature.com/statistics',
  'https://app.cosmicsignature.com/faq',
  'https://app.cosmicsignature.com/how-it-works',
  'https://app.cosmicsignature.com/contracts',
  'https://app.cosmicsignature.com/gallery',
];

for (const url of PUBLIC_URLS) {
  test(`raw HTML is crawlable: ${url}`, async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(url);
    expect(res.status()).toBe(200);
    const html = await res.text();

    expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
    expect(html).toMatch(/<link[^>]+rel="canonical"[^>]+href="https?:\/\//);
    expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]{30,}"/);
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1); // exactly one H1
    expect(html).not.toMatch(/name="robots"[^>]+noindex/);
    // body must not be only a spinner
    expect(html).not.toMatch(/^[\s\S]{0,2000}>Loading\.\.\.<[\s\S]{0,200}<\/body>/);
  });
}
```

### C. Redirects & status codes — Playwright `request`, `maxRedirects: 0`

| Test                                      | Expect                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| `http://cosmicsignature.com/`             | 308 → `https://cosmicsignature.com/`                  |
| `http://app.cosmicsignature.com/`         | 308 → `https://app.cosmicsignature.com/`              |
| `https://www.cosmicsignature.com/`        | **301 or 308** → apex (🔴 currently 307 — backlog #8) |
| landing `/faq`, `/statistics`, `/terms`   | 308 → app host                                        |
| app `/about`, `/learn/x`                  | 308 → landing host                                    |
| `/this-route-does-not-exist` (both hosts) | **404**                                               |
| `/detail/<nonexistent-id>`                | **404** (🔴 currently 200 — backlog #4)               |

### D. robots.txt & sitemap integrity — Playwright `request`

- `GET /robots.txt` on each host → contains the correct `Sitemap:` line, the expected `Disallow` set, and an explicit allow group for AI/search bots.
- `GET /sitemap.xml` on each host → valid XML; every `<loc>` is absolute and host-correct; **`GET` each loc → 200** (not 3xx/4xx) and the returned HTML has **no** `noindex`. (This catches thin/placeholder/redirected URLs slipping into the sitemap.)
- `GET /llms.txt` on each host → 200, non-empty, contains the disambiguation line.

### E. Structured-data validation — unit or e2e

- Extract every `<script type="application/ld+json">` block from each public page, `JSON.parse` it (fails on malformed JSON), and assert the expected `@type`s per page (home → Organization + WebSite; `/learn/*` → Article/TechArticle + BreadcrumbList; `/faq` → FAQPage; `/statistics` → Dataset).
- Assert no JSON-LD value contradicts the page (e.g. an `Offer.price` of `'0'` must match a visible $0 price).
- Optionally pipe results through Google's Rich Results validator in CI.

### F. Rendered-content e2e (complements B)

Keep a small set of `page.goto` tests confirming the rendered page matches the raw HTML (catches hydration mismatches):

```ts
test('statistics renders the protocol snapshot', async ({ page }) => {
  await page.goto('https://app.cosmicsignature.com/statistics');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Cosmic Signature Protocol Statistics',
  );
  await expect(page.getByText(/Last updated:.*UTC/)).toBeVisible();
});
```

### G. Performance budget (optional, CI)

Add Lighthouse CI with budgets (LCP < 2.5 s mobile, CLS < 0.1) on `/`, `/faq`, `/learn/what-is-cosmic-signature`, `/statistics` to keep regressions visible — especially relevant given the dynamic-rendering note in §4.

---

## 6. Off-box verification (not doable from the repo)

These require dashboards/logs, not code:

- **WAF/CDN crawler access:** in Vercel/CDN logs, confirm `Googlebot`, `Bingbot`, `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User` receive `200/301/308/404` — never `403/429/503`, JS-challenge, or CAPTCHA on public pages.
- **`www → apex` redirect** is permanent (301/308) at the Vercel domain level (backlog #8).
- **Search Console / Bing Webmaster:** submit both sitemaps; watch Coverage/Indexing reports (out of site-side scope but the natural next step).
- **Crawler IP allowlists** (optional): OpenAI / Perplexity / Anthropic publish JSON IP ranges if you choose IP-based WAF verification.

---

## 7. References

- Google Search Essentials — https://developers.google.com/search/docs/essentials
- Google JavaScript SEO basics — https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google canonical guidance — https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google robots meta / X-Robots-Tag — https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Google sitemaps — https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google structured data intro — https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google AI features — https://developers.google.com/search/docs/appearance/ai-features
- OpenAI crawlers — https://developers.openai.com/api/docs/bots
- Anthropic crawler — https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity crawlers — https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- IndexNow — https://www.indexnow.org/documentation
- llms.txt — https://llmstxt.org/
