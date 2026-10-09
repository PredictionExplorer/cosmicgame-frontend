# Game page redesign and V2 compatibility review

Reviewed the deployed [app home](https://app.cosmicsignature.com/), its frontend,
the local V2 contract implementation, and the V2 integration-harness documentation.
This change targets the existing V2 deployment. It does not upgrade or deploy contracts.

## Findings and design decisions

The first screen asked newcomers to interpret too many things at once: a timer,
three payment methods, multiple participant roles, allocation distributions, chat,
and protocol storytelling. Similar card treatments gave these elements similar
visual weight. The first redesign reduced that density by collapsing the standings,
but participant feedback established that those standings are decision inputs and
must remain visible alongside the current Calibration Window.

The redesigned page introduces a clear reading order:

1. Read a compact cycle heading, the clock, and the Signature Allocation.
2. Compare the Last Gesture, Endurance Champion, and Chrono Warrior without opening
   a disclosure. Their record durations, progress, and next-change information stay
   alongside the primary participation form.
3. Review all three Gesture methods and the current Calibration Window together.
   Once the cycle has started, CST calibration remains visible while ETH is selected.
4. Read the participation guide and explore the featured artwork below the decision
   dashboard. Open the allocation breakdown when more detail is useful.
5. Explore the live feed, attached assets, and the story behind the art.

The desktop and laptop layout gives decision information the first viewport while
using spacing, typography, and grouping to establish hierarchy. The compact layout
targets 1280×720, 1366×768, 1440×900, and 1920×1080 browser viewports at normal zoom.
Smaller screens use natural page flow; there is no fixed-height clipping of content.
Native disclosures retain supplementary information in server-rendered HTML and
remain usable from the keyboard. A mobile action dock opens the same form state, so a draft
follows the participant between the page and the sheet. The page uses the existing
typography, UI primitives, localization system, and artwork instead of introducing
another design library. New guidance ships in all eight supported locales.

The optional message editor starts collapsed in the compact form. The chat's join
action opens it before moving keyboard focus to the message field. The mobile sheet
shows the editor directly and preserves the same draft. Neither behavior hides the
live decision information.

## Mechanics preserved for V2

- A Gesture establishes the latest participant and can extend the finalization
  deadline. Reaching zero makes finalization possible; it does not automatically
  finalize the cycle. Other participants can still make Gestures before finalization
  confirms, changing the result and potentially extending the clock.
- The latest participant has the contract's exclusive finalization window. The
  contract allows other participants to finalize after that window expires.
- ETH, CST, and eligible RandomWalk NFT-assisted ETH Gestures remain available
  according to the existing cycle rules. RandomWalk eligibility and its single-use
  discount are preserved; using the discount does not transfer the NFT.
- Spending on a Gesture is not refunded simply because another participant takes
  the latest position. Transaction gas is paid in ETH, including when CST cost is zero.
- CST costs and Participation CST are dynamic. Zero CST cost is valid when confirmed
  by quote data. Participation CST can also be zero. The V2 contract already supports
  minimum accepted CST reward protection and the Final CST Gesture role.
- Endurance and Chrono identities, record durations, live challenges, and Last Gesture
  details are always displayed in the decision dashboard. Stellar Selection, anchoring
  distributions, public goods, and attached assets remain represented in supplementary
  sections.
- The existing allocation derivation uses live dashboard percentages and amounts;
  the redesign does not hardcode allocation amounts or substitute V3 parameters.
- Existing V2-first overload selection, maximum-cost limits, minimum-reward limits,
  receipt-status verification, and endgame chain confirmation remain in place.

Contract references: `../Cosmic-Signature/contracts/production/BiddingV2.sol`,
`BiddingV2Base.sol`, `MainPrizeV2.sol`, and the frontend's
[`content/protocol-facts.ts`](../content/protocol-facts.ts). The latter distinguishes
launch defaults from live, owner-configurable values.

## Correctness improvements

**Countdown on first paint.** The shared clock intentionally reports zero during
server rendering and initial hydration. Previously, subtracting that value from an
epoch deadline rendered approximately twenty thousand days. The countdown now
accepts the page's serialized clock sample until its live ticker takes over. Tests
exercise actual server rendering, hydration, and subsequent ticks.

**Unknown costs.** Missing ETH prices no longer become zero-cost submit labels.
Missing or malformed CST prices remain unpriced even when the independent duration
read has completed. A confirmed zero still displays as free. This prevents an early
render from suggesting a free Gesture whose wallet confirmation has a real cost.

**Finalization network guard.** Finalization now uses the same explicit network guard
as Gestures. It keeps its submission lock while a wallet switch is pending, reads
transaction state on the app chain, and resolves the signer when submitting through
wagmi. A network-switch failure stops transaction reads and writes. A successful
switch does not depend on React having already rebuilt the wallet-bound contract.

## V3 adoption checklist

- Verify the deployed proxy's implementation and the exact V3 ABI before enabling
  V3 behavior; chain ID alone is not a contract-version identifier.
- Compare V2 and V3 entrypoints, custom errors, event fields, and payout recipients.
  Regenerate typed ABIs and review overload selection deliberately.
- Recheck repeated-Gesture restrictions, timestamp boundaries, clock extensions,
  CST cost/reward formulas, refund behavior, and the finalization exclusivity rule
  against the final V3 contracts. Do not copy assumptions from V2 into new guidance.
- Confirm indexer/API compatibility and block provenance for quotes, cycle state,
  participant roles, and distributions. Keep all displayed values on the same cycle.
- Add a deliberate V3 harness upgrade scenario while retaining the V2 scenario.
  Exercise the first Gesture, each payment method, zero CST cost, rejected writes,
  last-second activity, finalization, and the following cycle.
- Review explanatory copy, numeric claims, and every translation against those
  verified semantics before releasing the upgrade.

## Remaining work outside this change

- **Quote freshness:** transient transport failures retain the last successful CST
  quote and reward preview without a visible age. Add source block/time metadata and
  a stale state, particularly before displaying locally projected free-cost states.
  [`contract-api-update-requirements.md`](contract-api-update-requirements.md)
  describes the needed backend fields.
- **Read-client consistency:** the shared `useContract` helper still selects an
  unpinned public client. Finalization's transaction path is pinned by this change;
  other flows merit a separate network-switch review.
- **Production evaluation:** verify the redesign with first-time participants and
  measure whether they can explain the cost, latest position, timer, and finalization
  before connecting a wallet. Review real mobile performance and accessibility.

## Verification

Regression tests cover server/hydration countdown consistency, unknown versus
confirmed-zero quotes, submit labels, rejected network switches, pending-switch
double submissions, and finalization after a successful switch. Existing receipt,
rollover, and contract compatibility tests remain relevant.

For real V2 transactions, use `npm run test:e2e:harness`. The harness seeds V1 history
then upgrades to V2 and runs the real contracts, indexer, API, and frontend. Mocked
UX scenarios are useful for layout checks but do not establish contract compatibility.
See [`harness.md`](harness.md) for prerequisites and supported phases.

### Previous redesign verification baseline

- All 495 Jest suites passed: 7,973 tests.
- Repository lint, TypeScript, all eight locales' i18n/terminology checks, and the
  production build passed.
- Browser checks covered live, opening-soon, first-Gesture, final-ten, and
  ready-to-finalize states; 320px, 390px, 768px, and desktop widths; native
  disclosures; the mobile sheet; and CST method selection. Checked widths had no
  horizontal page overflow. The live production-build preview had no captured
  console warnings/errors after hydration.
- The real-contract browser harness was not run. Browser-test source files were
  updated for the new layout; manual browser checks and Jest were executed.
  No wallet transactions were submitted, and no remote deployment was made.

### Decision dashboard regression coverage

The revised component tests require Last Gesture, Endurance/Chrono, and Calibration
Window content to be visible without interaction. They preserve receipt details,
stale-indexer handling, lifecycle states, and finalization guards. Keyboard tests
cover the supplementary allocation disclosure without hiding any decision surface.
Browser regression cases cover all four target desktop/laptop viewports, including
CST method selection, first-viewport bounds, horizontal overflow, and overlapping
text in the participation and calibration areas. Browser-test definitions alone do
not establish that those scenarios were executed; see the accompanying change report
for the checks run during this revision.

### Verified decision dashboard revision

- All 496 Jest suites passed: 8,026 tests. Production build, repository lint,
  translation checks, and TypeScript validation passed.
- Browser geometry checks passed at 1280×720, 1366×768, 1440×900, and 1920×1080.
  The connected CST scenario's clock, latest transaction, role/challenge panel,
  calibration window, and submit controls all fit in the first viewport. No
  horizontal overflow or CST label/value text escaping its cell was found.
- The final production-build preview, with live public data and CST selected,
  placed all five panels above 650px at 1280×720, with no captured console errors.
- Optional message/advanced controls expand to full form width; mobile sheet and
  shared drafts were checked. No wallet transaction was submitted. The real-contract
  integration harness and the separate Playwright runner were not run.
- Calibration now tracks timing availability separately from quote availability,
  including timing-only, quote-only, malformed, and legitimate zero-duration samples.
