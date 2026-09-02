# Ukrainian Translation — Progress Tracker

Living document. **Update it in the same PR as the work it records.** Architecture and
workflow: [README.md](./README.md) · terminology: [glossary-uk.md](./glossary-uk.md) ·
writing rules: [style-guide-uk.md](./style-guide-uk.md).

Ukrainian (`uk`) landed as the third locale after the Chinese rollout had already made
the codebase locale-generic, so there is no extraction stage: every unit starts at
**T** with the English catalog as its source. Stages (defined in
[README.md §8](./README.md)):

- **T — Translated:** Ukrainian written per glossary + style guide; `npm run i18n:check`
  green (parity, ICU syntax, placeholder parity, four plural categories, lexicon,
  terminology).
- **R — Reviewed:** blind native-fluency pass (style guide §8, pass 2) by a Ukrainian
  reader who did not write the strings.
- **Q — QA'd:** verified in-context on the rendered `/uk` page at 320/768/1440 (fonts,
  overflow, tooltips, toasts, locale-preserving links).

Cells contain `☐` (not done) → replace with `✅` when the stage is complete.

## Foundations (no visible copy)

| #   | Task                                                                                                                    | Done |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---- |
| 0.1 | `uk` in `routing.locales`, `LOCALE_LABELS`, `LocaleConfig` (+ `textDirection` → `<html dir>`)                           | ✅   |
| 0.2 | Every `LocaleRecord` registry: content indexes, legal, format/time, OG, wallet, global-error, PDF, jest setup           | ✅   |
| 0.3 | Onest display companion (`lib/fonts.ts`, `html[lang='uk']` display stack) + Onest 700 Latin/Cyrillic OG subset          | ✅   |
| 0.4 | Locale-generic gates: `i18n-parity-core` (ICU/plurals/args), lexicon profiles, terminology packs, pre-push `i18n:check` | ✅   |
| 0.5 | Unit tests derive expectations from `routing.locales`; uk format/time/switcher/OG/global-error pins                     | ✅   |
| 0.6 | E2E: `uk-smoke`, `uk-site-qa.desktop`, `/uk` cases in shared specs, `test:e2e:locales`                                  | ✅   |

## Message catalogs (`messages/uk/*.json`)

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
| wallet          |   22 | ✅  | ☐   | ✅  |

## Long-form content (`content/**/*.uk.ts`)

| Area                                 | Module(s)                                                       | T   | R   | Q   |
| ------------------------------------ | --------------------------------------------------------------- | --- | --- | --- |
| Landing site                         | `content/landing/text.uk.ts`                                    | ✅  | ☐   | ✅  |
| Learn hub + 11 articles              | `content/learn/text.uk.ts`                                      | ✅  | ☐   | ✅  |
| How It Works                         | `content/how-it-works/text.uk.ts`                               | ✅  | ☐   | ✅  |
| About                                | `content/about/uk.ts`                                           | ✅  | ☐   | ✅  |
| FAQ                                  | `content/faq/text.uk.ts`                                        | ✅  | ☐   | ✅  |
| Quiz (hub + basic / medium / hard)   | `content/quiz/text.uk.ts`, `text.{basic,medium,hard}.uk.ts`     | ✅  | ☐   | ✅  |
| White paper (+ PDF)                  | `content/white-paper/text.uk.ts`, `public/white-paper/*-uk.pdf` | ✅  | ☐   | ✅  |
| Terms / Privacy                      | `content/legal/TermsContent.uk.ts`, `PrivacyContent.uk.ts`      | ✅  | ☐   | ✅  |
| Security / Audits / Risk Disclosures | `content/legal/{Security,Audits,Risk}Content.uk.ts`             | ✅  | ☐   | ✅  |
| AI-facing docs                       | `public/llms.txt`, `public/llms-full.txt` (Ukrainian sections)  | ✅  | ☐   | ✅  |

## Notes

- **T** is complete for every unit: 3 745 catalog keys and every long-form module are in
  Ukrainian, `npm run i18n:check` is green (key parity, ICU syntax, placeholder parity,
  four plural categories, lexicon, terminology), and the numeric-claims guard pins every
  percentage, duration, and CST amount to `protocol-facts.ts` across the Ukrainian
  sources.
- **Q** is complete through the automated in-context pass: `e2e/uk-site-qa.desktop.spec.ts`
  renders all 66 routes at 320/768/1440 (`lang="uk"`, Ukrainian headings and metadata,
  no English fallbacks, Onest display typography, `/uk`-preserving links, no horizontal
  overflow, noindex policy), `e2e/uk-smoke.spec.ts` covers the chrome, 404, site map,
  and the switcher round-trip with cookie persistence, and the shared `proxy`, `a11y`,
  `landing`, `seo-raw-html`, and `perf-guards` specs run their `/uk` cases. Manual
  screenshots of the landing hero, dApp home, gallery, FAQ (mobile), Learn, and white
  paper were reviewed as well.
- The **R** column is a human review stage: the initial Ukrainian was authored against
  the glossary and style guide and passes every machine gate, but a native blind-fluency
  read (style guide §8, pass 2) has not been performed yet. Treat ☐ in R as the honest
  state, not as an omission. Reviewer attention points collected during authoring:
  - «Мій кабінет» (My Dashboard), «Знайомство з проєктом» (Discover), «Огляд» (Explore),
    «Довідка» (Help) — nav vocabulary with several defensible alternatives.
  - «Тест знань» for the quiz (locked over «вікторина»), «Профіль користувача» for the
    participant statistics page title (its aria label says «Статистика користувача»).
  - «Історія отримувача» (singular, personal stats section) versus the glossary's plural
    «історія отримувачів» (public page).
  - Denial titles in `meta.json` follow the en/zh convention of JSON `\u` escapes for the
    named banned concept; rephrase if the team prefers zero banned vocabulary there.
  - The Chinese FAQ and quiz modules still interpolate English `protocolFacts` elapsed
    labels («1 hour») and use `toLocaleString()` without a locale; the Ukrainian modules
    localize both — worth back-porting.
