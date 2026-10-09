# Multilingual editorial review — 4 September 2026

This change improves copy in all eight supported locales: English, Simplified
Chinese, Traditional Chinese for Taiwan and Hong Kong, Ukrainian, Korean,
Japanese, and Vietnamese. The seven translated locales received a file-by-file
review of their 35 message catalogs and 15 content modules. English source copy
was revised alongside them, with an additional full review of its four largest
remaining catalogs and the medium and hard quiz tiers. Both public AI documents
were reviewed in every language.

In total, 1,640 catalog values changed, in addition to the long-form revisions:
317 English, 113 Simplified Chinese, 139 Taiwan Traditional Chinese, 122 Hong Kong
Traditional Chinese, 252 Ukrainian, 133 Korean, 217 Japanese, and 347 Vietnamese.

The review keeps the protocol's coined terminology while replacing literal
translations, awkward grammar, opaque metaphors, and developer-facing prose with
language suited to the page. Existing natural wording was retained. Translation
keys, interpolation arguments, routes, and protocol parameter values are preserved.

## Editorial improvements

- Chinese regional variants were reviewed independently. Corrections include
  software-application wording incorrectly used for applying a reduction,
  table rows confused with columns, and regionally inappropriate technical terms.
- Korean and Japanese operational messages now use direct explanations and
  natural sentence structure. Korean particle errors and Japanese English
  elapsed-time labels were corrected.
- Ukrainian cases, actions, and asset descriptions were clarified. Vietnamese
  event names were translated and literal eligibility, timing, and error messages
  rewritten.
- English legacy retrieval, cycle, and outreach terminology was brought into
  line with the other locales. An unnecessary rich-text fragment inside an
  ordinary word was removed.
- Learning articles and page summaries explain the protocol to readers instead
  of describing hydration, indexing, crawler behavior, or internal data tables.
- Quiz feedback is constructive, and shuffled questions carry their own context.

## Corrections to explanations

- Countdown expiry permits finalization; it does not execute the transaction.
- Participation CST can be zero. Recognition CST and the Outreach Reserve are
  distinct issuance mechanisms.
- Carrying reserves forward does not guarantee a larger reserve every cycle.
- Chrono-Warrior measures continuous tenure as Endurance Champion.
- The ETH contribution form sends funds to the Cycle Reserve, not directly to
  the Public Goods Vault.
- If no Cosmic Signature NFTs are anchored at finalization, the unused Anchor
  Distribution remains in the Cycle Reserve.
- Attached ERC-20 amounts are not labeled as ETH, and wallet empty states refer
  to assets allocated to that wallet.
- FAQ and quiz explanations distinguish transaction ordering, applicable
  protections, variable network fees, published security findings, and the limits
  of administrative powers.

## Engineering improvements

Catalog integrity checks now inspect strings inside raw-message lists, reject
non-string leaves and whitespace in place of prose, and distinguish a list from
an object with numeric keys. Legitimate localized separators remain supported.
The report describes populated entries and differences from the source rather
than presenting them as a fluency score. Elapsed-time translation maps are
exhaustive, so new examples cannot silently fall back to English.

Browser heading checks now validate a single DOM snapshot per retry, avoiding a
race while streamed content appears. Generated Playwright reports are excluded
from linting so browser checks can recreate them without interrupting the linter.

Share-image font subsets are regenerated for the revised text. The white-paper
generator embeds regular and bold Japanese and Korean fonts from pinned Noto
sources instead of relying on system fonts that rendered incorrectly in PDF
readers. Downloadable white papers are regenerated and visually checked.

## Verification

| Check                                                    | Final result                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Translation integrity, conventions, terminology, lexicon | Passed                                                                                    |
| Unit and component tests with coverage                   | 493 suites, 7,944 tests passed                                                            |
| Coverage                                                 | 83.80% statements, 76.49% branches, 79.82% functions, 85.36% lines; all thresholds passed |
| Production build                                         | Passed as part of the Playwright run                                                      |
| Locale browser checks                                    | 580 passed, no failures or retries                                                        |
| Lint and TypeScript                                      | Passed                                                                                    |
| Dependency audit                                         | No production or development advisories                                                   |
| Changed-file formatting and whitespace                   | Passed                                                                                    |

All eight downloadable white papers were regenerated, and all 114 pages were
visually reviewed, including enlarged formulas, tables, appendices, and references.

Browser checks cover every translated locale's route inventory at 320, 768, and
1440 pixels, plus desktop and mobile language-switching checks. They use the
repository's mocked protocol data; the live-chain harness was not part of this
editorial verification.

## Detailed review records

- [Chinese locales](editorial-review-zh.md)
- [Korean and Japanese](editorial-review-ko-ja.md)
- [Ukrainian and Vietnamese](editorial-review-uk-vi.md)
- [Additional English review](editorial-review-en-addendum.md)
- [Public AI documents](editorial-review-llms.md)

These records describe an AI-assisted editorial review and technical verification.
They do not represent independent human native-speaker certification. Automated
checks verify structure, terminology, and rendering; they cannot measure whether
every reader finds a sentence natural.
