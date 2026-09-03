# Vietnamese Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-vi.md](./glossary-vi.md) ·
writing rules: [style-guide-vi.md](./style-guide-vi.md).

Every unit starts at **T** with the English catalog as its source. Stages (defined in
[README.md §8](./README.md)):

- **T — Translated:** Vietnamese written per glossary + style guide; `npm run i18n:check`
  green (parity, ICU syntax, placeholder parity, plural categories, lexicon, terminology,
  conventions).
- **R — Reviewed:** blind native-fluency pass (style guide §8, pass 2) by a reader who did
  not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/vi` page at 320/768/1440 (fonts,
  overflow, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                       | Done |
| --- | ---------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `vi` in `routing.locales`, `LOCALE_LABELS`, `LOCALE_ALIASES`, `LocaleConfig`                               | ✅   |
| 0.2 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, fonts   | ✅   |
| 0.3 | Typography: companion face + `html:lang(vi)` rules if needed, OG subset (`npm run og:fonts`)               | ✅   |
| 0.4 | Gates: `LEXICON_PROFILES`, `scripts/terminology/vi.ts`, `LOCALE_CONVENTIONS`                               | ✅   |
| 0.5 | Test expectations: `test-utils/locale-expectations.ts`, `e2e/locale-fixtures.ts`, `vi-smoke`, `vi-site-qa` | ✅   |
| 0.6 | `public/llms.txt` / `llms-full.txt` sections, white-paper PDF, AGENTS.md lexicon column                    | ✅   |

## Message catalogs (`messages/vi/*.json`)

| Namespace       | Keys | T   | R   | Q   |
| --------------- | ---: | --- | --- | --- |
| admin           |   56 | ✅  | ☐   | ☐   |
| allocation      |  154 | ✅  | ☐   | ☐   |
| anchoring       |  205 | ✅  | ☐   | ☐   |
| code            |   16 | ✅  | ☐   | ☐   |
| common          |   24 | ✅  | ☐   | ☐   |
| contracts       |  107 | ✅  | ☐   | ☐   |
| coordination    |   43 | ✅  | ☐   | ☐   |
| currentCycle    |  111 | ✅  | ☐   | ☐   |
| detail          |   64 | ✅  | ☐   | ☐   |
| errors          |   39 | ✅  | ☐   | ☐   |
| ethContribution |   58 | ✅  | ☐   | ☐   |
| faq             |   54 | ✅  | ☐   | ☐   |
| footer          |   35 | ✅  | ☐   | ☐   |
| formats         |   14 | ✅  | ☐   | ☐   |
| forms           |   10 | ✅  | ☐   | ☐   |
| gallery         |   72 | ✅  | ☐   | ☐   |
| gesture         |   44 | ✅  | ☐   | ☐   |
| home            |  443 | ✅  | ☐   | ☐   |
| imprint         |   20 | ✅  | ☐   | ☐   |
| landing         |   38 | ✅  | ☐   | ☐   |
| legal           |    6 | ✅  | ☐   | ☐   |
| marketing       |   59 | ✅  | ☐   | ☐   |
| meta            |  159 | ✅  | ☐   | ☐   |
| myPages         |  266 | ✅  | ☐   | ☐   |
| nav             |   68 | ✅  | ☐   | ☐   |
| publicGoods     |   10 | ✅  | ☐   | ☐   |
| search          |    5 | ✅  | ☐   | ☐   |
| seo             |  219 | ✅  | ☐   | ☐   |
| siteMap         |   96 | ✅  | ☐   | ☐   |
| statistics      |  564 | ✅  | ☐   | ☐   |
| tables          |  324 | ✅  | ☐   | ☐   |
| toasts          |  140 | ✅  | ☐   | ☐   |
| tooltips        |    3 | ✅  | ☐   | ☐   |
| traits          |  197 | ✅  | ☐   | ☐   |
| wallet          |   24 | ✅  | ☐   | ☐   |

## Long-form content (`content/**/*.vi.ts`)

| Module                                | T   | R   | Q   |
| ------------------------------------- | --- | --- | --- |
| `content/about/vi.ts`                 | ✅  | ☐   | ☐   |
| `content/faq/text.vi.ts`              | ✅  | ☐   | ☐   |
| `content/how-it-works/text.vi.ts`     | ✅  | ☐   | ☐   |
| `content/landing/text.vi.ts`          | ✅  | ☐   | ☐   |
| `content/learn/text.vi.ts`            | ✅  | ☐   | ☐   |
| `content/legal/AuditsContent.vi.ts`   | ✅  | ☐   | ☐   |
| `content/legal/PrivacyContent.vi.ts`  | ✅  | ☐   | ☐   |
| `content/legal/RiskContent.vi.ts`     | ✅  | ☐   | ☐   |
| `content/legal/SecurityContent.vi.ts` | ✅  | ☐   | ☐   |
| `content/legal/TermsContent.vi.ts`    | ✅  | ☐   | ☐   |
| `content/quiz/text.basic.vi.ts`       | ✅  | ☐   | ☐   |
| `content/quiz/text.vi.ts`             | ✅  | ☐   | ☐   |
| `content/quiz/text.hard.vi.ts`        | ✅  | ☐   | ☐   |
| `content/quiz/text.medium.vi.ts`      | ✅  | ☐   | ☐   |
| `content/white-paper/text.vi.ts`      | ✅  | ☐   | ☐   |

## Notes

- **2026-09-03 — T complete for every unit.** All 35 catalogs (3,747 keys) and 15 long-form
  modules are translated per glossary-vi.md and style-guide-vi.md; `npm run i18n:check`
  (parity, ICU, placeholders, plural categories, lexicon, terminology, conventions, NFC) is
  green, the numeric-claims and llms guards pass, the white-paper PDF is generated with the
  same macOS faces as the Ukrainian build, and the shared Onest OG subset is recut from the
  uk + vi glyph union.
- **Gate additions made for this locale.** A universal Normalization Form C check in
  `checkConventions` (every locale, with or without declared conventions);
  `ALPHABETIC_SCRIPT_PATTERNS` (East Asian characters, full-width marks and alphanumerics)
  shared by any spaced-alphabet locale plus three Vietnamese rules (space before a sentence
  mark, three-dot ellipsis, _quý khách_ / _quý vị_); 140 `VI_BANNED_TERMS` matched as Unicode
  whole words; 24 terminology rules; the numeric-claims test reads each source with its
  locale's `Intl` number marks (1.000 CST is a thousand); `ogFontBuilds` cuts a shared OG
  subset from the union of every locale that embeds it; the fonts-policy suite derives the
  `html:lang` wiring assertion from `LOCALE_COMPANION_FONTS`; a display-font coverage test
  fails when a locale without a companion face has letters Clash Display lacks.
- **Decisions worth a reviewer's eye (R pass).** nét bút for Gesture (a brush stroke;
  rejected cử chỉ as a body movement and lượt as game register), hoàn tất for Finalize
  (rejected chốt as sales slang), cửa sổ hiệu chỉnh for Calibration Window (rejected hiệu
  chuẩn as laboratory register), Tinh tuyển for Stellar Selection (coined from 星選, glossed
  once in long-form copy), neo giữ / gỡ neo for Anchoring / release, phân phối neo giữ for
  Anchor Distribution (distinct from phân bổ "allocation" and phân bố "statistical
  distribution"), nhận về for Retrieve (rhymes with người nhận), khắc for Imprint (đúc is
  banned), Quán quân Bền bỉ / Chiến binh Thời gian for the two persistence titles (rejected
  nhà vô địch as sports register), Hàng hóa công for Public Goods, Dự trữ truyền thông for
  Outreach Reserve (rejected tiếp cận as "access"), Signature kept in Latin for the artwork
  (chữ ký is the cryptographic signature), tạo sinh for both "procedural" and "generative"
  (thủ tục is paperwork), bạn for the reader and tôi only in "của tôi" labels.
- **Typography.** Clash Display carries 44 of the 132 Vietnamese letters; headings switch to
  Onest through `html:lang(uk), html:lang(vi)`. next/font's bundled Onest metadata predates
  its Vietnamese subset, so `subsets` stays on the Cyrillic and Latin sets while the slice
  ships through the CSS (`preload: false` self-hosts every slice) — see `lib/fonts.ts`.
- **2026-09-03 — automated Q floor green.** `e2e/vi-smoke.spec.ts` (Desktop + Mobile Chrome)
  and `e2e/vi-site-qa.desktop.spec.ts` (every inventoried route at 320/768/1440: script,
  Onest headings, Inter body, locale-preserving links, no English fallbacks) pass against a
  production build, alongside the full locale sweep (`npm run test:e2e:locales`). Fixture
  strings in `e2e/locale-fixtures.ts` were re-pinned to the shipped copy where the draft
  wording had moved during translation, and the white paper's app/site links now carry `/vi`
  like every other translation.
- **Language directory.** Every footer (app, landing home, and the marketing pages that had
  no footer) now carries the crawlable language directory (README §2.4), so `/vi/<path>` is
  linked from every other edition of the page and Tiếng Việt is discoverable without JS.
- **R and Q are open.** R needs a native-fluency blind pass (style guide §8, pass 2); Q is
  the human rendered `/vi` walk at 320/768/1440 (tooltips, toasts, edge states) on top of the
  automated floor above.
