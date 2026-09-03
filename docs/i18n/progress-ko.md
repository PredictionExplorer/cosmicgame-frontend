# Korean Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-ko.md](./glossary-ko.md) ·
writing rules: [style-guide-ko.md](./style-guide-ko.md).

Korean (`ko`) landed as the sixth locale and the first scaffolded one (`npm run i18n:scaffold`),
so there is no extraction stage: every unit starts at **T** with the English catalog as its
source. Stages (defined in
[README.md §8](./README.md)):

- **T — Translated:** Korean written per glossary + style guide; `npm run i18n:check`
  green (parity, ICU syntax, placeholder parity, plural categories, lexicon, terminology,
  conventions).
- **R — Reviewed:** blind native-fluency pass (style guide §8, pass 2) by a reader who did
  not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/ko` page at 320/768/1440 (fonts,
  overflow, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                       | Done |
| --- | ---------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `ko` in `routing.locales`, `LOCALE_LABELS`, `LOCALE_ALIASES`, `LocaleConfig`                               | ✅   |
| 0.2 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, fonts   | ✅   |
| 0.3 | Typography: companion face + `html:lang(ko)` rules if needed, OG subset (`npm run og:fonts`)               | ✅   |
| 0.4 | Gates: `LEXICON_PROFILES`, `scripts/terminology/ko.ts`, `LOCALE_CONVENTIONS`                               | ✅   |
| 0.5 | Test expectations: `test-utils/locale-expectations.ts`, `e2e/locale-fixtures.ts`, `ko-smoke`, `ko-site-qa` | ✅   |
| 0.6 | `public/llms.txt` / `llms-full.txt` sections, white-paper PDF, AGENTS.md lexicon column                    | ✅   |

## Message catalogs (`messages/ko/*.json`)

| Namespace       | Keys | T   | R   | Q   |
| --------------- | ---: | --- | --- | --- |
| admin           |   56 | ✅  | ☐   | ✅  |
| allocation      |  154 | ✅  | ☐   | ✅  |
| anchoring       |  205 | ✅  | ☐   | ✅  |
| code            |   16 | ✅  | ☐   | ✅  |
| common          |   24 | ✅  | ☐   | ✅  |
| contracts       |  107 | ✅  | ☐   | ✅  |
| coordination    |   43 | ✅  | ☐   | ✅  |
| currentCycle    |  111 | ✅  | ☐   | ✅  |
| detail          |   64 | ✅  | ☐   | ✅  |
| errors          |   39 | ✅  | ☐   | ✅  |
| ethContribution |   58 | ✅  | ☐   | ✅  |
| faq             |   54 | ✅  | ☐   | ✅  |
| footer          |   35 | ✅  | ☐   | ✅  |
| formats         |   14 | ✅  | ☐   | ✅  |
| forms           |   10 | ✅  | ☐   | ✅  |
| gallery         |   72 | ✅  | ☐   | ✅  |
| gesture         |   44 | ✅  | ☐   | ✅  |
| home            |  443 | ✅  | ☐   | ✅  |
| imprint         |   20 | ✅  | ☐   | ✅  |
| landing         |   38 | ✅  | ☐   | ✅  |
| legal           |    6 | ✅  | ☐   | ✅  |
| marketing       |   59 | ✅  | ☐   | ✅  |
| meta            |  159 | ✅  | ☐   | ✅  |
| myPages         |  266 | ✅  | ☐   | ✅  |
| nav             |   68 | ✅  | ☐   | ✅  |
| publicGoods     |   10 | ✅  | ☐   | ✅  |
| search          |    5 | ✅  | ☐   | ✅  |
| seo             |  219 | ✅  | ☐   | ✅  |
| siteMap         |   96 | ✅  | ☐   | ✅  |
| statistics      |  564 | ✅  | ☐   | ✅  |
| tables          |  324 | ✅  | ☐   | ✅  |
| toasts          |  140 | ✅  | ☐   | ✅  |
| tooltips        |    3 | ✅  | ☐   | ✅  |
| traits          |  197 | ✅  | ☐   | ✅  |
| wallet          |   24 | ✅  | ☐   | ✅  |

## Long-form content (`content/**/*.ko.ts`)

| Module                                | T   | R   | Q   |
| ------------------------------------- | --- | --- | --- |
| `content/about/ko.ts`                 | ✅  | ☐   | ✅  |
| `content/faq/text.ko.ts`              | ✅  | ☐   | ✅  |
| `content/how-it-works/text.ko.ts`     | ✅  | ☐   | ✅  |
| `content/landing/text.ko.ts`          | ✅  | ☐   | ✅  |
| `content/learn/text.ko.ts`            | ✅  | ☐   | ✅  |
| `content/legal/AuditsContent.ko.ts`   | ✅  | ☐   | ✅  |
| `content/legal/PrivacyContent.ko.ts`  | ✅  | ☐   | ✅  |
| `content/legal/RiskContent.ko.ts`     | ✅  | ☐   | ✅  |
| `content/legal/SecurityContent.ko.ts` | ✅  | ☐   | ✅  |
| `content/legal/TermsContent.ko.ts`    | ✅  | ☐   | ✅  |
| `content/quiz/text.basic.ko.ts`       | ✅  | ☐   | ✅  |
| `content/quiz/text.ko.ts`             | ✅  | ☐   | ✅  |
| `content/quiz/text.hard.ko.ts`        | ✅  | ☐   | ✅  |
| `content/quiz/text.medium.ko.ts`      | ✅  | ☐   | ✅  |
| `content/white-paper/text.ko.ts`      | ✅  | ☐   | ✅  |

## Notes

- **T** is complete for every unit: 3,747 catalog keys and every long-form module are in
  Korean, `npm run i18n:check` is green (key parity, ICU syntax, placeholder parity, the
  single `other` plural category, lexicon, terminology, the five Korean convention
  patterns), and the numeric-claims guard pins every percentage, duration, and CST amount
  to `protocol-facts.ts` across the Korean sources (with the `8월 15일` date lookbehind).
- **Q** is complete through the automated in-context pass: `e2e/ko-site-qa.desktop.spec.ts`
  renders all 67 routes at 320/768/1440 (`lang="ko"`, Korean headings and metadata, no
  English fallbacks, Noto Sans KR leading every Hangul heading, `/ko`-preserving links, no
  horizontal overflow, noindex policy), `e2e/ko-smoke.spec.ts` covers the chrome, 404,
  site map, and the switcher round-trip with cookie persistence on desktop and mobile, and
  the shared `proxy`, `a11y`, `landing`, and `seo-raw-html` specs run their `/ko` cases.
  Screenshots of the landing hero, dApp home, gallery, FAQ, How It Works, Learn, white
  paper, and statistics at all three widths were reviewed; the PDF cover and table of
  contents were checked for Hangul rendering and counter spacing.
- The **R** column is a human review stage: the Korean was authored against the glossary
  and style guide, passed every machine gate, and then went through a second,
  English-hidden read that rewrote 238 strings — but a blind fluency pass by a native
  Korean reader who did not write the strings has not been performed yet. Treat ☐ in R as
  the honest state, not as an omission. Reviewer attention points collected during
  authoring:
  - The coined pair 수호 챔피언 / 시간의 전사 (Endurance Champion / Chrono-Warrior) and
    별빛 선정 (Stellar Selection) are the most opinionated coinages; the rejected
    alternatives are recorded in glossary §2.
  - 앵커링 (Anchoring) was kept as a loanword over 고정/정박; 예치 and 스테이킹 are banned.
  - 마감 doubles as "deadline" in Korean; every use here means the cycle's finalization.
    The _Finish_ trait is 질감 for that reason.
  - Questions use -인가요 / -나요 (FAQ, quiz, tooltips) and the reader honorific -시- in
    direct address (준비되셨나요?); a reviewer may prefer -입니까 in the legal pages.
  - Denial copy names banned concepts through JSON `\u` escapes and TS pragmas, following
    the en/zh/uk convention; rephrase if the team prefers zero banned vocabulary there.
  - `Random Walk NFT` vs `RandomWalk NFT` mirrors each English source string (glossary
    §3.2); the English itself is inconsistent.
  - Legal pages define (이하 “회사”) once for "we/our" — a standard Korean drafting
    device, and the one thing added beyond the English; a Korean legal reviewer should
    confirm the party naming and the 만 18세 / 준거법 / 손해 배상 clauses.
