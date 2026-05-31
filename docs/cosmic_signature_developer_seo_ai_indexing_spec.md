# Cosmic Signature — SEO & AI Indexing: Status & Remaining Work

**Last verified:** 2026-05-31 (live site + code audit)
**Scope:** Site-side changes only — code and hosting/CDN config. Excludes off-site promotion, Search Console / Bing Webmaster submission, social posting, paid links, and PR.

This document started life as an implementation spec. **Most of it is now built and live.** It has been rewritten as a _living status doc_ so anyone improving SEO further can see, at a glance: what is done, what was proven by testing, and what is still open.

## How to read this

- **✅ Done** — implemented and (where possible) verified live.
- **🟡 Partial** — implemented but with a gap worth closing.
- **❌ Open** — not done / needs work.
- File references like [`utils/seo.ts`](../utils/seo.ts) point to the implementation.

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
| `sitemap.xml` — app                                 | 🟡 29 URLs (several thin/placeholder — see [§4](#high--affects-what-gets-indexed--trust))                                            |
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
| P1  | Important pages server-rendered   |   🟡   | Home/FAQ/statistics/how-it-works/contracts/code/gallery/current-cycle render real HTML. **15 app data-table routes are client-only yet indexed (backlog #1).**                                                            |
| P2  | Homepage entity signal            |   ✅   | Brand-first H1 live; poetic line kept as subhead. _(Minor: 2 of 8 entity terms fall past first ~150 words; disambiguation line not on home/FAQ — backlog #10.)_                                                           |
| P3  | FAQ crawlable Q&A                 |   ✅   | 58 Q&A / 6 categories, Radix `forceMount` keeps answers in DOM, `FAQPage` JSON-LD from same source ([`app/faq/`](../app/faq)).                                                                                            |
| P4  | Statistics page fixed             |   ✅   | Async server `StatisticsSeoSummary` with cycle/gestures/reserves/NFTs + "Last updated UTC" + source + links + fallback ([`app/statistics/`](../app/statistics)).                                                          |
| P5  | `/learn` content hub              |   🟡   | All 10 articles + structure + `Article`/`TechArticle` JSON-LD, but **thin (~270–370 words vs 700–1500) with ~217 words of boilerplate repeated across all 10** ([`content/learn.ts`](../content/learn.ts)) — backlog #11. |
| P6  | Entity home + Org/WebSite JSON-LD |   ✅   | `/about` + sitewide Organization/WebSite. _(About missing FAQ/Terms/Privacy links + support contact — backlog #12; `sameAs` missing GitHub — backlog #6.)_                                                                |
| P7  | Titles / descriptions / H1 map    |   ✅   | Implemented via `createMetadata`; live values match the planned map verbatim.                                                                                                                                             |
| P8  | Robots per host                   |   ✅   | Per-host `robots.ts`; AI/search bots allowed; sitemap referenced.                                                                                                                                                         |
| P9  | CDN/WAF crawler access            |   🟡   | No challenge/CAPTCHA/wallet-gate observed on public pages; **full WAF audit must be done from logs ([§6](#6-off-box-verification-not-doable-from-the-repo)).**                                                            |
| P10 | XML + HTML sitemaps               |   🟡   | Both hosts + `/site-map`. **Includes thin/placeholder URLs; single hardcoded `lastmod`; `priority`/`changefreq` present (Google ignores) — backlog #1–3, #9.**                                                            |
| P11 | Internal linking                  |   ✅   | Real `<a>`/`next/link`, descriptive anchors. _(Minor: landing home has no direct `/statistics` or `/gallery` link — backlog #13.)_                                                                                        |
| P12 | Structured data                   |   🟡   | Broad coverage, stable `@id`s. **Accuracy defects: `price:0` Offers, WebApplication on landing home, double-emit, missing GitHub — backlog #6.**                                                                          |
| P13 | AI files (`llms.txt`)             |   ✅   | `llms.txt` + `llms-full.txt` on both hosts. _(IndexNow & `.md` mirrors not done — optional, P23.)_                                                                                                                        |
| P14 | Snippet / robots meta             |   ✅   | `index,follow,max-snippet:-1,max-image-preview:large`; no `noindex`/`nosnippet`/`X-Robots-Tag` on public pages.                                                                                                           |
| P15 | Images / OG / video               |   ✅   | OG = real PNG 1200×630 + alt; hero `priority` + alt; gallery explanatory text + per-item alt. _(Per-page string `og:image` lacks width/height/alt — backlog #13.)_                                                        |
| P16 | Performance / Core Web Vitals     |   🟡   | Real routes; web3 bundle excluded from landing. **`headers()` in root layout forces dynamic rendering for all pages — no static/CDN caching ([§4 Performance](#performance-and-core-web-vitals)).**                       |
| P17 | HTTP status / 404                 |   🟡   | Real 404 verified live. **Soft-404 on `/detail/[id]` (200 for invalid token, indexable) — backlog #4.**                                                                                                                   |
| P18 | Trust / security content          |   🟡   | Pages present; non-investment language strong; risky words clean. **Audit-claim inconsistency; addresses API-gated; broken IPFS link — backlog #5, #7.**                                                                  |
| P19 | Accessibility / semantic HTML     |   ✅   | `lang="en"`, header/nav/main/footer, skip link, one H1, keyboard accordions, decorative canvas `aria-hidden`.                                                                                                             |
| P20 | Index/noindex matrix              |   🟡   | Good noindex coverage, **enforced by [`app/__tests__/seo-policy.test.ts`](../app/__tests__/seo-policy.test.ts)**. **But thin/personal/placeholder routes still indexed — backlog #1–3.**                                  |
| P21 | Next.js patterns                  |   ✅   | `createMetadata`, `revalidate`, `sitemap()`/`robots()` route handlers.                                                                                                                                                    |
| P22 | Dev QA checklist                  |   🟡   | Live curl checks pass; the "thin render" check flags the 15 client-only routes. Codify with [§5 Tests](#5-suggested-tests).                                                                                               |
| P23 | IndexNow (optional)               |   ❌   | Not implemented (optional).                                                                                                                                                                                               |

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

**1. 15 indexable app routes have no server-rendered content** (client-only data tables): `anchoring`, `allocation`, `marketing`, `imprint`, `eth-contribution`, `attached-nfts`, `allocation-finalized`, `named-nfts`, `used-rwlk-nfts`, `coordination-changes`, `public-goods-contributions-cg`, `public-goods-contributions-voluntary`, `public-goods-retrievals`.

- **Where:** these dirs under [`app/`](../app); listed in [`app/sitemap.ts`](../app/sitemap.ts).
- **Why:** to a non-JS crawler they're a thin header + empty table — the exact problem fixed for `/statistics`. Only `current-cycle`, `gallery`, `statistics` (+ home/contracts/code) have a `*SeoSummary`.
- **Fix:** add an SSR summary (mirror [`app/statistics/StatisticsSeoSummary.tsx`](../app/statistics/StatisticsSeoSummary.tsx)) **or** mark `noindex` and remove from the sitemap.

**2. `/recipient-history` is a wallet-personal view** ("My Allocation History" / "Please connect your wallet") but is `index:true` and sitemapped.

- **Where:** [`app/recipient-history/`](../app/recipient-history).
- **Fix:** `createMetadata(..., { index: false })` and drop from the sitemap.

**3. `/detail/sample` is a hardcoded demo placeholder** ("Static sample values for this demo page") but is `index:true` and sitemapped.

- **Where:** [`app/detail/sample/`](../app/detail/sample), [`app/sitemap.ts`](../app/sitemap.ts).
- **Fix:** remove from sitemap and/or `noindex`.

**4. Soft-404 on `/detail/[id]`** — renders "Invalid Token Id" at HTTP 200 for missing/invalid tokens and is indexable.

- **Where:** [`app/detail/[id]/DetailPage.tsx`](../app/detail/[id]/DetailPage.tsx).
- **Fix:** call `notFound()` when the token doesn't exist (returns a real 404 via `app/not-found.tsx`).

**5. Audit-claim inconsistency** (trust/accuracy): marketing/FAQ/contracts state "All contracts have been audited… Certora… Slither in CI" as fact, while the dedicated `/audits` page links nothing and says reports come "when published."

- **Where:** [`content/landing.ts`](../content/landing.ts) (≈ lines 262, 270), [`app/faq/data/faq-data.ts`](../app/faq/data/faq-data.ts) (≈ line 341), [`app/contracts/Contracts.tsx`](../app/contracts/Contracts.tsx) (≈ line 224) vs [`app/audits/page.tsx`](../app/audits/page.tsx).
- **Fix:** either link the actual audit/verification reports on `/audits`, or soften the claims until published.

### Medium

**6. Structured-data accuracy** in [`utils/jsonLd.tsx`](../utils/jsonLd.tsx):

- `WebApplication` and `Product` Offers hardcode `price:'0'` — asserts free participation/mint, which isn't true and isn't shown on the page (gestures cost ETH).
- `WebApplication` is emitted on the **landing** home where there is no app UI.
- `Organization` + `WebSite` are **double-emitted** on the landing home (root layout + landing-site layout).
- `Organization.sameAs` omits the real GitHub org URL (used elsewhere on the site).
- **Why:** structured data must match visible content; mismatches can be ignored by Google or flagged.

**7. Contracts / source trust links** (P18):

- `/contracts` addresses come from a live API at render time — a transient failure yields an **address-less** page. Verified addresses already exist in [`content/protocol-facts.ts`](../content/protocol-facts.ts) but aren't rendered as a fallback.
- `/code` links a **broken IPFS URL** (`cloudflare-ipfs.com/ipfs:/…`); no app-host trust page links GitHub.
- **Fix:** render a hardcoded address fallback; fix the source link; add a GitHub link.

**8. `www → apex` redirect is 307 (temporary)** — make it 301/308 permanent (Vercel domain config) so canonical signals consolidate.

### Low / hygiene

**9. Sitemap hygiene** ([`app/sitemap.ts`](../app/sitemap.ts)): set accurate per-page `lastmod` (currently one hardcoded date for all pages, incl. hourly stats); `priority`/`changefreq` can be dropped (Google ignores them).

**10. Disambiguation line** (not the COSMIC cancer/biology database) appears only on `/about`, one learn article, and `llms.txt` — add it to the homepage and/or FAQ HTML.

**11. `/learn` depth** — expand articles toward 700–1,500 words of _unique_ content and reduce the shared boilerplate repeated across all 10.

**12. `/about`** — add FAQ/Terms/Privacy links and an explicit support/contact channel.

**13. Small fixes** — per-page `og:image` set as a bare string ([`utils/seo.ts`](../utils/seo.ts)) lacks `width`/`height`/`alt`; `app/not-found.tsx` prints a literal `—` escape instead of an em-dash; landing home lacks direct `/statistics` + `/gallery` links.

### <a id="performance-and-core-web-vitals"></a>Performance and Core Web Vitals (P16)

The root layout's `headers()` call (host detection) opts the **whole app into dynamic rendering** — confirmed live by `Cache-Control: private, no-cache, no-store` and by `/statistics`' `revalidate=300` having no effect. Content stays crawlable, but static pages (`/faq`, `/how-it-works`, `/learn/*`, `/about`) are recomputed per request instead of being statically generated and CDN-cached, which hurts TTFB/LCP and raises server cost. **Consider** host-segmented routing (route groups) that lets content pages be statically generated, or accept the trade-off deliberately.

### AI training bots (decision, not a bug)

`robots.txt` currently **allows** training crawlers (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `Bytespider`, …). That maximizes AI visibility but means the site is **not** opting out of model training. Change only if that's a business preference.

---

## 5. Suggested tests

Add these to lock in current behavior and catch regressions. The project already has Jest (unit) and Playwright (e2e) — extend both. Where a test would fail **today**, it's marked 🔴: land it alongside the matching backlog fix.

### A. Extend the unit policy test — [`app/__tests__/seo-policy.test.ts`](../app/__tests__/seo-policy.test.ts)

| Test                  | Asserts                                                                                                                                                                         |         Today          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------: |
| Sitemap ⊆ indexable   | every path in `app/sitemap.ts` (app + landing) resolves to a route whose metadata is **not** `index:false`                                                                      | 🔴 (passes after #1–3) |
| SSR-content allowlist | every **app** sitemap path is either in an explicit "has SSR summary / is a content page" allowlist or is excluded — fails when a new client-only route is added to the sitemap |           🔴           |
| Unique metadata       | no two pages share the same `<title>` or meta description                                                                                                                       |       ✅ likely        |
| noindex coverage      | wallet/personal/admin/dynamic-detail routes (`my-*`, `user/*`, `admin/*`, `recipient-history`, `detail/sample`, `system-event/*`, `gesture/*`) are `index:false`                |     🔴 until #2–3      |
| JSON-LD sanity        | `organizationJsonLd().sameAs` includes the GitHub URL; no `Offer` claims `price:'0'` unless the page shows a $0 price                                                           |      🔴 until #6       |

### B. Raw-HTML crawlability — Playwright `request` (no JS), one assertion set per public URL

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
