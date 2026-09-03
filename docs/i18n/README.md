# Internationalization (i18n) — Architecture & Handbook

This document defines how Cosmic Signature is a multilingual site. It shipped
**Simplified Chinese (`zh`)** first, **Ukrainian (`uk`)** second, then the two
**Traditional Chinese variants (`zh-TW`, `zh-HK`)**, then **Korean (`ko`)** — the first
language added with `npm run i18n:scaffold` — then **Japanese (`ja`)**, the first language
sharing a script family with an existing one, then **Vietnamese (`vi`)**, the first
alphabetic language after Ukrainian and the first whose letters the display face lacks;
every later language follows the checklist in §10. It covers the technical architecture, the message/content structure, the
translation workflow, and the quality bar. It is written so that any engineer or translator
can pick up a unit from a progress tracker and know exactly what to do.

**The document set:**

| Document                                       | Purpose                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| [README.md](./README.md) (this file)           | Architecture, tooling, workflow, definition of done                                   |
| [glossary-zh.md](./glossary-zh.md)             | Canonical Simplified Chinese translation for every protocol term + banned list        |
| [style-guide-zh.md](./style-guide-zh.md)       | Rules for making the Simplified Chinese sound native, not translated                  |
| [progress-zh.md](./progress-zh.md)             | Simplified Chinese rollout: site inventory, sprint plan, progress tracker             |
| [glossary-zh-TW.md](./glossary-zh-TW.md)       | Taiwan Traditional Chinese terms, Taiwan vocabulary, banned register                  |
| [style-guide-zh-TW.md](./style-guide-zh-TW.md) | What differs for Taiwan: vocabulary, characters (裡/著/台), 「」, review hunts        |
| [progress-zh-TW.md](./progress-zh-TW.md)       | Taiwan rollout: per-namespace and per-area T/R/Q tracker                              |
| [glossary-zh-HK.md](./glossary-zh-HK.md)       | Hong Kong Traditional Chinese terms, Hong Kong vocabulary, banned register            |
| [style-guide-zh-HK.md](./style-guide-zh-HK.md) | What differs for Hong Kong: written Chinese, 裏/着, standard Big5 forms, 「」         |
| [progress-zh-HK.md](./progress-zh-HK.md)       | Hong Kong rollout: per-namespace and per-area T/R/Q tracker                           |
| [glossary-uk.md](./glossary-uk.md)             | Canonical Ukrainian translation for every protocol term + banned-term list            |
| [style-guide-uk.md](./style-guide-uk.md)       | Rules for making the Ukrainian sound native (cases, four plural forms)                |
| [progress-uk.md](./progress-uk.md)             | Ukrainian rollout: per-namespace and per-area T/R/Q tracker                           |
| [glossary-ko.md](./glossary-ko.md)             | Canonical Korean translation for every protocol term + banned register                |
| [style-guide-ko.md](./style-guide-ko.md)       | Rules for making the Korean sound native (합쇼체, particles, counters, keep-all)      |
| [progress-ko.md](./progress-ko.md)             | Korean rollout: per-namespace and per-area T/R/Q tracker                              |
| [glossary-ja.md](./glossary-ja.md)             | Canonical Japanese translation for every protocol term + banned register              |
| [style-guide-ja.md](./style-guide-ja.md)       | Rules for making the Japanese sound native (です・ます, no spaces, counters, kinsoku) |
| [progress-ja.md](./progress-ja.md)             | Japanese rollout: per-namespace and per-area T/R/Q tracker                            |
| [glossary-vi.md](./glossary-vi.md)             | Canonical Vietnamese translation for every protocol term + banned register            |
| [style-guide-vi.md](./style-guide-vi.md)       | Rules for making the Vietnamese sound native (bạn, ASCII marks, dot grouping, NFC)    |
| [progress-vi.md](./progress-vi.md)             | Vietnamese rollout: per-namespace and per-area T/R/Q tracker                          |

> Note: `docs/` is intentionally outside the lexicon scanner's `SCAN_DIRS`
> (see `scripts/lexicon-scan.ts`), so these documents may cite banned vocabulary
> in order to define and forbid it.

---

## 1. Goals and decisions (locked)

- **Shipped languages:** Simplified Chinese, mainland conventions, also serving Singapore
  — locale code `zh` (hreflang alias `zh-Hans`); Taiwan Traditional Chinese — `zh-TW`
  (alias `zh-Hant`); Hong Kong Traditional Chinese — `zh-HK` (alias `zh-MO`, Macau
  follows Hong Kong conventions); Ukrainian — `uk`; Korean — `ko` (`ko-KR` and `ko-KP`
  resolve to it by same-language affinity); Japanese — `ja` (`ja-JP` resolves to it the
  same way); Vietnamese — `vi` (`vi-VN` resolves to it the same way).
- **Locale codes are canonical BCP 47 tags, chosen to match what browsers send.** A bare
  language code is the CLDR default variant of that language (`zh` = Simplified,
  mainland); further variants of the same language carry the region that distinguishes
  them (`zh-TW`, `zh-HK`). This keeps `Intl`, RainbowKit, hreflang, and `<html lang>`
  free of translation tables, and next-intl's CLDR "best fit" negotiation resolves
  `Accept-Language: zh-Hant` to `zh-TW` and `zh-MO` / `yue` to `zh-HK` without code.
  `LOCALE_ALIASES` in `i18n/routing.ts` lists the extra tags each locale serves; they
  become additional hreflang alternates and are honoured by `normalizeLocale`.
- **Variants are separate locales, not conversions.** `zh-TW` and `zh-HK` have their own
  catalogs, copy modules, glossaries, banned registers, terminology packs, fonts, and e2e
  fixtures. `npm run i18n:derive` bootstraps a draft from a sibling script; the copy stage
  rewrites it (§10).
- **URL strategy:** locale-prefixed paths with `localePrefix: 'as-needed'`.
  English keeps every existing URL unchanged (`/gallery`); every other locale lives
  under its prefix (`/zh/gallery`, `/zh-TW/gallery`, `/uk/gallery`, `/ko/gallery`). Prefixes are matched
  case-insensitively and longest-first (`/zh-tw/…` redirects to `/zh-TW/…`; `/zh-TW`
  is never read as `/zh` + `-TW`). This applies on **both hosts**:
  - `cosmicsignature.com/zh`, `cosmicsignature.com/zh-TW`, `cosmicsignature.com/uk` — landing
  - `app.cosmicsignature.com/zh/gallery`, `app.cosmicsignature.com/zh-HK/gallery` — dApp
