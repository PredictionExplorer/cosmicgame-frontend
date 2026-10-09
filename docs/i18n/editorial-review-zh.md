# Chinese editorial review — 2026-09-04

Reviewed all 105 message catalogs and 45 content modules for `zh`, `zh-TW`, and `zh-HK`, then reviewed the Chinese sections of both AI-facing documents. This is a repository-based bilingual accuracy and fluency review; it does not claim independent human native-speaker sign-off or a full rendered-page review.

The review used each locale's frozen glossary and style guide, the English source, shared protocol facts, and the relevant component behavior. Simplified Chinese, Taiwan Traditional Chinese, and Hong Kong Traditional Chinese were treated as separate editorial locales. Script-normalized comparisons were used only to identify regional differences for inspection; new prose was written explicitly for each locale. Existing clear copy was retained.

## Changes and rationale

- Corrected concrete translation errors: Traditional JSON examples now contain valid ASCII quotation marks; table columns are 欄; Taiwan mirror is 鏡像, ejection uses 拋出, invariants are 不變量, callback is 回呼, and conceptual connections use 串聯 or 連結. Replaced 應用程式降價 with 套用價格減免 and 檢查透過 with 檢查通過.
- Made errors and loading copy describe what the reader can do. Removed crawler, hydration, HTML, ETL, and database-field explanations from public-facing summary and fallback copy while preserving source and update placeholders.
- Clarified that the countdown permits finalization rather than executing it automatically; corrected the Chrono-Warrior description to continuous Endurance Champion tenure. Preserved the possibility of zero Participation CST.
- Matched ETH contribution copy to the actual contract method: this form adds ETH to the Cycle Reserve without a Gesture. Kept Public Goods Vault pages separate and referred to their configured recipient rather than implying Council control is already active.
- Removed unsupported reserve-growth and NFT-supply-cap implications; clarified the three CST issuance paths and the distinction between contract execution and mutable parameters. Preserved amounts, formulas, source references, and planned-versus-deployed version status.
- Revised quiz feedback into direct, respectful teaching language; removed taunting or opaque metaphors and tightened explanations around reserve carryover, CST supply, and audit interpretation.
- Standardized Random Walk branding and the coined artwork term, corrected Taiwan/Hong Kong digital-collectible vocabulary, and retained regional technology and Public Goods/Anchor Distribution terms.
- Aligned About, audits, security, Privacy's protocol descriptor, and the landing art headline. Legal rights, obligations, dates, and disclaimers remain unchanged.
- Tightened the six elapsed-time translation maps in FAQ and white paper to the protocol example key union and removed English fallbacks, so a new example requires a translation.
- Reviewed the Chinese sections of `public/llms.txt` and `public/llms-full.txt`: clarified direct contributions, Stellar Selection shares, CST delegation, and the planned ownership alternatives; corrected regional wording and Random Walk branding. Required URLs and all non-Chinese sections were preserved.

## Catalog coverage

All namespaces below were reviewed in all three locales. Numbers count changed existing string values against the starting commit; they measure edits, not translation quality.

