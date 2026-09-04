# English editorial review addendum — 2026-09-04

This pass reviewed the complete contents of four remaining English catalogs and both remaining quiz tiers, alongside the coordinating agent's targeted review of English source copy:

- `messages/en/statistics.json`
- `messages/en/tables.json`
- `messages/en/myPages.json`
- `messages/en/traits.json`
- `content/quiz/text.medium.en.ts` — 25 questions, answers, explanations, and references
- `content/quiz/text.hard.en.ts` — 50 questions, answers, explanations, and references

## Findings addressed

Legacy vocabulary in escaped ordinary UI strings was replaced with the protocol's public terminology: Cycle, Retrieve, Unretrieved, Imprint, Outreach Wallet, and allocation probability. JSON keys and ICU argument names were retained. Random Walk branding and ERC-20 spelling were corrected in values only.

Descriptions now distinguish wallet-specific allocations from all cycle attachments, count Signature Allocations without assuming the recipient necessarily made the Final Gesture before expiry, and avoid suggesting that participation guarantees an allocation. Statistics copy explains indexed records and missing data without exposing backend table names. Trait descriptions use clear visual language; empty states explain availability without implementation details.

Quiz revisions retain answer keys, numeric values, protocol formulas, references, and the distinction between deployed V2 and planned V3. They clarify that zero CST cost still requires network gas and valid cycle state; distinguish Participation CST from other issuance mechanisms; explain price changes between submission and execution; and keep shuffled questions self-contained. Security explanations describe what guards, fuzz tests, verification tools, and symplectic integration establish without treating them as universal guarantees. Documented administrative functions are distinguished from retained upgrade authority.

## Integration notes

Meaning corrections were shared with the coordinating agent and the agents responsible for the translated locales. Chinese equivalents were aligned in the same worktree. The coordinating agent owns full integration tests and shared test-fixture changes.

Potentially pinned labels changed in this pass:

| Previous text                                 | Current text                            |
| --------------------------------------------- | --------------------------------------- |
| Round, Previous round, Next round, Live round | Cycle and corresponding cycle labels    |
| Claim / Claiming                              | Retrieve / Retrieving                   |
| Claim All NFTs / Claim All Tokens             | Retrieve All NFTs / Retrieve All Tokens |
| Claimable Assets                              | Retrievable Assets                      |
| Allocation Claims by Cycle                    | Allocation Retrievals by Cycle          |
| Claimed %                                     | Retrieved %                             |
| Avg Claim Time                                | Average retrieval time                  |
| Mint                                          | Imprint                                 |
| Marketing Wallet                              | Outreach Wallet                         |
| Ban / Unban                                   | Hide / Restore                          |
| Champion Time                                 | Endurance duration                      |
| Chrono Warrior                                | Chrono-Warrior                          |
| Bucket                                        | Time interval                           |
| Interpolation                                 | Line style                              |

This is an editorial and repository-consistency review; it is not a security audit or a new verification of the deployed contracts.

Final checks passed: `npm run i18n:check`, `git diff --check`, and four focused Jest suites (642 tests) covering catalog integrity, protocol numeric claims, hero claims, and AI-facing documentation.
