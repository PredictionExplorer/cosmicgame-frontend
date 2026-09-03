# Korean Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-ko.md](./glossary-ko.md) ·
writing rules: [style-guide-ko.md](./style-guide-ko.md).

Every unit starts at **T** with the English catalog as its source. Stages (defined in
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
| 0.1 | `ko` in `routing.locales`, `LOCALE_LABELS`, `LOCALE_ALIASES`, `LocaleConfig`                               | ☐    |
| 0.2 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, fonts   | ☐    |
| 0.3 | Typography: companion face + `html:lang(ko)` rules if needed, OG subset (`npm run og:fonts`)               | ☐    |
| 0.4 | Gates: `LEXICON_PROFILES`, `scripts/terminology/ko.ts`, `LOCALE_CONVENTIONS`                               | ☐    |
| 0.5 | Test expectations: `test-utils/locale-expectations.ts`, `e2e/locale-fixtures.ts`, `ko-smoke`, `ko-site-qa` | ☐    |
| 0.6 | `public/llms.txt` / `llms-full.txt` sections, white-paper PDF, AGENTS.md lexicon column                    | ☐    |

## Message catalogs (`messages/ko/*.json`)

| Namespace       | Keys | T   | R   | Q   |
| --------------- | ---: | --- | --- | --- |
| admin           |   56 | ☐   | ☐   | ☐   |
| allocation      |  154 | ☐   | ☐   | ☐   |
| anchoring       |  205 | ☐   | ☐   | ☐   |
| code            |   16 | ☐   | ☐   | ☐   |
| common          |   24 | ☐   | ☐   | ☐   |
| contracts       |  107 | ☐   | ☐   | ☐   |
| coordination    |   43 | ☐   | ☐   | ☐   |
| currentCycle    |  111 | ☐   | ☐   | ☐   |
| detail          |   64 | ☐   | ☐   | ☐   |
| errors          |   39 | ☐   | ☐   | ☐   |
| ethContribution |   58 | ☐   | ☐   | ☐   |
| faq             |   54 | ☐   | ☐   | ☐   |
| footer          |   35 | ☐   | ☐   | ☐   |
| formats         |   14 | ☐   | ☐   | ☐   |
| forms           |   10 | ☐   | ☐   | ☐   |
| gallery         |   72 | ☐   | ☐   | ☐   |
| gesture         |   44 | ☐   | ☐   | ☐   |
| home            |  443 | ☐   | ☐   | ☐   |
| imprint         |   20 | ☐   | ☐   | ☐   |
| landing         |   38 | ☐   | ☐   | ☐   |
| legal           |    6 | ☐   | ☐   | ☐   |
| marketing       |   59 | ☐   | ☐   | ☐   |
| meta            |  159 | ☐   | ☐   | ☐   |
| myPages         |  266 | ☐   | ☐   | ☐   |
| nav             |   68 | ☐   | ☐   | ☐   |
| publicGoods     |   10 | ☐   | ☐   | ☐   |
| search          |    5 | ☐   | ☐   | ☐   |
| seo             |  219 | ☐   | ☐   | ☐   |
| siteMap         |   96 | ☐   | ☐   | ☐   |
| statistics      |  564 | ☐   | ☐   | ☐   |
| tables          |  324 | ☐   | ☐   | ☐   |
| toasts          |  140 | ☐   | ☐   | ☐   |
| tooltips        |    3 | ☐   | ☐   | ☐   |
| traits          |  197 | ☐   | ☐   | ☐   |
| wallet          |   24 | ☐   | ☐   | ☐   |

## Long-form content (`content/**/*.ko.ts`)

| Module                                | T   | R   | Q   |
| ------------------------------------- | --- | --- | --- |
| `content/about/ko.ts`                 | ☐   | ☐   | ☐   |
| `content/faq/text.ko.ts`              | ☐   | ☐   | ☐   |
| `content/how-it-works/text.ko.ts`     | ☐   | ☐   | ☐   |
| `content/landing/text.ko.ts`          | ☐   | ☐   | ☐   |
| `content/learn/text.ko.ts`            | ☐   | ☐   | ☐   |
| `content/legal/AuditsContent.ko.ts`   | ☐   | ☐   | ☐   |
| `content/legal/PrivacyContent.ko.ts`  | ☐   | ☐   | ☐   |
| `content/legal/RiskContent.ko.ts`     | ☐   | ☐   | ☐   |
| `content/legal/SecurityContent.ko.ts` | ☐   | ☐   | ☐   |
| `content/legal/TermsContent.ko.ts`    | ☐   | ☐   | ☐   |
| `content/quiz/text.basic.ko.ts`       | ☐   | ☐   | ☐   |
| `content/quiz/text.ko.ts`             | ☐   | ☐   | ☐   |
| `content/quiz/text.hard.ko.ts`        | ☐   | ☐   | ☐   |
| `content/quiz/text.medium.ko.ts`      | ☐   | ☐   | ☐   |
| `content/white-paper/text.ko.ts`      | ☐   | ☐   | ☐   |

## Notes