| Namespace under `messages/{locale}/` | zh                  | zh-TW               | zh-HK               |
| ------------------------------------ | ------------------- | ------------------- | ------------------- |
| `admin.json`                         | Reviewed; unchanged | 2                   | Reviewed; unchanged |
| `allocation.json`                    | 2                   | 2                   | 2                   |
| `anchoring.json`                     | Reviewed; unchanged | 1                   | Reviewed; unchanged |
| `code.json`                          | 2                   | 2                   | 2                   |
| `common.json`                        | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `contracts.json`                     | 7                   | 7                   | 7                   |
| `coordination.json`                  | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `currentCycle.json`                  | 4                   | 4                   | 4                   |
| `detail.json`                        | 2                   | 2                   | 2                   |
| `errors.json`                        | 2                   | 4                   | 3                   |
| `ethContribution.json`               | 4                   | 5                   | 5                   |
| `faq.json`                           | Reviewed; unchanged | 2                   | 1                   |
| `footer.json`                        | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `formats.json`                       | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `forms.json`                         | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `gallery.json`                       | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `gesture.json`                       | 2                   | 2                   | 2                   |
| `home.json`                          | 22                  | 23                  | 22                  |
| `imprint.json`                       | 8                   | 8                   | 8                   |
| `landing.json`                       | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `legal.json`                         | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `marketing.json`                     | Reviewed; unchanged | 2                   | 1                   |
| `meta.json`                          | 7                   | 7                   | 7                   |
| `myPages.json`                       | 3                   | 3                   | 3                   |
| `nav.json`                           | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `publicGoods.json`                   | 2                   | 3                   | 2                   |
| `search.json`                        | Reviewed; unchanged | 1                   | 1                   |
| `seo.json`                           | 16                  | 17                  | 17                  |
| `siteMap.json`                       | 7                   | 7                   | 7                   |
| `statistics.json`                    | 8                   | 10                  | 8                   |
| `tables.json`                        | 1                   | 3                   | 2                   |
| `toasts.json`                        | 3                   | 6                   | 4                   |
| `tooltips.json`                      | Reviewed; unchanged | 1                   | 1                   |
| `traits.json`                        | 11                  | 15                  | 11                  |
| `wallet.json`                        | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |

Total changed catalog values: **374**.

## Content coverage

| Content module                              | zh                  | zh-TW               | zh-HK               |
| ------------------------------------------- | ------------------- | ------------------- | ------------------- |
| `content/about/{locale}.ts`                 | Edited              | Edited              | Edited              |
| `content/faq/text.{locale}.ts`              | Edited              | Edited              | Edited              |
| `content/how-it-works/text.{locale}.ts`     | Edited              | Edited              | Edited              |
| `content/landing/text.{locale}.ts`          | Edited              | Edited              | Edited              |
| `content/learn/text.{locale}.ts`            | Edited              | Edited              | Edited              |
| `content/legal/AuditsContent.{locale}.ts`   | Edited              | Edited              | Edited              |
| `content/legal/PrivacyContent.{locale}.ts`  | Edited              | Edited              | Edited              |
| `content/legal/RiskContent.{locale}.ts`     | Reviewed; unchanged | Reviewed; unchanged | Reviewed; unchanged |
| `content/legal/SecurityContent.{locale}.ts` | Edited              | Edited              | Edited              |
| `content/legal/TermsContent.{locale}.ts`    | Edited              | Reviewed; unchanged | Reviewed; unchanged |
| `content/quiz/text.basic.{locale}.ts`       | Edited              | Edited              | Edited              |
| `content/quiz/text.hard.{locale}.ts`        | Edited              | Edited              | Edited              |
| `content/quiz/text.medium.{locale}.ts`      | Edited              | Edited              | Edited              |
| `content/quiz/text.{locale}.ts`             | Edited              | Edited              | Edited              |
| `content/white-paper/text.{locale}.ts`      | Edited              | Edited              | Edited              |

## Verification

- `npm run i18n:check`: passed (strict catalog integrity, conventions, terminology, lexicon).
- Focused Jest checks: **642 tests passed** across catalog integrity, numeric claims, landing hero claims, and AI-facing documentation guards.
- `npm run type-check`: passed before the final editorial alignment; the coordinating agent owns the final integration run.
- `git diff --check`: passed.
- Shared e2e fixture changes for the Random Walk heading were handed to the coordinating agent: `e2e/zh-route-inventory.ts`, `e2e/locale-fixtures.ts`, and `e2e/zh-sprint6.spec.ts`.

This audit records the files inspected and the changes made. Passing catalog or vocabulary gates does not establish linguistic quality by itself.

The subsequent AI-document review is recorded in [editorial-review-llms.md](./editorial-review-llms.md). The final six-file English pass is recorded in [editorial-review-en-addendum.md](./editorial-review-en-addendum.md).
