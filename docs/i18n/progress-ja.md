# Japanese Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-ja.md](./glossary-ja.md) ·
writing rules: [style-guide-ja.md](./style-guide-ja.md).

Every unit starts at **T** with the English catalog as its source. Stages (defined in
[README.md §8](./README.md)):

- **T — Translated:** Japanese written per glossary + style guide; `npm run i18n:check`
  green (parity, ICU syntax, placeholder parity, plural categories, lexicon, terminology,
  conventions).
- **R — Reviewed:** blind native-fluency pass (style guide §8, pass 2) by a reader who did
  not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/ja` page at 320/768/1440 (fonts,
  overflow, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                       | Done |
| --- | ---------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `ja` in `routing.locales`, `LOCALE_LABELS`, `LOCALE_ALIASES`, `LocaleConfig`                               | ✅   |
| 0.2 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, fonts   | ✅   |
| 0.3 | Typography: companion face + `html:lang(ja)` rules if needed, OG subset (`npm run og:fonts`)               | ✅   |
| 0.4 | Gates: `LEXICON_PROFILES`, `scripts/terminology/ja.ts`, `LOCALE_CONVENTIONS`                               | ✅   |
| 0.5 | Test expectations: `test-utils/locale-expectations.ts`, `e2e/locale-fixtures.ts`, `ja-smoke`, `ja-site-qa` | ✅   |
| 0.6 | `public/llms.txt` / `llms-full.txt` sections, white-paper PDF, AGENTS.md lexicon column                    | ✅   |

## Message catalogs (`messages/ja/*.json`)

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

## Long-form content (`content/**/*.ja.ts`)

| Module                                | T   | R   | Q   |
| ------------------------------------- | --- | --- | --- |
| `content/about/ja.ts`                 | ✅  | ☐   | ☐   |
| `content/faq/text.ja.ts`              | ✅  | ☐   | ☐   |
| `content/how-it-works/text.ja.ts`     | ✅  | ☐   | ☐   |
| `content/landing/text.ja.ts`          | ✅  | ☐   | ☐   |
| `content/learn/text.ja.ts`            | ✅  | ☐   | ☐   |
| `content/legal/AuditsContent.ja.ts`   | ✅  | ☐   | ☐   |
| `content/legal/PrivacyContent.ja.ts`  | ✅  | ☐   | ☐   |
| `content/legal/RiskContent.ja.ts`     | ✅  | ☐   | ☐   |
| `content/legal/SecurityContent.ja.ts` | ✅  | ☐   | ☐   |
| `content/legal/TermsContent.ja.ts`    | ✅  | ☐   | ☐   |
| `content/quiz/text.basic.ja.ts`       | ✅  | ☐   | ☐   |
| `content/quiz/text.ja.ts`             | ✅  | ☐   | ☐   |
| `content/quiz/text.hard.ja.ts`        | ✅  | ☐   | ☐   |
| `content/quiz/text.medium.ja.ts`      | ✅  | ☐   | ☐   |
| `content/white-paper/text.ja.ts`      | ✅  | ☐   | ☐   |

## Notes

- **2026-09-03 — T complete for every unit.** All 35 catalogs (3,747 keys) and 15 long-form
  modules are translated per glossary-ja.md and style-guide-ja.md; `npm run i18n:check`
  (parity, ICU, placeholders, plural categories, lexicon, terminology, conventions) is green,
  `npm test` numeric-claims and llms guards pass, the white-paper PDF is generated with
  Hiragino through xeCJK, and the OG subset covers `seo.json`.
- **Gate additions made for this locale.** `LocaleConfig.scriptFamily` and the
  `checkAppliesTo` Han-family skip (Chinese registers no longer run on Japanese files and
  vice versa); nine `LOCALE_CONVENTIONS.ja` patterns (half-width kana, full-width
  alphanumerics, U+3000, ASCII sentence punctuation after Japanese, `...` ellipsis next to
  Japanese text, spaces around Latin tokens/placeholders, second-person pronouns, dropped
  long vowels, Chinese-only characters); 130 `JA_BANNED_TERMS`; 24 terminology rules.
- **Decisions worth a reviewer's eye (R pass).** 一筆 for Gesture (calligraphic stroke;
  rejected ジェスチャー as party-game register), 調律期間 for Calibration Window (tuning, not
  校正/較正), 係留 for Anchoring (mooring; 繋留 is drift), 星選 for Stellar Selection (coined,
  glossed 星選（せいせん） on first mention in long-form copy), 拠出 for ETH/NFT
  contributions (a contribution to a common pool; 寄付 is banned), 功労CST for Recognition
  CST, 持久チャンピオン / 時の戦士 for the two persistence titles, 受け取る for Retrieve
  (回収 reserved for nothing; "swept by anyone" is 取得), and the em-dash pair —— for the
  English em dash.
- **R and Q are open.** R needs a native-fluency blind pass (style guide §8, pass 2); Q is
  the rendered `/ja` walk at 320/768/1440 with `e2e/ja-site-qa.desktop.spec.ts` as the
  automated floor.
