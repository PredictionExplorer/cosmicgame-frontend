# Korean and Japanese editorial review — 2026-09-04

This review covers all 35 message namespaces and all 15 content modules for each of
Korean and Japanese. Existing glossary coinages, catalog keys, ICU arguments, route
identifiers, protocol constants, and legal positions remain the editorial constraints.
A reviewed string was retained when it was already clear and suitable for its surface.

## Coverage

The catalog review included `admin`, `allocation`, `anchoring`, `code`, `common`,
`contracts`, `coordination`, `currentCycle`, `detail`, `errors`, `ethContribution`,
`faq`, `footer`, `formats`, `forms`, `gallery`, `gesture`, `home`, `imprint`,
`landing`, `legal`, `marketing`, `meta`, `myPages`, `nav`, `publicGoods`, `search`,
`seo`, `siteMap`, `statistics`, `tables`, `toasts`, `tooltips`, `traits`, and `wallet`.

The content review included About, landing, how it works, FAQ, Learn, the quiz
interface and all three question tiers, the white paper, and all five legal/trust
modules (Terms, Privacy, Risk, Security, Audits). The Japanese style-guide example
was also corrected: its literal English hat idiom contradicted its own guidance.

## Main editorial changes

- Rewrote operational metaphors as usable instructions: Japanese timers no longer
  describe a clock as distressed or a phase as opening; Korean participation no
  longer puts a gesture in a literal queue waiting for an allocation.
- Reworked the Japanese landing narrative, white-paper explanations, quiz prompts,
  and technical descriptions to use natural sentence subjects, verbs, and order.
  Korean revisions remove literal English phrasing about living parameters,
  records surviving, and patient users being punished for missing a deadline.
- Simplified transaction safeguards so the user can tell what the minimum CST
  quantity means, when a transaction is canceled, and what to check next.
- Removed crawler, initial HTML, indexing-table, and ETL implementation prose from
  reader-facing summaries, learning articles, and unavailable-data explanations.
- Corrected Korean `시드 구문나` to `시드 구문이나`, Japanese missing CST units in
  terms, the simulation-horizon label, and references to nonexistent button text.
- Made quiz feedback instructional and respectful. Questions about Ari and Mira
  now contain their own context and work when question order is shuffled.

## Accuracy corrections coordinated with the repository review

- Time expiry permits finalization; it does not execute finalization automatically.
- Participation CST may be zero; home copy no longer promises every gesture imprints it.
- Chrono-Warrior measures continuous Endurance Champion tenure.
- An unused anchoring allocation stays in the Cycle Reserve when no Cosmic
  Signature NFTs are anchored; it is not forwarded to Public Goods.
- Direct ETH contributions use the Cycle Reserve. Public Goods pages separately
  describe the configured beneficiary without claiming Council control is already active.
- Arbitrary ERC-20 amounts are no longer labeled as ETH.
- Reserve carryover does not guarantee that each subsequent reserve is larger.
- CST supply descriptions distinguish Participation, Recognition, and Outreach
  imprints. Contract allocation rules are no longer described as immutable constants.
- Simultaneously submitted gestures execute sequentially; later ones may still
  succeed if their protection conditions are satisfied.
- NFT supply has no fixed cap, and gas fees vary with network conditions and the operation.
- Japanese FAQ and white-paper elapsed-time examples are now localized. Korean and
  Japanese maps are exhaustive over the example keys, so new examples cannot
  silently fall back to English.

## Validation and boundaries

The strict catalog, copy conventions, glossary consistency, and lexicon checks pass.
The focused numeric-claims, quiz, FAQ, how-it-works, and legal-content tests pass
(5 suites, 290 tests), as does TypeScript checking. Repository-wide checks are run
as part of the final integration review. Automated checks establish structural and terminology consistency;
they do not certify native-human editorial approval. This record describes the code
and editorial review performed, not a claim that an independent native-language
reviewer approved every sentence. Shared UI behavior, pinned test expectations,
generated assets, and public `llms` documents are handled in the integration review.
