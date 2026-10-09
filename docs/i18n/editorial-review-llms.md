# AI-facing documentation editorial review — 2026-09-04

Reviewed every language section of `public/llms.txt` and `public/llms-full.txt`: English, Simplified Chinese, Taiwan Traditional Chinese, Hong Kong Traditional Chinese, Ukrainian, Korean, Japanese, and Vietnamese. The Chinese pass is also recorded in [editorial-review-zh.md](./editorial-review-zh.md); this record covers the additional English, Ukrainian, Korean, Japanese, and Vietnamese pass.

The review compared the documents with the repository's current protocol facts, corrected page descriptions, source explanations, and locale style guides. This was a repository-based editorial review, not independent native-speaker certification.

## Corrections

- Replaced opaque About-page descriptions such as “Entity home” with descriptions of the protocol and its official resources.
- Standardized Random Walk branding while preserving every URL and required route.
- Clarified that direct ETH contributions fund the Cycle Reserve without a Gesture; Public Goods Vault funding remains a separate mechanism.
- Located the exclusive finalization window after the countdown reaches zero. Kept later Gestures and open finalization distinct from automatic finalization.
- Described planned ownership transfer and renunciation as alternatives announced in advance, rather than promising a transfer followed by irrevocable renunciation.
- Clarified delegation before CST expresses Council coordination weight and included all three CST issuance mechanisms in the English token description.
- Removed the English implication of a hard NFT supply cap and qualified the relationship between longer time increments and production pace.
- Clarified that ETH Stellar Selection distributes equal shares, and that selection with replacement can select one address multiple times.
- Made Random Walk's one-time discount distinct from its separate one-time anchoring eligibility.
- Corrected language-specific phrasing and typography: Ukrainian grouped amounts and natural ownership wording; Korean sentence rhythm and punctuation; Japanese redundant modifiers, question labels, and sentence endings; Vietnamese nominal chains, capitalization of coined terms, and unnecessary first-person FAQ questions.
- Preserved technical architecture details useful to AI readers, deployment facts, all amounts and formulas, the required links, and the distinction between evidence and blanket security claims.

## Verification and coordination

All URLs were compared before and after the edits and preserved exactly. Catalog integrity and protocol numeric-claim tests cover the related source copy. The public documentation guards also require phrase-fixture updates for the corrected Random Walk brand spelling; those updates were handed to the coordinating agent in `test-utils/locale-expectations.ts`.

Final verification passed: all four focused Jest suites (642 tests), including the public documentation guards, and `npm run i18n:check`.

Language coverage and passing mechanical checks do not establish fluency on their own. This record reports the inspected sections and concrete editorial changes.