- **Everything is translated.** Every page, tooltip, toast, error, empty state, `aria-label`,
  SEO title/description, OG image text, and JSON-LD. No surface is exempt (admin/internal
  tools are translated last, but they are translated).
- **Quality bar:** every locale must read as if originally written in that language
  (see [style-guide-zh.md](./style-guide-zh.md), [style-guide-uk.md](./style-guide-uk.md),
  [style-guide-ko.md](./style-guide-ko.md), [style-guide-ja.md](./style-guide-ja.md),
  [style-guide-vi.md](./style-guide-vi.md)). Literal translation is a defect.
- **Future languages** are added by: running `npm run i18n:scaffold` (which
  writes the `messages/<locale>/` directory, the per-locale content modules, the gate
  stub, the e2e suites, and the document templates), extending `locales`, and filling the
  `LocaleRecord` registries the compiler then lists — lexicon profile, terminology pack,
  conventions, fonts, e2e fixtures, test expectations (§10). No further architectural
  change.
  A further variant of an existing language (`pt-BR` beside `pt`, say) follows the same
  path plus `LOCALE_ALIASES` and, for a second script, an entry in `LOCALE_CONVENTIONS`.

## 2. Library and routing architecture

**Library: [`next-intl`](https://next-intl.dev)** — the de-facto standard for the App Router.
Reasons: native Server Components support (zero client JS for server-rendered strings),
Next.js 16 compatibility, ICU MessageFormat, typed message keys, built-in locale-aware
navigation APIs, and static rendering support via `setRequestLocale`.

### 2.1 Route restructure

All routes move under a top-level dynamic segment. Route groups are preserved:

```
app/
  [locale]/
    (app)/        ← everything currently in app/(app)/
      layout.tsx
      page.tsx
      gallery/page.tsx
      ...
    (landing)/    ← everything currently in app/(landing)/
      layout.tsx
      landing-site/page.tsx
      ...
  api/            ← API routes stay outside [locale]
```

New i18n plumbing:

```
i18n/
  routing.ts      ← defineRouting({ locales: ['en', 'zh', 'zh-TW', 'zh-HK', 'uk', 'ko', 'ja', 'vi'], … }), LOCALE_LABELS, LOCALE_ALIASES
  locale.ts       ← AppLocale, LocaleRecord<T>, normalizeLocale, pickByLocale (the only locale parser)
  localeConfig.ts ← per-locale rendering conventions: Intl tag, og:locale, JSON-LD inLanguage,
                    word spacing, week start, ellipsis, provider-error policy
  request.ts      ← getRequestConfig: loads + merges messages for the request locale
  navigation.ts   ← createNavigation(routing): locale-aware Link, useRouter, usePathname, redirect
lib/
  hreflang.ts     ← languageAlternates(): every locale, its aliases, x-default (metadata + sitemaps)
messages/
  en/*.json       ← English catalogs (source of truth), one file per namespace
  zh/*.json       ← Simplified Chinese catalogs (same keys, same shape)
  zh-TW/*.json    ← Taiwan Traditional Chinese catalogs
  zh-HK/*.json    ← Hong Kong Traditional Chinese catalogs
  uk/*.json       ← Ukrainian catalogs
  ko/*.json       ← Korean catalogs
  ja/*.json       ← Japanese catalogs
  vi/*.json       ← Vietnamese catalogs
```

`normalizeLocale` resolves locale-ish input in four steps: exact code (any casing, `_`
separators) → `LOCALE_ALIASES` → best variant of the same language by
`Intl.Locale#maximize()` (script before region: `zh-SG` → `zh`, `zh-Hant-MO` → `zh-HK`)
→ default locale. It never crosses languages; visitor negotiation is next-intl's job.

**No `locale === 'zh'` ternaries anywhere.** Every per-locale value lives in a
`LocaleRecord<T>` — either in `i18n/localeConfig.ts` (cross-cutting conventions), in a
registry next to its single consumer (e.g. the RainbowKit locale map in
`components/wallet/WalletUi.tsx`), or in a content/copy registry (§3.2). `Record<AppLocale, T>`
means adding a locale to `routing.locales` turns every registry into a compile error until
an entry exists.

`next.config.ts` gets wrapped with `createNextIntlPlugin()` (composes with the existing
Sentry and bundle-analyzer wrappers).

**Every layout and page** under `[locale]` must:

1. `generateStaticParams()` returning `routing.locales.map((locale) => ({ locale }))`
   (root layouts only), and
2. call `setRequestLocale(locale)` before using any next-intl API — this keeps static
   rendering / CDN caching intact, which the current architecture depends on
   (see the comment in `app/root-document.tsx`).

The locale layout validates the param and provides messages:

```tsx
// app/[locale]/(app)/layout.tsx (same pattern for (landing))
const { locale } = await params;
if (!hasLocale(routing.locales, locale)) notFound();
setRequestLocale(locale);
// <NextIntlClientProvider> wraps providers so client components can translate
```

### 2.2 Navigation codemod

All imports of `next/link`'s `Link` and of `useRouter` / `usePathname` / `redirect` from
`next/navigation` are replaced by the wrappers exported from `i18n/navigation.ts`.
This is what keeps a user on `/zh/...` when they click any internal link. Cross-host links
(`APP_ORIGIN`/`LANDING_ORIGIN` absolute URLs in nav, footer, landing CTAs) must have the
locale prefix appended explicitly — add a helper `localeHref(origin, path, locale)` in
`lib/hostRouting.ts`.

### 2.3 Composing with the host-routing middleware (`proxy.ts`)

The edge middleware currently does host separation (landing vs app) and the
`/` → `/landing-site` rewrite. It gains a locale-awareness layer, in this order:

1. **Split the locale prefix** off the incoming pathname:
   `/zh/gallery` → `{ locale: 'zh', publicPath: '/gallery' }`; `/gallery` → `{ locale: undefined, publicPath: '/gallery' }`.
2. **Run all host checks against `publicPath`** — `isAppOnlyPath`, `isLandingOnlyPath`,
   and the landing root check. Redirect targets re-attach the prefix:
   `${LANDING_ORIGIN}${localePrefix}${publicPath}`.
3. **Landing root rewrite becomes locale-aware:** `/` → `/landing-site`, `/zh` → `/zh/landing-site`.
4. **Delegate to the next-intl middleware** (`createMiddleware(routing)`) instead of
   returning `NextResponse.next()`. It resolves the locale (URL prefix → `NEXT_LOCALE`
   cookie → `Accept-Language` → default), rewrites internally to `/[locale]/...`, and
   manages the cookie.

The middleware `matcher` keeps its current asset exclusions. E2E host-routing specs are
extended with `/zh` variants of every existing case.

### 2.4 Language switcher

One component, `components/layout/LanguageSwitcher.tsx`, in three variants; every option
comes from `routing.locales` and is labeled from `LOCALE_LABELS` (`English` / `简体中文` /
`繁體中文（台灣）` / `繁體中文（香港）` / `Українська` / `한국어` / `日本語`), so a new locale
appears everywhere the moment it is registered:

- **`pill`** (default) — a globe, the current language written in its own name, and a
  chevron, so the control reads as a chooser rather than a status badge. Opens a menu
  headed by the localized "Language" label with one **radio item** per language
  (`menuitemradio`, the active one checked). Rendered in the desktop dApp header, the
  landing header, and both footers.
- **`compact`** — the same menu behind an icon-only globe, for the mobile dApp header where
  the wallet button owns the width. Language choice is therefore reachable from every
  header without opening the drawer.
- **`list`** — every language laid out as a `radiogroup` of tappable rows, for the mobile
  drawer, where a nested menu would hide the choice behind a second tap.

Behavior is shared: switching calls `router.replace(pathname + search + hash, { locale })`
from `i18n/navigation.ts` (preserves the current route and params), and next-intl persists
the choice in the `NEXT_LOCALE` cookie so subsequent visits to unprefixed URLs redirect to
the preferred locale. Each option carries `lang="<locale>"` so assistive technology switches
voice per option, and the trigger's visible label does too. Language names are never
translated — the Japanese option always reads 日本語, the English option always reads
English — and the three Chinese locales are named by script and region so no two options
collapse into "中文". The unit test (`components/layout/__tests__/LanguageSwitcher.test.tsx`)
pins the roles, the `lang` tags, and the labels; the locale smoke suites drive the pill
round-trip end to end.

## 3. Where strings live

Two tiers, chosen by shape of the content:

### 3.1 Message catalogs (`messages/<locale>/*.json`) — UI strings

All interface strings: labels, buttons, table headers, tooltips, toasts, errors, empty
states, aria-labels, form validation, and per-page SEO title/description. One JSON file
per namespace, identical key structure across locales:

```
common.json     nav.json        footer.json     wallet.json
home.json       landing.json    currentCycle.json  gallery.json  detail.json
gesture.json    anchoring.json  allocation.json myPages.json
statistics.json tables.json     tooltips.json   toasts.json
errors.json     forms.json      meta.json       seo.json
siteMap.json    contracts.json  admin.json      formats.json    …
```

The authoritative list is `NAMESPACES` in `i18n/request.ts` (35 namespaces); `how-it-works`
is a content module (§3.2), not a catalog.

Usage: `useTranslations('gallery')` in client components, `getTranslations` in server
components and `generateMetadata`.

**Key conventions:**

- Keys describe _role_, not content: `hero.headline`, not `everyGestureShapes`.
- Never concatenate translated fragments; use ICU placeholders: `"gestureCost": "Gesture Cost: {amount} ETH"`.
- ICU `plural` blocks carry every category the locale's `Intl.PluralRules` defines:
  `one/other` in `en`; a single `other` in `zh`, `ko`, `ja`, and `vi`, which have no plural
  inflection (style guides §7 — Korean keeps the block so `#` formats the number and puts the
  counter inside it); `one/few/many/other` in `uk` (style-guide-uk). `npm run i18n:strict` fails on
  a missing category.
- Embedded markup uses `t.rich` with named tags, never raw HTML in messages.
- A string used on 2+ pages goes in `common`/`tables`/`tooltips`, not duplicated.

**Seeding:** `content/dapp.ts` was written as a dApp copy catalog but is not consumed by
production code. Sprint 0 converts it into the initial `messages/en/*.json` files, then
**deletes it** so there is exactly one source of truth. `content/statistics-copy.ts`
migrates into `statistics.json`/`tables.json`/`tooltips.json` during Sprint 5.

### 3.2 Per-locale content modules — structure/text split

500-line articles don't belong in JSON. Long-form copy stays in typed TypeScript, but the
locale-independent **structure** (ids, icons, hrefs, hash anchors, tones, option ids,
correct answers, section trees, `protocolFacts` wiring) is written **once** and only the
translated **text** is per-locale:

```
content/
  faq/         types.ts  structure.ts  text.en.ts  text.zh.ts  index.ts  ← getFaqContent(locale)
  quiz/        (same pattern, per tier)
  white-paper/ (same pattern)
  landing/     (same pattern)
  learn/       (same pattern)
  how-it-works/(same pattern)
  about/       types.ts  en.ts  zh.ts  index.ts   ← small enough that types.ts already holds structure
  protocol-facts.ts                               ← numbers, locale-independent (unchanged)
```

`structure.ts` declares the skeleton `as const`; text modules are typed by mapped types
over the skeleton's literal ids, so a missing or invented translation id **fails to
compile**. `index.ts` composes skeleton + text into the public content shape (exports are
unchanged) and resolves the locale through a `LocaleRecord` registry — see
`content/faq/` for the reference implementation.

Legal and trust pages (Terms, Privacy, Risk Disclosures, Security, Audits) share one
renderer each (`TermsContent.tsx`, `PrivacyContent.tsx`, `TrustPageContent.tsx`) plus
per-locale copy objects (`*.en.ts` / `*.zh.ts`), resolved via `content/legal/index.ts`.
No JSX is duplicated per locale.

**Fallback policy:** `i18n/request.ts` deep-merges each translated locale's messages over
the `en` catalog, so a missing key renders English — never a raw key path. Long-form content has **no
runtime fallback**: the text-module types make partial translations a compile error, so a
locale ships complete or not at all.

## 4. Locale-aware formatting

Formatting conventions live in two places: `i18n/localeConfig.ts` for non-text conventions
(Intl tag, week start, word spacing, ellipsis, provider-error policy) and
`LocaleRecord`-typed format registries in `utils/format.ts` / `utils/time.ts` for
per-locale date/duration templates (compact duration units come from the
`formats.durationCompact` message catalog, the single source shared with
`useTranslations('formats')` consumers). The table below records the original migration:

| Today                                                            | Change                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Intl.NumberFormat('en-US')` in `utils/format.ts`, SEO summaries | Take a `locale` argument; use next-intl `useFormatter`/`getFormatter` where convenient |
| `convertTimestampToDateTime` with hardcoded `Jan…Dec`            | `Intl.DateTimeFormat(locale, …)`; zh renders `1月1日 12:34`                            |
| `formatYyyymmddLabel`, `formatUnixTsLabel` month arrays          | Same — `Intl.DateTimeFormat(locale, { month: 'short' })`                               |
| `formatSeconds` → `1d 2h 30m 45s`                                | Locale unit map; zh: `3天5小时12分45秒` (compact contexts), see style guide §5         |
| `formatEthValue`/`formatCSTValue` unit suffixes                  | Units stay `ETH`/`CST` in all locales (glossary: keep-in-English)                      |
| `components/ui/date-picker.tsx` weekday labels `Su…Sa`           | zh: `日 一 二 三 四 五 六`; week starts Monday for zh                                  |
| `react-countdown` renderers                                      | Localized unit labels via `formats.json`                                               |

English output must remain byte-identical — every formatting change is guarded by
existing unit tests plus new zh cases.

## 5. Fonts

Clash Display (display headings) and Inter (body) contain **no CJK glyphs**. Without
action, Chinese renders in unstyled system fallback.

- Add **Noto Sans SC** via `next/font/google` (one variable-weight set,
  `--font-noto-sc`, `display: 'optional'`). Google Fonts serves it as ~100 small
  `unicode-range` slices, so browsers only download the glyph ranges a page actually uses —
  English pages fetch nothing. `optional` prevents a late CJK metric swap on slow links;
  the approved system CJK stack remains visible when Noto misses the short load window.
  Noto is appended to the global font stacks unconditionally (after Inter / after Clash
  Display).
- Chinese headings render in the locale's Noto Sans cut via fallback (Clash Display has
  no CJK). An `html:lang(zh)` rule — matching `zh`, `zh-TW`, and `zh-HK` alike — bumps
  display-heading weight to 700 and tightens letter-spacing to `0` (CJK must never be
  letter-spaced like the Latin display face).
- System fallback chain after Noto: `"PingFang SC", "Microsoft YaHei", sans-serif`.
- **Three cuts, one property.** Noto Sans SC, TC, and HK share a design but differ in
  glyph forms (mainland, Taiwan MOE, and Hong Kong 常用字字形表 standards); a Hong Kong
  reader shown TC forms sees text that is legible but subtly wrong. Every font-family that
  may render Chinese references `--cjk-font-stack` (body, display, mono); `:root` sets the
  SC stack and `html:lang(zh-TW)` / `html:lang(zh-HK)` swap in `--font-noto-tc` +
  `PingFang TC` / `--font-noto-hk` + `PingFang HK` (`lib/fonts.ts`, same loading policy).
  OG images embed the matching weight-700 subset, regenerated by `npm run og:fonts`
  (`scripts/build-og-fonts.ts`) from the copy in each locale's `seo.json`; the OG tests
  fail when a subset no longer covers its copy.
- **Hangul (Korean).** Noto Sans KR is the Korean cut of the same family, loaded with the
  same policy (`--font-noto-kr`); `html:lang(ko)` swaps it into `--cjk-font-stack`, so
  Korean falls through per glyph like Chinese (Latin tokens stay in Clash / Inter). The
  CJK heading rule (weight 700, tracking 0) covers `:lang(ko)` too, and `html:lang(ko)`
  sets `word-break: keep-all` — the browser's CJK default breaks a Korean word between
  syllables, which is the most visible typographic defect in Korean web copy;
  `.font-mono` opts back into `break-all` so addresses still wrap.
- **Kanji and kana (Japanese).** Noto Sans JP is the Japanese cut (`--font-noto-jp`): its
  kanji follow the JIS glyph standard, which differs from every Chinese cut (直, 骨, 令 are
  drawn differently), and it carries the kana the Chinese cuts only nominally cover.
  `html:lang(ja)` swaps it into `--cjk-font-stack` with the Japanese system faces as
  fallbacks and sets `line-break: strict` (kinsoku: no line starts with a small kana or ー);
  it deliberately does **not** set `keep-all`, which is right for Korean and wrong for a
  language with no word spaces. Display headings additionally opt into
  `word-break: auto-phrase` so browsers that support it break between phrases rather than
  mid-word. The CJK heading, tracking, and mono rules cover `:lang(ja)` alongside `zh` and
  `ko`. The white-paper PDF binds Hiragino's separately named weights explicitly
  (`BoldFont={Hiragino Mincho ProN W6}`), because fontspec cannot infer them.
- **The companion face is a registry.** `LOCALE_COMPANION_FONTS` in `lib/fonts.ts` records
  one face (or `null`) per locale, `RootDocument` derives its font-variable classes from
  it, and `OG_TYPOGRAPHY` (`lib/og/fonts.ts`) + `OG_FONT_SOURCES`
  (`scripts/build-og-fonts-core.ts`) do the same for the OG subsets — all four cuts and
  Onest are built by one `npm run og:fonts` run, and a unit test fails when the two OG
  registries disagree or a notice is missing from `THIRD_PARTY_NOTICES.md`.
- `RootDocument` receives `locale` and sets `<html lang={locale}>` and `<html dir>` (from
  `LocaleConfig.textDirection`) — this is also what activates the CSS overrides and
  correct line-breaking behavior.

**Cyrillic (Ukrainian).** Inter's build-time CSS already declares the `cyrillic` and
`cyrillic-ext` `unicode-range` slices, so body text needs nothing extra and those slices
are fetched on demand only (never preloaded — English pages must not pay for them).
Clash Display, however, has no Cyrillic glyphs, so `/uk` headings switch to **Onest**
(`next/font/google`, `--font-onest`, `preload: false`, `display: 'optional'` — the same
policy as Noto Sans SC). The display stack is indirected through the
`--display-font-stack` custom property in `styles/global.css`: `html[lang='uk']` replaces
the whole stack rather than appending Onest after Clash, so Latin letters inside a
Ukrainian heading (ETH, CST, brand names) do not render in a different face with a
different x-height. OG images for `/uk` load `assets/fonts/Onest-700.subset.ttf`, cut by
`npm run og:fonts` like the CJK subsets, through `lib/og/fonts.ts`.

**Vietnamese (Latin with stacked diacritics).** Vietnamese is written in the Latin
alphabet, but with 134 letters the Latin-1 repertoire does not have: the horned Ơ/Ư, the
breve Ă, and up to two marks stacked on one vowel (ế, ợ, ữ, ẫ — the Latin Extended
Additional block, U+1EA0–1EF9). Inter's build-time CSS declares a `vietnamese`
`unicode-range` slice, so body text again needs nothing extra. Clash Display, a display face
with a Western-European repertoire, carries only 44 of those letters, so a Vietnamese
heading set in it would fall back glyph by glyph — one word in two faces. Vietnamese
therefore reuses the Ukrainian solution: `LOCALE_COMPANION_FONTS.vi` is Onest, and the
`--display-font-stack` rule in `styles/global.css` lists `html[lang='uk'], html:lang(vi)`
together. Google Fonts serves Onest's Vietnamese slice in the same CSS, and next/font
self-hosts every slice when `preload` is off; the `subsets` option only names slices to
preload and is validated against next/font's bundled font metadata, which predates Onest's
Vietnamese coverage — so the option stays on the Cyrillic and Latin sets while the
Vietnamese slice ships regardless (the comment on `onest` in `lib/fonts.ts` records this).
The OG subset is shared too: `OG_TYPOGRAPHY.uk` and `.vi` point at one `Onest-700.subset.ttf`,
and `npm run og:fonts` cuts every shared file once from the **union** of the copy of every
locale that embeds it (`ogFontBuilds` in `scripts/build-og-fonts-core.ts`);
`sourceRegistryProblems` rejects two locales that embed one file under different sources
or family names. Two rules generalize from this rollout: (1) a display face is a per-locale
decision, never a per-script one — check the actual letter repertoire, since "Latin"
covers Vietnamese and Clash Display does not; (2) stacked diacritics need vertical room, so
never set Vietnamese below `line-height: 1.3`. The white-paper PDF uses the same macOS
faces as the Ukrainian build (Times New Roman, Helvetica Neue, Menlo), which carry the
full Vietnamese repertoire; Latin Modern does not.

## 6. SEO, metadata, and structured data

- **`utils/seo.ts` → `createMetadata`** gains a `locale` + `path` requirement and emits:
  - `alternates.canonical` — locale-correct (`/zh/faq` canonicalizes to `/zh/faq`),
  - `alternates.languages` — hreflang map: `en` → unprefixed URL, `zh` → `/zh` URL,
    `x-default` → English,
  - `openGraph.locale` — `en_US` / `zh_CN` / `uk_UA` from `LocaleConfig.ogLocale` (also fix
    the hardcoded value in `app/root-metadata.ts` and the landing layout).
- **Page metadata** moves from inline strings into the `meta` namespace; `generateMetadata`
  reads `params.locale` and calls `getTranslations`. (~59 pages, tracked per-route in
  progress-zh.md.)
- **`app/sitemap.ts` / `lib/seoRoutes.ts`**: every URL entry gains `alternates.languages`.
- **JSON-LD** (`utils/jsonLd.ts`): translated `name`/`description`, `inLanguage: 'zh-Hans'`
  on zh pages; FAQ JSON-LD uses the zh FAQ content.
- **OG images** (`opengraph-image.tsx` files): `ImageResponse` needs an explicit CJK font
  buffer (subset Noto Sans SC TTF in `assets/`) — Latin-only fonts render tofu. Scheduled
  as its own Sprint 7 item.
- **`public/llms.txt`**: add a Chinese section at the end of the rollout.

## 7. Guardrails (CI)

1. **Catalog integrity — `scripts/i18n-parity.ts` / `scripts/i18n-parity-core.ts`**:
   for every locale in `routing.locales` (the `messages/` tree must mirror it exactly),
   compares each namespace against `messages/en/**` and checks key parity, ICU syntax
   (the same `@formatjs` parser next-intl uses), placeholder parity (same `{arguments}`,
   no invented `<tags>`), plural completeness against the locale's CLDR categories
   (`one/few/many/other` for uk, `other` for zh, ko, ja, and vi), and verbatim-copy catalogs. It
   then reports every long-form content area (`scripts/i18n-content-areas.ts`) as the
   share of prose still identical to the English, and `--strict` fails an area that is
   untranslated — a scaffolded module cannot ship as a translation. `npm run
i18n:parity` reports; `npm run i18n:strict` fails CI and pre-push (via `npm run
i18n:check`). The same checks run under jest in
   `i18n/__tests__/catalog-integrity.test.ts`.
2. **Lexicon scan**: `scripts/lexicon-scan-core.ts` declares one `LexiconProfile` per
   translated locale (`LEXICON_PROFILES`, typed against `TranslatedLocale`): the Chinese
   lists are matched as CJK substrings, the uk list as Unicode-bounded word forms plus
   word-initial stems (`\b` is ASCII-only, so Cyrillic needs `\p{L}` boundaries — see
   `scripts/locale-text-matchers.ts`), the ko list as Hangul substrings (compounds join
   without spaces and particles attach to the noun; `KO_BANNED_TERMS` documents the
   innocent words each entry was checked against). The Traditional locales share `ZH_HANT_BANNED_TERMS`
   and add regional registers (`ZH_TW_BANNED_TERMS`: 博弈, 競標, 報酬…; `ZH_HK_BANNED_TERMS`:
   六合彩, 派彩, 回報…), and the ja list (`JA_BANNED_TERMS`) is matched as substrings too,
   with the same innocent-word audit (ロト hides in プロトコル, ベット in アルファベット, プレイ
   in ディスプレイ, so the list carries 宝くじ / ベッティング / プレイヤー instead). The vi list
   (`VI_BANNED_TERMS`) is matched as Unicode-bounded whole words (`unicode-word`, never the
   ASCII `latin-word` matcher, whose `\b` breaks at every diacritic); because Vietnamese
   spaces every syllable, a word boundary is a syllable boundary, so a bare syllable that
   an innocent compound contains is never listed and its compounds are (thưởng thức "to
   appreciate" stays legal, giải thưởng does not; lời nhắn "message" stays legal, kiếm lời
   does not). Every vi entry carries a diacritic or a Vietnamese-only spelling so the
   profile can never re-flag English. A profile
   runs on every locale-agnostic file and on every file of another language written in a
   different **script family**, but not on a sibling variant of its own language and not on
   another language of the same family: sibling variants share characters while their
   registers differ (Hong Kong bans 回報 "return"; Taiwan writes 回報問題 "report an
   issue"), and Chinese and Japanese share Han characters while their vocabularies differ
   (Japanese bans 利益 "profit" where Chinese 利益 "interest" is ordinary; Taiwan bans 報酬
   where Japanese 報酬 is plain "remuneration"). Each locale declares its family in
   `LocaleConfig.scriptFamily` (`latin` / `han` / `hangul` / `cyrillic`); Korean and
   Ukrainian checks therefore still run on Japanese and Chinese files, where they can only
   match genuinely stray copy, and the Vietnamese profile (family `latin`) never runs on
   English files — which is why its entries must never be plain ASCII. File ownership and this scoping are resolved by
   `checkAppliesTo` in `scripts/locale-files.ts`, shared by all three CLIs. Same allow-pragma mechanism for FAQ/legal denial copy; JSON
   catalogs, which cannot carry pragmas, use `\uXXXX` escapes for denial copy.
3. **Terminology gate**: `scripts/terminology-consistency.ts` iterates
   `TRANSLATED_LOCALES`, scanning `messages/<locale>/**` and `content/**/*.<locale>.ts`
   with the locale's rule pack from `scripts/terminology/<locale>.ts` (drift variants for
   inflected languages are stems; the vi pack uses `unicode-word` and lists only
   multi-syllable variants, for the same boundary reason as the lexicon). The `zh-TW` and
   `zh-HK` packs also catch cross-variant
   vocabulary (網絡 in Taiwan copy, 網路 in Hong Kong copy, 使用者 vs 用戶), which is what
   makes a Traditional site read as "converted" to a native reader.
4. **Copy conventions** — `scripts/i18n-conventions.ts` (`npm run i18n:conventions`, part
   of `i18n:check`; jest twin `i18n/__tests__/conventions.test.ts`): one
   `LOCALE_CONVENTIONS` entry per translated locale in `scripts/i18n-conventions-core.ts`
   (`null` when the language has no mechanical conventions worth a gate). One check runs
   for **every** translated locale regardless of its entry: every catalog value and copy
   module must be in Unicode Normalization Form C (`checkNormalization`). Decomposed
   diacritics (`e` + U+0302 + U+0301 for ế) render identically, so no reader notices them,
   but they break the whole-word lexicon and terminology matchers, string equality in
   tests, and the glyph sets the OG subsets are cut from; Vietnamese, with up to two marks
   per vowel, is where a paste from a decomposed source is likeliest. An entry then
   composes two kinds of check. _Script conventions_ (the Chinese locales): every catalog
   value and copy module must be a fixed point of its own OpenCC rendering (no Simplified
   character in Traditional copy and vice versa, phrase-aware, with a short allowlist of
   genuinely shared characters such as 台/里/干/准), must use its regional character
   choices (Taiwan 裡/著/台, Hong Kong 裏/着 and the standard Big5 code points rather than
   OpenCC's glyph variants 説/閲/户/税), and must use its quotation marks (「」『』 in
   Traditional copy, “” in Simplified). _Disallowed patterns_ (any language): regular
   expressions for constructions the style guide rules out, each with the reason shown in
   diagnostics — a sound-dependent Korean particle glued to an ICU placeholder, full-width
   punctuation in a language that uses ASCII marks, a pronoun the register drops.
   `ALPHABETIC_SCRIPT_PATTERNS` is the shared set for any spaced-alphabet locale (East
   Asian characters, full-width marks and alphanumerics — a paste from the wrong locale);
   `LOCALE_CONVENTIONS.vi` spreads it and adds the Vietnamese rules (no space before a
   sentence mark, a single … rather than three dots, never _quý khách_ / _quý vị_), each
   anchored to a Vietnamese letter so the TypeScript around a copy module never trips
   them. The next Latin- or Cyrillic-script locale starts from the same spread.
5. **E2E**: `e2e/locale-fixtures.ts` holds locale lists and per-locale chrome strings;
   `e2e/locale-smoke.ts` and `e2e/locale-site-qa.ts` are locale-parametrized runners that
   a three-line `<locale>-smoke.spec.ts` / `<locale>-site-qa.desktop.spec.ts` plugs into
   (the Traditional runners also assert the TC / HK Noto cut leads the CJK stack). Shared
   specs (`proxy`, `perf-guards`, `seo-raw-html`, `a11y`, `landing`) loop over the
   translated locales. The Chinese sprint suites (`zh-*.spec.ts`) stay as the historical
   acceptance record. `npm run test:e2e:locales` runs every locale suite.
6. **Unit**: tests derive expectations from `routing.locales` (`test-utils/i18n.ts`
   builds hreflang maps including aliases), so adding a locale never rewrites them;
   formatting tests pin per-locale outputs (`utils/__tests__/format-extra.test.ts`,
   `time.test.ts`). What a suite needs to know about a language — its script pattern,
   duration nouns, `llms.txt` section, Accept-Language probes — lives in the typed
   registries of `test-utils/locale-expectations.ts`, so a new locale fails to compile
   until it declares them, and `i18n/__tests__/locale-artifacts.test.ts` fails until its
   glossary, style guide, progress tracker, white-paper PDF, and OG font notice exist.
7. **Numeric claims**: `content/__tests__/copy-numeric-claims.test.ts` checks every
   locale's catalogs and long-form modules, matching duration nouns per language from
   `DURATION_NOUNS` (Korean declares a lookbehind so `8월 15일` is a date, not 15 days).

## 8. Translation workflow (per string, per page)

```mermaid
flowchart LR
  extract["Extract: replace hardcoded string with t() key + en catalog entry"]
  translate["Translate: write zh with glossary + style guide open"]
  review["Review: native fluency pass, reads zh only"]
  qa["QA: in-context check on /zh (layout, truncation, links, fonts)"]
  extract --> translate --> review --> qa
```

**Stage definitions (these are the four columns in progress-zh.md):**

- **E — Extracted.** No hardcoded user-facing string remains in the file(s); English
  catalog/content entry exists; English rendering unchanged (spot-check + tests).
- **T — Translated.** zh entry written following the glossary and style guide. Machine
  translation may _draft_, never ship: every string is rewritten by a human who reads the
  glossary first. Interpolations, units, and links verified.
- **R — Reviewed.** A native-fluency editor reads the Chinese **without looking at the
  English** and edits anything that sounds translated (style guide §8 checklist). Glossary
  deviations either fixed or promoted into a glossary change.
- **Q — QA'd.** The page is loaded under `/zh`: no overflow/truncation, correct fonts,
  correct punctuation width, tooltips open with translated content, toasts fire in
  Chinese, links keep the `/zh` prefix, numbers/dates localized, lexicon scan + parity
  green.

**Rules of engagement:**

- Extraction PRs and translation PRs are separate (extraction is mechanical and
  en-reviewable; translation review needs a Chinese reader).
- One glossary. If a translator wants a different term, they change
  [glossary-zh.md](./glossary-zh.md) in the same PR and update all prior uses (grep the
  catalogs) — no silent divergence.
- Commit prefix `i18n(zh): …`; progress-zh.md is updated in the same PR that changes status.
- `protocol-facts.ts` numbers are never restated in prose — interpolate them, exactly as
  the English does.

## 9. Running it locally

```bash
npm run dev
# dApp:    http://localhost:3000/zh   http://localhost:3000/zh-TW   http://localhost:3000/zh-HK   http://localhost:3000/uk   http://localhost:3000/ko   http://localhost:3000/ja
# landing: http://cosmicsignature.local:3000/zh-TW   (see lib/hostRouting.ts for /etc/hosts setup)
npm run i18n:parity                    # per-locale report: catalogs (translated %, identical-to-source, problems) and long-form content
npm run i18n:check                     # i18n:strict + i18n:conventions + terminology:check + lexicon:scan (pre-push runs this)
npm run i18n:scaffold -- --locale ja   # every per-locale file for a new language, then the compiler lists the registries
npm run i18n:derive -- --from zh --to zh-TW   # bootstrap a sibling-script draft (never ships as-is)
npm run og:fonts                       # regenerate every OG font subset after changing a translated og copy
npm run test:e2e:locales               # every locale's smoke/QA suites plus a11y, routing, landing, wallet
npm run white-paper:pdf                # regenerate the per-locale white-paper PDFs (pandoc + tectonic)
npm run build && npm run bundle:budget # production output and full app-home JS budget
```

To test locale detection: clear the `NEXT_LOCALE` cookie and set the browser's language to
`zh-CN` (or `zh-TW`, `zh-HK`, `uk-UA`, `ko-KR`, `vi-VN`) — visiting `/` should redirect to
`/zh` (or `/zh-TW`, `/zh-HK`, `/uk`, `/ko`, `/vi`). `zh-Hant` lands on `/zh-TW`, `zh-MO` on
`/zh-HK`, `zh-SG` on `/zh`, `ko-KP` on `/ko`.

## 10. Adding the next language

One command writes the files, the compiler lists the decisions, and the test suite lists
the artifacts — there is no grep step. The Korean rollout is the worked example for a new
language (a non-Latin script with its own conventions gate and companion font); the
Ukrainian rollout is the earlier worked example; the Vietnamese rollout is the worked
example for a Latin-script language whose letters the display face lacks (a shared
companion face and OG subset, a whole-word banned register, the alphabetic conventions
spread); the Taiwan and Hong Kong rollouts are the worked example for a new variant of an
existing language (same steps, plus §10.1).

1. **Scaffold the files:** `npm run i18n:scaffold -- --locale <bcp47>` (the canonical tag
   browsers send: the bare language code for the CLDR default variant, region-qualified
   codes for further variants). It writes `messages/<locale>/*.json` as copies of the
   English, every `content/**` copy module with its identifiers renamed (`faqTextEn` →
   `faqTextKo`), `scripts/terminology/<locale>.ts`, `e2e/<locale>-smoke.spec.ts` and
   `<locale>-site-qa.desktop.spec.ts` (Latin font defaults), and
   `docs/i18n/{glossary,style-guide,progress}-<locale>.md` templates with the real catalog
   key counts — then prints the steps below. Nothing it writes is copy: `npm run
i18n:strict` reports every catalog and content area as UNTRANSLATED until it is rewritten.
2. **Register the locale in [`i18n/routing.ts`](../../i18n/routing.ts)** and run
   `npm run type-check`. Every `LocaleRecord<T>` / `Record<TranslatedLocale, T>` in the
   codebase now fails to compile until it has an entry, each next to the decision it needs:
   - `LOCALE_LABELS` (routing.ts) — the language's own name for the switcher (for
     variants, in the variant's own script and region wording: 繁體中文（香港）); it also
     labels the crawlable language directory in both footers;
     `LOCALE_ALIASES` — extra tags the locale serves (`zh-Hant`, `zh-MO`); they become
     hreflang alternates and `normalizeLocale` hits. Empty is fine.
   - `i18n/localeConfig.ts` — Intl tag, `og:locale`, JSON-LD `inLanguage`, text direction,
     word spacing (Korean spaces words, Chinese does not), week start (check CLDR: Taiwan,
     Hong Kong, and Korea start on Sunday, the mainland and Ukraine on Monday), ellipsis,
     mid-sentence lowercasing, provider-error policy.
   - Format registries in `utils/format.ts` / `utils/time.ts` — date and duration
     templates (prefer `Intl` over hand-kept month/unit arrays; see the `uk` and `ko`
     entries, which delegate to `Intl.DateTimeFormat` / `Intl.RelativeTimeFormat`).
   - Single-consumer registries: RainbowKit locale in `components/wallet/WalletUi.tsx`,
     the companion face in `LOCALE_COMPANION_FONTS` (`lib/fonts.ts`), OG typography in
     `lib/og/fonts.ts` and its source in `scripts/build-og-fonts-core.ts` (a font subset if
     the script is not Latin), OG copy in `lib/og/copy.ts`, error catalogs in
     `app/global-error.tsx`, the white-paper PDF typography in
     `scripts/generate-white-paper-pdf.ts` (output paths derive from the locale); the
     `getTranslations` mock in `jest.setup.ts` resolves any locale.
   - Every `content/*/index.ts` text registry and `content/legal/index.ts` copy registry —
     import the scaffolded modules; their mapped types reject missing or extra ids, so
     partial translations cannot ship.
   - `LEXICON_PROFILES` in `scripts/lexicon-scan-core.ts` (banned register + matcher for
     the script — `cjk-substring` for unspaced scripts, `unicode-word` for a spaced
     alphabet with diacritics, `unicode-stem` for an inflected one; never `latin-word`
     for anything but English), `TERMINOLOGY_PACKS` in `scripts/terminology-consistency-core.ts` (drift
     rules in `scripts/terminology/<locale>.ts`), and `LOCALE_CONVENTIONS` in
     `scripts/i18n-conventions-core.ts` (script checks for a second Chinese script,
     disallowed patterns for anything a regular expression can catch — Korean's particle,
     punctuation, pronoun, and double-passive rules are the model — `null` when the
     language needs neither).
   - `LOCALE_CHROME`, `LOCALE_SEO`, and `LOCALE_ROUTE_TEXT` in `e2e/locale-fixtures.ts`
     (the strings the rendered pages must contain — decide them here, then make the copy
     match), and the test registries in `test-utils/locale-expectations.ts` (script
     pattern, duration nouns, `llms.txt` section, Accept-Language probes).
3. **Write `glossary-<locale>.md` and `style-guide-<locale>.md` first** — every batch of
   copy depends on the coined terms. Record terms the English never coined in the
   glossary the first time a sentence needs them (glossary-ko.md §3.2 is the model) and
   encode drift in the terminology pack so the gate enforces them.
4. **Translate.** Catalogs and modules in batches against the glossary; after each batch
   `npm run i18n:check` (parity, conventions, terminology, lexicon) and the numeric-claims
   test; then the blind read of style guide §8 with the English hidden. `npm run
i18n:parity` shows progress per namespace and per content area; untranslated catalog
   values fall back to English at runtime while in progress, long-form modules do not.
5. **Typography:** check the display face against the language's actual letter
   repertoire, not its script name — "Latin" covers Vietnamese, and Clash Display does not
   (`lib/__tests__/display-font-coverage.test.ts` fails when a locale with no companion
   face has glyphs Clash Display lacks). If the repertoire is outside Clash Display /
   Inter, add a companion face with the Noto Sans / Onest loading policy and an
   `html:lang()` override of the relevant stack property (§5; a face shared with an
   existing locale joins that locale's selector list and OG subset), pin it in the
   locale's site-QA profile, and run `npm run og:fonts`, recording the license in
   `THIRD_PARTY_NOTICES.md`. `lib/__tests__/fonts-policy.test.ts` proves every entry in
   `LOCALE_COMPANION_FONTS` is referenced by a rule scoped to its locale. hreflang
   maps, the sitemap, `<html lang/dir>`, and the language switcher derive from
   `routing.locales` automatically.
6. **Artifacts** (`i18n/__tests__/locale-artifacts.test.ts` fails until they exist): the
   locale sections of `public/llms.txt` / `public/llms-full.txt`, `npm run white-paper:pdf
-- --locale <locale>`, the lexicon table column in `AGENTS.md`, and the progress tracker.

### 10.1 Adding a variant of an existing language

A variant (another script or region of a language already shipped) is a full locale — its
own catalogs, copy, glossary, gates, fixtures — never a conversion layer at runtime. What
is different is how the copy starts and what the gates must additionally catch:

1. Register it with the region-qualified code and an alias list (`zh-HK`, `['zh-MO']`);
   pin negotiation in `i18n/__tests__/negotiation.test.ts` (which runs
   `scripts/i18n-negotiation-probe.ts`, next-intl's exact matcher call) and canonicalization
   in `i18n/__tests__/locale.test.ts` (`normalizeLocale`), then confirm by setting the
   browser language.
2. `npm run i18n:derive -- --from <sibling> --to <variant>` writes a mechanical draft:
   OpenCC conversion, the target's quotation marks, character-form normalization, and the
   glossary substitutions declared for the pair in `scripts/i18n-derive-variant-core.ts`.
   Extend that table as the glossary grows so the next derivation starts closer. Register
   the generated modules in `content/*/index.ts`.
3. Write the glossary as a **difference document** against the sibling: which coined terms
   diverge and why (錨定配發 vs 錨定派發), the everyday vocabulary that marks the variant
   (使用者 vs 用戶), the character choices (裡/裏), and the banned words the region actually
   uses for the banned concepts (博弈 vs 博彩). Encode each of those in, respectively, the
   terminology pack, the terminology pack, `LOCALE_CONVENTIONS`, and the lexicon profile.
4. Rewrite the draft against the glossary and style guide — the copy stage is the work.
   The sibling's fixtures in `e2e/locale-fixtures.ts` are the template for the variant's
   route texts, but pin the variant's own vocabulary so the suite proves the right variant
   renders, not just the right script.
5. If the variant has its own glyph standard, give it its own font cut (§5); the shared
   heading rules stay under `html:lang(<language>)`.
