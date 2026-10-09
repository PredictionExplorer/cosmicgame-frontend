# Taiwan Traditional Chinese — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-zh-TW.md](./glossary-zh-TW.md) ·
writing rules: [style-guide-zh-TW.md](./style-guide-zh-TW.md).

`zh-TW` landed together with `zh-HK` as the first _variants_ of an already-shipped language.
There is no extraction stage; every unit starts from the mechanical draft written by
`npm run i18n:derive -- --from zh --to zh-TW` (OpenCC Taiwan conversion + the glossary
substitutions in `scripts/i18n-derive-variant-core.ts`) and moves through the stages of
[README.md §8](./README.md#8-translation-workflow-per-string-per-page):

- **D — Derived:** mechanical draft in place; `npm run i18n:check` green (parity, ICU,
  plurals, script conventions, terminology, lexicon).
- **T — Transcreated:** the draft rewritten for a Taipei reader per glossary and style
  guide — vocabulary, register, sentence rhythm — not merely converted.
- **R — Reviewed:** blind native-fluency pass (style-guide-zh-TW §8) by a Taiwan reader who
  did not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/zh-TW` page at 320/768/1440 (TC font
  cut, overflow, 「」, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                                               | Done |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `zh-TW` in `routing.locales`, `LOCALE_LABELS` (繁體中文（台灣）), `LOCALE_ALIASES` (`zh-Hant`), `LocaleConfig` (Sunday week start) | ✅   |
| 0.2 | `normalizeLocale` resolves sub-locales (exact → alias → script/region); `splitLocalePrefix` longest-first, case-insensitive        | ✅   |
| 0.3 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG copy/fonts, wallet (RainbowKit `zh-TW`), global-error, PDF  | ✅   |
| 0.4 | Noto Sans TC via `--cjk-font-stack` + `html:lang(zh-TW)`; `NotoSansTC-700.subset.ttf` for OG images (`npm run og:fonts`)           | ✅   |
| 0.5 | Gates: `ZH_HANT_BANNED_TERMS` + `ZH_TW_BANNED_TERMS`, `scripts/terminology/zh-TW.ts`, `LOCALE_CONVENTIONS['zh-TW']`                | ✅   |
| 0.6 | hreflang aliases (`zh-Hant` → `/zh-TW`) in metadata and both sitemaps                                                              | ✅   |
| 0.7 | E2E: `LOCALE_CHROME` / `LOCALE_SEO` / `LOCALE_ROUTE_TEXT`, `zh-TW-smoke`, `zh-TW-site-qa.desktop`, landing loop                    | ✅   |
| 0.8 | `public/llms.txt` / `llms-full.txt` Taiwan sections; white-paper PDF (`Songti TC` / `PingFang TC`)                                 | ✅   |

## Message catalogs (`messages/zh-TW/*.json`)

| Namespace       | Keys | D   | T   | R   | Q   |
| --------------- | ---: | --- | --- | --- | --- |
| admin           |   56 | ✅  | ✅  | ☐   | ☐   |
| allocation      |  154 | ✅  | ✅  | ☐   | ☐   |
| anchoring       |  205 | ✅  | ✅  | ☐   | ☐   |
| code            |   16 | ✅  | ✅  | ☐   | ☐   |
| common          |   24 | ✅  | ✅  | ☐   | ☐   |
| contracts       |  107 | ✅  | ✅  | ☐   | ☐   |
| coordination    |   43 | ✅  | ✅  | ☐   | ☐   |
| currentCycle    |  111 | ✅  | ✅  | ☐   | ☐   |
| detail          |   64 | ✅  | ✅  | ☐   | ☐   |
| errors          |   39 | ✅  | ✅  | ☐   | ☐   |
| ethContribution |   58 | ✅  | ✅  | ☐   | ☐   |
| faq             |   54 | ✅  | ✅  | ☐   | ☐   |
| footer          |   35 | ✅  | ✅  | ☐   | ☐   |
| formats         |   14 | ✅  | ✅  | ☐   | ☐   |
| forms           |   10 | ✅  | ✅  | ☐   | ☐   |
| gallery         |   72 | ✅  | ✅  | ☐   | ☐   |
| gesture         |   44 | ✅  | ✅  | ☐   | ☐   |
| home            |  443 | ✅  | ✅  | ☐   | ☐   |
| imprint         |   20 | ✅  | ✅  | ☐   | ☐   |
| landing         |   38 | ✅  | ✅  | ☐   | ☐   |
| legal           |    6 | ✅  | ✅  | ☐   | ☐   |
| marketing       |   59 | ✅  | ✅  | ☐   | ☐   |
| meta            |  159 | ✅  | ✅  | ☐   | ☐   |
| myPages         |  266 | ✅  | ✅  | ☐   | ☐   |
| nav             |   68 | ✅  | ✅  | ☐   | ☐   |
| publicGoods     |   10 | ✅  | ✅  | ☐   | ☐   |
| search          |    5 | ✅  | ✅  | ☐   | ☐   |
| seo             |  237 | ✅  | ✅  | ☐   | ☐   |
| siteMap         |   96 | ✅  | ✅  | ☐   | ☐   |
| statistics      |  564 | ✅  | ✅  | ☐   | ☐   |
| tables          |  324 | ✅  | ✅  | ☐   | ☐   |
| toasts          |  140 | ✅  | ✅  | ☐   | ☐   |
| tooltips        |    3 | ✅  | ✅  | ☐   | ☐   |
| traits          |  197 | ✅  | ✅  | ☐   | ☐   |
| wallet          |   24 | ✅  | ✅  | ☐   | ☐   |

## Long-form content (`content/**/*.zh-TW.ts`)

| Area                                          | D   | T   | R   | Q   |
| --------------------------------------------- | --- | --- | --- | --- |
| landing (`content/landing`)                   | ✅  | ✅  | ☐   | ☐   |
| about (`content/about/zh-TW.ts`)              | ✅  | ✅  | ☐   | ☐   |
| learn (`content/learn`)                       | ✅  | ✅  | ☐   | ☐   |
| how-it-works (`content/how-it-works`)         | ✅  | ✅  | ☐   | ☐   |
| faq (`content/faq`)                           | ✅  | ✅  | ☐   | ☐   |
| white paper (`content/white-paper`)           | ✅  | ✅  | ☐   | ☐   |
| quiz hub + basic / medium / hard tiers        | ✅  | ✅  | ☐   | ☐   |
| legal: terms, privacy, risk, security, audits | ✅  | ✅  | ☐   | ☐   |

## Notes

- **T is a vocabulary-and-register pass on top of the derivation.** The derivation already
  carries the glossary (錨定配發, 公共財, 網站導覽, 使用者, 網路, 資訊, 預設, 設定, 載入,
  紀錄 as a noun, 透過, 台); the T pass fixed what tables cannot: 支持 vs 支援 by sense,
  wallet 連接 vs network 連線, 刷新紀錄 vs 重新整理頁面, 質量 (mass) vs 品質, 「」 for the
  ASCII quotes the source used, and the OpenCC artefacts listed in style-guide-zh-TW §8.
- **R is deliberately open.** The copy was written by a non-native author against the
  glossary; the blind Taiwan-reader pass is the next step before the page-level Q pass.
- Every derivation improvement found during T was pushed back into
  `TW_SUBSTITUTIONS` so the next `i18n:derive` starts closer to done.
