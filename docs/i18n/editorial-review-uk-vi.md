# Ukrainian and Vietnamese editorial review

Reviewed on 4 September 2026 against the locale glossaries, style guides,
`protocol-facts.ts`, and the English source corrections made in the same change.

## Coverage

Reviewed every string in all 35 catalogs for each locale: 7,530 catalog values in
all. The review changed 252 Ukrainian values in 29 catalogs and 347 Vietnamese
values in 28 catalogs. Copy that already read naturally was retained.

All namespaces were covered:

- Core navigation and helpers: `common`, `nav`, `footer`, `forms`, `formats`,
  `search`, `tooltips`, `errors`, `wallet`.
- Participation and assets: `home`, `landing`, `currentCycle`, `gesture`,
  `allocation`, `anchoring`, `imprint`, `gallery`, `detail`, `traits`, `myPages`,
  `tables`, `toasts`.
- Reference and administration: `admin`, `contracts`, `coordination`, `code`,
  `ethContribution`, `publicGoods`, `marketing`, `statistics`, `faq`, `legal`,
  `meta`, `seo`, `siteMap`.

Reviewed all 15 content modules in each locale: About, landing, How It Works,
FAQ, all Learn articles and shared appendices, the white paper and its appendices,
quiz interface and all three question tiers, Terms, Privacy, Security, Audits and
Risk Disclosures. This includes all 100 questions per locale, their alternatives,
explanations, additional notes and reference labels.

## Editorial changes

Ukrainian copy now uses direct sentences in place of English constructions about
queues, moving clocks, live parameters, mechanical actions and abstract context.
CST protections describe the minimum accepted quantity; arbitrary interpolated
labels use constructions that do not require an unavailable grammatical case.
Notifications, confirmation dialogs and technical explanations use consistent,
plain wording. Seed inflections and several awkward noun chains were corrected.

Vietnamese copy now explains actions in natural topic-first clauses. Literal
phrases such as “Trang chủ của thực thể”, “trong hàng nhận”, “biên nhận gọn” and
“thế trận bảo mật” were rewritten for their actual purpose. All untranslated
coordination event names were replaced with Vietnamese event descriptions.
Countdowns, role tenure, asset summaries and validation messages now describe what
happens without English word order or unnecessary metaphors.

Both locales received calmer, useful quiz feedback and explanations. Randomized
questions no longer rely on a “previous question” to supply their scenario.
Reader-facing Learn, SEO and trust copy no longer contains instructions about
crawlers, HTML, hydration or how an editor should write the page. Source and update
notes remain. Backend table names and processing acronyms were removed from empty
states while retaining the reason a value cannot be calculated.

## Meaning corrections aligned with the source review

- Reaching zero permits a finalization transaction; it does not finalize a cycle
  automatically. Participation CST may be zero.
- Chrono-Warrior measures continuous tenure as Endurance Champion.
- Direct ETH contributions go to the Cycle Reserve. Public Goods pages describe
  the configured beneficiary without implying current Council control.
- Attached ERC-20 quantities are not labeled ETH, and personal empty states refer
  to assets allocated to the connected wallet.
- An empty anchoring set leaves that cycle's share in the Cycle Reserve.
- Reserve carry-forward does not guarantee a larger reserve, and NFT supply has
  no fixed maximum. CST starts at zero and has distinct Participation,
  Recognition and Outreach issuance mechanisms.
- Simultaneous gestures execute sequentially; later gestures can still succeed
  within their protections. Gas fees vary and remain payable at zero CST cost.
- Artwork reproduction requires the on-chain seed and the rendering code.
  Symplectic integration does not imply zero numerical energy error.
- FAQ and white-paper example-duration dictionaries are exhaustively typed from
  `protocolFacts.dynamicCstRewardExamples`; unsupported examples cannot silently
  fall back to English.

## Validation

`npm run i18n:check` passed: key/ICU/placeholder parity, locale conventions,
terminology and banned vocabulary. The numeric-copy and catalog-integrity Jest
suites passed. Locale files were formatted with Prettier, and `git diff --check`
reported no whitespace errors. Repository-wide build and integration checks are
coordinated by the main review.

These checks verify consistency and protected facts; they do not independently
measure whether readers judge prose natural. This document records an editorial
review, not a claim of external native-speaker certification.
