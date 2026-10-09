# Hong Kong Traditional Chinese — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-zh-HK.md](./glossary-zh-HK.md) ·
writing rules: [style-guide-zh-HK.md](./style-guide-zh-HK.md).

`zh-HK` landed together with `zh-TW` as the first _variants_ of an already-shipped language.
There is no extraction stage; every unit starts from the mechanical draft written by
`npm run i18n:derive -- --from zh --to zh-HK` (OpenCC Hong Kong conversion, standard Big5
character forms, the glossary substitutions in `scripts/i18n-derive-variant-core.ts`) and
moves through the stages of [README.md §8](./README.md#8-translation-workflow-per-string-per-page):

- **D — Derived:** mechanical draft in place; `npm run i18n:check` green.
- **T — Transcreated:** the draft rewritten as written Hong Kong Chinese per glossary and
  style guide — vocabulary, character choices, register — not merely converted.
- **R — Reviewed:** blind native-fluency pass (style-guide-zh-HK §8) by a Hong Kong reader
  who did not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/zh-HK` page at 320/768/1440 (HK font
  cut, overflow, 「」, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                                              | Done |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `zh-HK` in `routing.locales`, `LOCALE_LABELS` (繁體中文（香港）), `LOCALE_ALIASES` (`zh-MO`), `LocaleConfig` (Sunday week start)  | ✅   |
| 0.2 | `normalizeLocale` resolves sub-locales; CLDR negotiation sends `zh-Hant-HK`, `zh-MO`, and `yue` to `/zh-HK`                       | ✅   |
| 0.3 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG copy/fonts, wallet (RainbowKit `zh-HK`), global-error, PDF | ✅   |
| 0.4 | Noto Sans HK via `--cjk-font-stack` + `html:lang(zh-HK)`; `NotoSansHK-700.subset.ttf` for OG images (`npm run og:fonts`)          | ✅   |
| 0.5 | Gates: `ZH_HANT_BANNED_TERMS` + `ZH_HK_BANNED_TERMS`, `scripts/terminology/zh-HK.ts`, `LOCALE_CONVENTIONS['zh-HK']`               | ✅   |
| 0.6 | hreflang aliases (`zh-MO` → `/zh-HK`) in metadata and both sitemaps                                                               | ✅   |
| 0.7 | E2E: `LOCALE_CHROME` / `LOCALE_SEO` / `LOCALE_ROUTE_TEXT`, `zh-HK-smoke`, `zh-HK-site-qa.desktop`, landing loop                   | ✅   |
| 0.8 | `public/llms.txt` / `llms-full.txt` Hong Kong sections; white-paper PDF (`Songti TC` / `PingFang HK`)                             | ✅   |

## Message catalogs (`messages/zh-HK/*.json`)

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

## Long-form content (`content/**/*.zh-HK.ts`)

| Area                                          | D   | T   | R   | Q   |
| --------------------------------------------- | --- | --- | --- | --- |
| landing (`content/landing`)                   | ✅  | ✅  | ☐   | ☐   |
| about (`content/about/zh-HK.ts`)              | ✅  | ✅  | ☐   | ☐   |
| learn (`content/learn`)                       | ✅  | ✅  | ☐   | ☐   |
| how-it-works (`content/how-it-works`)         | ✅  | ✅  | ☐   | ☐   |
| faq (`content/faq`)                           | ✅  | ✅  | ☐   | ☐   |
| white paper (`content/white-paper`)           | ✅  | ✅  | ☐   | ☐   |
| quiz hub + basic / medium / hard tiers        | ✅  | ✅  | ☐   | ☐   |
| legal: terms, privacy, risk, security, audits | ✅  | ✅  | ☐   | ☐   |

## Notes

- **Written Hong Kong Chinese, not Cantonese.** UI copy stays in 書面語; what makes it Hong
  Kong's is the vocabulary (網絡, 軟件, 用戶, 智能合約, 私隱, 數碼, 流動裝置, 主頁, 電郵) and
  the character choices (裏, 着, and standard Big5 forms — the derive script normalizes the
  glyph-variant code points OpenCC emits: 説→說, 閲→閱, 户→戶, 税→稅, 温→溫, 啓→啟).
- **T fixed what tables cannot:** 支持 vs 支援 by sense, 交互 → 互動, 核驗 → 核實,
  線上 in the sense "live in production" → 實際運作, 「」 for the ASCII quotes the source
  used. Every improvement was pushed back into `HK_SUBSTITUTIONS`.
- **R is deliberately open.** The copy was written by a non-native author against the
  glossary; the blind Hong Kong-reader pass is the next step before the page-level Q pass.
