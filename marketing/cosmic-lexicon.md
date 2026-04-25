<!-- lexicon-allow-start: this is the lexicon specification itself; it documents banned terms by definition -->

# Cosmic Lexicon

**A regulator-aware terminology guide for every participant-facing surface of Cosmic Signature.**

> **Purpose.** Replace the financial, auction, gambling, and charity vocabulary currently used across the dapp, landing page, press kit, docs, and socials with a coherent cosmic-narrative frame. The smart contracts, their function names, events, errors, and all developer-facing documentation stay exactly as they are today. This document only governs what humans see.

> **Not legal advice.** This is copy-and-optics guidance to reduce the surface area that a non-expert reader (regulator, journalist, bank compliance desk, app-store reviewer, payment processor, Twitter moderator) could misread. It does not make the project legal in any jurisdiction and does not substitute for a crypto-securities / state-gambling / money-transmitter review before a public launch.

> **Version note.** "Bid" is rendered publicly as **Gesture** (verb: _make a gesture_). Alternate candidates that were evaluated - Note, Mark, Seal, Stroke, Verse, Moment, Glyph, Orbit, Ember, Pulse, Transmission, Beacon, Flare, Move - are documented in [Section C.1a](#c1a--alternate-bid-replacements-considered) so any future swap is a mechanical search-and-replace, not a rethink.

> **2026-04-23 revision.** Expanded the banned list to include additional globally-sensitive vocabulary: **draw, draws, drawing, prize draw, lucky draw, sweepstakes, giveaway, game, play, player, compete, competition, contest, tournament, earn, earnings, income**. **Stellar Draw** is retired as a primary term and replaced everywhere by **Stellar Selection** (verb: _select_). "Stellar Recipient" is replaced by **Selected Recipient**. Rationale is in new [Section B.7](#b7-additional-globally-sensitive-vocabulary-2026-04-23-addition). Goal: neutralize language against prize-draw / prize-competition / game-of-chance / earnings regulation across as many jurisdictions as possible, with particular attention to US state lottery statutes, UK Gambling Act 2005, Australian Interactive Gambling Act, Canadian Criminal Code lottery provisions, and EU MiCA adjacency. On every public surface, `draw`-language is prohibited.

---

## Table of Contents

1. [Section A - Executive Summary](#section-a--executive-summary)
2. [Section B - Why Each Word Cluster Is Risky](#section-b--why-each-word-cluster-is-risky)
3. [Section C - The Cosmic Lexicon (Master Mapping)](#section-c--the-cosmic-lexicon-master-mapping)
4. [Section D - Before/After Copy Transformations](#section-d--beforeafter-copy-transformations)
5. [Section E - Dapp Screen-by-Screen Labels](#section-e--dapp-screen-by-screen-labels)
6. [Section F - The Contract-Call Bridge (for Engineers)](#section-f--the-contract-call-bridge-for-engineers)
7. [Section G - What Must NOT Be Renamed](#section-g--what-must-not-be-renamed)
8. [Section H - Implementation Checklist](#section-h--implementation-checklist)
9. [Section I - Legal Disclaimer and Escalation](#section-i--legal-disclaimer-and-escalation)

---

## Section A - Executive Summary

Cosmic Signature is a skill-based, strategic on-chain protocol on Arbitrum. Mechanically it is sound. Reputationally and legally, the **language** used to describe it is the main exposure:

- The landing page, README, and press kit use the words **auction**, **bid**, **prize**, **winner**, **raffle**, **draw**, **odds**, **yield**, **stake**, **charity**, and **donation** - terms that map cleanly onto auction law, state lotteries, securities offerings, and registered-charity solicitation.
- The [`marketing/brand-identity-guide.md`](brand-identity-guide.md) already recognizes this risk and partially addresses it (lines 152-174, flagging `Jackpot/Pot`, `Wager/Bet`, `Lottery`). The Cosmic Lexicon is the full-coverage version of that work.
- Separately, the brand team has **already** reframed "charity" as "Protocol Guild / public goods" in some surfaces ([`marketing/README.md`](README.md), lines 112-119) but the reframing is not applied consistently - the root [`README.md`](../README.md) still says "Charity & Marketing" and points at `CharityWallet`.

Goal of this document: one consistent, cosmic-narrative voice across every surface a non-developer will ever read, so that when a regulator, reporter, or compliance reviewer skims the project, they see a procedural on-chain art + coordination protocol where **every gesture shapes the Signature**, not a Dutch auction for a jackpot.

---

## Section B - Why Each Word Cluster Is Risky

Each cluster lists the problem, the framing risk, and representative appearances in the current repo. The goal is to show _why_ before _what_.

### B.1 Lottery / Gambling Optics

**Trigger words:** `raffle`, `raffle winner`, `winner`, `odds`, `better odds`, `jackpot`, `pot`, `luck`, `lucky`, `prize`, `prize pool`, `pick a random winner`.

**The risk.** U.S. state gambling statutes (and many international equivalents) apply when three elements are present together: **prize + chance + consideration**. "Raffle" is regulated on its own face in most U.S. states. "Prize" is the formal legal term of art for the thing being won. "Odds" invokes the chance prong explicitly. Even where no statute is triggered, the optics are bad for payment processors, app stores, and reporters.

**Where it appears today (examples):**

- [`marketing/landing-page.html`](landing-page.html) line 507: _"More bids = better odds."_
- [`marketing/cosmic-codex-strategy-guide.md`](cosmic-codex-strategy-guide.md) line 549: _"better odds per round"_
- [`marketing/press-kit.md`](press-kit.md) line 312: _"Is this a lottery or casino?"_
- [`marketing/landing-page.html`](landing-page.html) lines 459-520: multiple "Raffle" cards.
- [`README.md`](../README.md) lines 89-96: "raffle", "Randomly awarded ETH raffle prizes".

### B.2 Securities / Investment-Contract Optics (Howey-flavored)

**Trigger words:** `yield`, `passive yield`, `dividends`, `interest`, `staking rewards`, `ROI`, `profit`, "`growing prize pool`" framed as appreciation, "DAO governance" framed as shareholder control.

**The risk.** In the U.S., the Howey test asks whether there is an investment of money in a common enterprise with an expectation of profits derived from the efforts of others. "Yield", "dividends", and "passive" + "rewards" language walks directly into the first three prongs. "Governance token gives you a say in the protocol's financial future" walks into the fourth.

**Where it appears today:**

- [`marketing/landing-page.html`](landing-page.html) line 431: _"6% ETH to stakers every round"_ framed as "passive ETH yield" (line 430).
- [`marketing/landing-page.html`](landing-page.html) line 456: _"COSMIC NFT Stakers (Passive Yield)"_.
- [`marketing/brand-identity-guide.md`](brand-identity-guide.md) line 171: _"Staking yield ... Dividends, Interest ... 6% of round ETH split pro-rata among all staked COSMIC NFTs."_
- [`marketing/README.md`](README.md) lines 12-13: staking framed as yield.

### B.3 Auction / Exchange Optics

**Trigger words:** `auction`, `Dutch auction`, `bid`, `bidder`, `bidding`, `sale`, `price`, `bid price`.

**The risk.** In the U.S., most states license auctioneers and regulate auctions of real property and certain goods. Europe has formal distance-selling rules for auctions. "Dutch auction" has a specific securities-issuance meaning (Google's 2004 IPO; treasury auctions). Even where no licensing is triggered, it invites the framing "this is financial-market infrastructure", which then invites securities analysis.

**Where it appears today:**

- [`marketing/landing-page.html`](landing-page.html) lines 360-418: "Dutch Auction Opens", "Bid & Compete", "ETH bid price".
- [`marketing/explainer-video-script.md`](explainer-video-script.md) lines 43-48: Dutch auction explainer.
- [`README.md`](../README.md) lines 3-4, 38-40: "last-bidder-wins auction", "Dutch auction".
- Hundreds of occurrences across the codebase: every `bid*` function name (left alone per Section G), every comment, every UI label.

### B.4 Charity / Tax Optics

**Trigger words:** `charity`, `charity wallet`, `charitable donation`, `tax-deductible` (never currently claimed, but `charity` implies it), `donate to charity`.

**The risk.** "Charity" in U.S. tax and state fundraising law means a registered 501(c)(3) (or equivalent) organization. Using the word while sending ETH to a non-registered address (Protocol Guild is a collective funding mechanism, not a U.S. registered charity) creates two exposures: (1) state charitable-solicitation rules; (2) user confusion about tax treatment - somebody will claim a deduction and blame the project.

**Where it appears today:**

- [`contracts/production/CharityWallet.sol`](../contracts/production/CharityWallet.sol) line 11: contract name itself.
- [`README.md`](../README.md) line 6: _"charity allocations"_, line 30: _"Charity & Marketing"_.
- [`README.md`](../README.md) line 59: _"CharityWallet ... Holds ETH allocations for donation to DAO-approved charity."_
- `CharityWallet.send()`, `CharityWallet.receive()` (left alone per Section G).
- The marketing surface has already partly renamed this to "Protocol Guild / public goods" ([`marketing/README.md`](README.md) lines 112-119). The lexicon just finishes that job.

### B.5 Gaming-of-Chance Optics

**Trigger words:** `bet`, `wager`, `entry fee`, `house`, `house edge`, `ticket`.

**The risk.** These words move the frame from "gameplay" to "wagering". In multiple U.S. states, a "wager" on anything is per se gambling regardless of skill level. None of these words appear as product terms today (the brand guide already bans them - [`marketing/brand-identity-guide.md`](brand-identity-guide.md) line 157), but copywriters sometimes reach for them by reflex - the lexicon codifies substitutions.

### B.6 Crypto-Slang Landmines

**Trigger words:** `degen`, `pure alpha`, `moon`, `apes`, `ape in`, `lambo`, `gm/wagmi` (in financial copy), `WAGMI`.

**The risk.** Bank-compliance filters, app stores, and institutional allocators trip on these tokens automatically. They do not signal sophistication - they signal gambling subculture. Also already partially banned in [`marketing/brand-identity-guide.md`](brand-identity-guide.md) lines 123-127, but "pure alpha" still sneaks into [`marketing/content-calendar-12-weeks.md`](content-calendar-12-weeks.md) line 92.

### B.7 Additional globally-sensitive vocabulary (2026-04-23 addition)

This subsection was added after a re-review against non-US gambling and consumer-protection regimes. Each cluster has a narrower risk than the headline categories above but is flagged by enforcement authorities in one or more jurisdictions.

**B.7.1 Draw / draws / drawing / prize draw / sweepstakes / giveaway.**

_The risk._ "Draw" is the canonical lottery / prize-draw verb in U.S. state statutes, the UK Gambling Act 2005 (where "lottery" is defined to include any arrangement involving a "drawing of lots"), the Australian Interactive Gambling Act and state lottery acts, and Canadian Criminal Code s. 206/207. Many bank-compliance filters flag "prize draw" automatically. "Sweepstakes" is a specific regulated category under U.S. state sweepstakes statutes (with distinct rules in Florida, New York, Rhode Island, Arizona, and others) and must include a "no-purchase-necessary" alternative to be lawful - a condition Cosmic Signature does not offer because there is no lottery. "Giveaway" is commonly used interchangeably with "sweepstakes" in enforcement actions.

_Applied:_ retire **Stellar Draw** → **Stellar Selection** everywhere. Ban _draw, draws, drawing, prize draw, lucky draw, sweepstakes, giveaway_ in public copy.

**B.7.2 Game / play / player / compete / competition / contest / tournament.**

_The risk._ "Game" is the root term in most gambling statutes worldwide (U.S. state "games of chance" / "games of skill" distinctions; UK "gaming" as defined in Gambling Act 2005 s. 6; Canadian Criminal Code "game" as defined; Australian state Gaming Acts; German Interstate Treaty on Gambling; Japanese Act on Regulation of Adult Entertainment). "Player" imports the regulated gaming frame by direct implication. "Compete / competition / contest" triggers UK "prize competition" regulation (Gambling Act 2005 s. 14 distinguishes lotteries, competitions, and gaming) and U.S. / state contest-and-sweepstakes statutes. "Tournament" maps onto regulated poker / esports gaming contexts.

_Applied:_ describe Cosmic Signature as a **protocol**, not a _game_. Describe users as **participants**, not _players_. Ban _game, play, player, compete, competition, contest, tournament_ in public copy. Exception: internal developer documentation and the phrase "game-theoretic" in academic discussion of mechanism design, which uses "game" as a mathematical term of art and does not read as gambling in context.

**B.7.3 Earn / earnings / income.**

_The risk._ These words invite the Howey framing (expectation of profits derived from the efforts of others) - the same cluster as the B.2 securities optics but targeted at the _participant's receipt_ side rather than the project's _rewards_ side. "Earn" in the context of "earn 100 CST per bid" reads as compensation for labor or capital at risk; both framings are bad. Internationally, "earnings" is also the trigger word for app-store and payment-processor anti-fraud filters targeting get-rich-quick schemes.

_Applied:_ never say a participant _earns_ anything. Use _receives_, _is imprinted with_, _is allocated_, or the verb form of the specific allocation track. Ban _earn, earnings, income_ in public copy.

---

## Section C - The Cosmic Lexicon (Master Mapping)

### C.0 The unifying narrative

Cosmic Signature is an **open cosmic performance** on Arbitrum. Participants **make gestures** across a **Performance Cycle**; every gesture shapes the cycle's final **Signature**. When the Performance closes, the protocol **distributes allocations** across more than a dozen tracks - to the participant who made the final gesture, to those whose gestures endured the longest, to randomly selected participants, to dedicated NFT holders who have **anchored** their NFTs to the protocol, and to Ethereum's public-goods infrastructure. No house. No auction floor. No prize. A protocol.

**One-sentence public line:**

> _"Cosmic Signature is a procedural on-chain art protocol on Arbitrum where every gesture shapes the cycle's final Signature and the protocol redistributes its reserves across everyone who shaped the outcome - including the infrastructure Ethereum itself depends on."_

### C.1 Master mapping table

**How to read:** "Cosmic primary" is the first choice for headlines, hero copy, and narrative paragraphs. "Neutral fallback" is for UI buttons, tooltips, error toasts, and any place where the cosmic word would be confusing without immediate context. Never ship the word in the **Current** column on a public surface.

#### Cycle / time

| Current                        | Cosmic primary               | Neutral fallback        | Rationale                                                       |
| ------------------------------ | ---------------------------- | ----------------------- | --------------------------------------------------------------- |
| round / `roundNum`             | **Cycle**                    | Round                   | "Round" is fine when neutral is needed; `Cycle #N` in headlines |
| bidding round                  | **Performance Cycle**        | Active Cycle            | Removes "bidding" entirely                                      |
| round activation time          | **Cycle Opening**            | Cycle Start             |                                                                 |
| main prize time                | **Cycle Finalization Time**  | Signature Lock Time     |                                                                 |
| `mainPrizeTime` timer expiring | **Performance closes**       | Finalization opens      |                                                                 |
| timeout to claim               | **Open-Finalization Window** | Anyone-can-close window | After the exclusivity period                                    |

#### Making a Gesture (formerly "bidding")

| Current                   | Cosmic primary                                                 | Neutral fallback            | Rationale                                                      |
| ------------------------- | -------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------- |
| bid (noun)                | **Gesture**                                                    | Entry                       | Replace _everywhere_ in public copy                            |
| bidder                    | **Participant**                                                | Participant                 | No actor suffix - "Gesturer" is ugly; the plain word is enough |
| place a bid               | **Make a Gesture**                                             | Submit an Entry             |                                                                |
| bidWithEth (button label) | **Make a Gesture - ETH**                                       | Enter with ETH              | Contract name unchanged; UI label differs                      |
| bidWithCst (button label) | **Make a Gesture - CST**                                       | Enter with CST              |                                                                |
| bid with Random Walk NFT  | **Make a Gesture with a Random Walk NFT**                      | Enter with Random Walk NFT  |                                                                |
| first bid of the round    | **Opening Gesture**                                            | First Entry                 |                                                                |
| last bidder               | **Last Participant** (the person); **Final Gesture** (the act) | Most Recent Participant     | Core identity for Main Prize recipient                         |
| last CST bidder           | **Last CST Participant** (person); **Final CST Gesture** (act) | Most Recent CST Participant |                                                                |

#### Pricing (formerly "Dutch auction")

| Current                           | Cosmic primary             | Neutral fallback | Rationale                                                     |
| --------------------------------- | -------------------------- | ---------------- | ------------------------------------------------------------- |
| Dutch auction                     | **Calibration Window**     | Price Window     | Describes the descending-price mechanic without legal payload |
| ETH Dutch auction                 | **ETH Calibration Window** | ETH Price Window |                                                               |
| CST Dutch auction                 | **CST Calibration Window** | CST Price Window |                                                               |
| Dutch auction beginning bid price | **Calibration ceiling**    | Opening cost     |                                                               |
| Dutch auction ending bid price    | **Calibration floor**      | Floor cost       |                                                               |
| bid price                         | **Gesture Cost**           | Entry Cost       |                                                               |
| next bid price                    | **Next Gesture Cost**      | Next Entry Cost  |                                                               |
| incremental pricing (~1% per bid) | **Gesture-Cost Drift**     | Cost Step-up     | "Drift" is a neutral protocol word                            |

#### Outcomes (formerly "prizes")

| Current                   | Cosmic primary                | Neutral fallback       | Rationale                                             |
| ------------------------- | ----------------------------- | ---------------------- | ----------------------------------------------------- |
| prize (generic)           | **Allocation**                | Distribution           | Core substitution; used everywhere                    |
| main prize                | **Signature Allocation**      | Cycle Main Allocation  | Replaces "Jackpot"; consistent with `signature` brand |
| main prize claim          | **Finalize the Cycle**        | Close the Cycle        |                                                       |
| `claimMainPrize` (button) | **Finalize Cycle**            | Close the Cycle        |                                                       |
| prize pool                | **Cycle Reserve**             | Round Balance          |                                                       |
| growing prize pool        | **Compounding Cycle Reserve** | Rolling Balance        | Drop "growing" - reads like appreciation / ROI        |
| prize category            | **Allocation Track**          | Distribution Category  |                                                       |
| prize winner              | **Allocation Recipient**      | Designated Participant |                                                       |
| winner (generic)          | **Recipient**                 | Designated Participant | Never "winner" in public copy except FAQ answers      |

#### Random selection (formerly "raffle")

| Current                  | Cosmic primary                          | Neutral fallback              | Rationale                                                                                     |
| ------------------------ | --------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| raffle                   | **Stellar Selection**                   | Random Allocation             | Replaces "raffle" globally. Note: "draw" is now also banned - see B.7.1.                      |
| raffle winner            | **Selected Recipient**                  | Randomly Selected Participant |                                                                                               |
| ETH raffle               | **ETH Stellar Selection**               | Random ETH Allocation         |                                                                                               |
| NFT raffle               | **NFT Stellar Selection**               | Random NFT Allocation         |                                                                                               |
| odds / better odds       | **Selection frequency**                 | Participation frequency       | "The more gestures you make, the more often you are considered in future Stellar Selections." |
| random draw / prize draw | _(banned - use:)_ **Stellar Selection** | Random selection              | "Draw" is lottery language in most jurisdictions - never use.                                 |
| sweepstakes / giveaway   | _(banned - rewrite the sentence)_       | _(banned)_                    | Regulated categories; never use in public copy.                                               |
| luck / lucky             | _(banned - rewrite the sentence)_       | _(banned)_                    | Always possible to rewrite without this word                                                  |

#### Champions

The **names** "Endurance Champion" and "Chrono-Warrior" already exist in the Solidity code (`enduranceChampionAddress`, `chronoWarriorAddress`) and in strong brand equity. The lexicon keeps them as-is in UI but offers stripped fallbacks for copy that needs to read as purely procedural:

| Current                      | Cosmic primary                | Procedural fallback     | Rationale                                                                                          |
| ---------------------------- | ----------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| Endurance Champion           | **Endurance Champion** (kept) | **Endurance Signature** | "Champion" is fine outside regulated-gambling contexts; fallback for compliance-sensitive surfaces |
| Chrono-Warrior               | **Chrono-Warrior** (kept)     | **Chrono Signature**    | Same reasoning                                                                                     |
| Endurance Champion's "reign" | **Endurance window**          | Endurance interval      | "Reign" sounds like a tournament; "window" is procedural                                           |

#### Anchoring (formerly "staking")

| Current                           | Cosmic primary                                      | Neutral fallback                    | Rationale                                              |
| --------------------------------- | --------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| stake                             | **Anchor**                                          | Dedicate                            | Anchoring an NFT to the protocol - procedural metaphor |
| staking                           | **Anchoring**                                       | Dedication                          |                                                        |
| staker                            | **Anchor-holder**                                   | Dedicated holder                    |                                                        |
| unstake                           | **Release Anchor**                                  | Withdraw Dedication                 |                                                        |
| staking yield                     | _(banned - use:)_ **Anchor distribution share**     | Protocol share                      | Never "yield"                                          |
| passive yield                     | _(banned - use:)_ **Cycle distribution to anchors** | Per-cycle protocol share            |                                                        |
| staking rewards                   | **Anchor distributions**                            | Protocol distributions              | Never "rewards" in investment sense                    |
| staking raffle eligibility (RWLK) | **Anchored-NFT Stellar Selection entry**            | Random selection from anchored NFTs |                                                        |
| stake action                      | **Anchor action**                                   | Dedication action                   |                                                        |

#### Participation CST (formerly "reward")

| Current                      | Cosmic primary                  | Neutral fallback      | Rationale                                                                               |
| ---------------------------- | ------------------------------- | --------------------- | --------------------------------------------------------------------------------------- |
| CST reward for bidding       | **Participation Imprint**       | Per-Gesture CST       | Avoid "reward" framing as compensation; imprint = "the cycle stamps your participation" |
| CST prize to winners         | **Recognition CST**             | Allocation CST        | Given for reaching a track                                                              |
| reward amount per staked NFT | **Anchor allocation per cycle** | Per-anchor allocation |                                                                                         |

#### Public-goods (formerly "charity")

| Current                                    | Cosmic primary                | Neutral fallback          | Rationale                                               |
| ------------------------------------------ | ----------------------------- | ------------------------- | ------------------------------------------------------- |
| charity                                    | **Public Goods Beneficiary**  | Public Goods Allocation   | Finishes the partial rename already in marketing README |
| charity wallet                             | **Public Goods Vault**        | Public Goods Forwarder    |                                                         |
| charity address                            | **Public Goods Address**      | Beneficiary Address       |                                                         |
| charitable donation                        | **Public Goods Contribution** | Ecosystem Contribution    |                                                         |
| donation to charity                        | **Public Goods Contribution** | Forwarded to Public Goods | Never "donation" in a charitable-solicitation sense     |
| `CharityWallet.send()` (user-visible copy) | **Forward to Public Goods**   | Forward to beneficiary    |                                                         |

#### Participant contributions to the protocol (formerly "donation")

| Current                   | Cosmic primary                     | Neutral fallback            | Rationale                         |
| ------------------------- | ---------------------------------- | --------------------------- | --------------------------------- |
| donate ETH (`donateEth`)  | **Contribute ETH**                 | Send ETH to the Protocol    | Avoid "donate" - reads charitable |
| donate ETH with info      | **Contribute ETH with a note**     | Send ETH with attached data |                                   |
| donate token (with a bid) | **Attach a token to your gesture** | Include token with entry    |                                   |
| donate NFT (with a bid)   | **Attach an NFT to your gesture**  | Include NFT with entry      |                                   |
| donor                     | **Contributor**                    | Sender                      |                                   |
| claim donated token       | **Retrieve attached token**        | Withdraw included token     |                                   |
| claim donated NFT         | **Retrieve attached NFT**          | Withdraw included NFT       |                                   |

#### Outreach (formerly "marketing")

| Current                  | Cosmic primary              | Neutral fallback                 | Rationale |
| ------------------------ | --------------------------- | -------------------------------- | --------- |
| marketing wallet         | **Outreach Reserve**        | Ecosystem Growth Reserve         |           |
| marketing CST allocation | **Outreach CST allocation** | Growth allocation                |           |
| treasurer                | **Outreach Custodian**      | Reserve Custodian                |           |
| pay reward (marketing)   | **Disburse to contributor** | Forward to ecosystem contributor |           |
| marketer                 | **Ecosystem contributor**   | Outreach recipient               |           |

#### Protocol coordination (formerly "DAO governance")

| Current            | Cosmic primary                                 | Neutral fallback        | Rationale                                                                                         |
| ------------------ | ---------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| DAO                | **Cosmic Council**                             | Protocol Coordination   | De-corporatize - avoids shareholder framing; mirrors how Optimism / Gitcoin talk about themselves |
| DAO governance     | **Protocol Coordination**                      | Community Coordination  |                                                                                                   |
| vote               | **Support / Oppose**                           | Support / Oppose        | Neutral verbs "support / oppose" are fine in primary and secondary text                           |
| proposal           | **Coordination Proposal**                      | Protocol Proposal       |                                                                                                   |
| voting power       | **Coordination weight**                        | Proposal weight         | Never "voting shares"                                                                             |
| quorum             | **Coordination quorum**                        | Participation threshold | Technical term OK                                                                                 |
| proposal threshold | **Proposal threshold**                         | (unchanged)             | Procedural, OK as-is                                                                              |
| governance token   | _(banned - use:)_ **Coordination token (CST)** | Protocol token          | Never "governance token" - reads like equity                                                      |

#### Withdrawals

| Current                       | Cosmic primary              | Neutral fallback         | Rationale                    |
| ----------------------------- | --------------------------- | ------------------------ | ---------------------------- |
| withdraw                      | **Retrieve**                | Collect                  | Never "cash out"             |
| withdraw ETH                  | **Retrieve ETH allocation** | Collect ETH allocation   |                              |
| `withdrawEverything` (button) | **Retrieve All**            | Collect All              |                              |
| claim (generic)               | **Retrieve**                | Collect                  |                              |
| timeout to withdraw           | **Open-Retrieval Window**   | General-retrieval window | After the exclusivity period |

#### The banned list (no substitutes - always rewrite the sentence)

These words should never appear in public participant-facing copy. If you find one during a copy review, the fix is to rewrite the sentence using the cosmic-protocol frame, not to find a drop-in synonym.

| Banned                                       | Closest legitimate rewrite pattern                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| bet, wager                                   | Rewrite as "gesture" or "participate in the cycle"                                                                                                     |
| jackpot, pot                                 | Rewrite as "Signature Allocation" or "Cycle Reserve"                                                                                                   |
| lottery, casino                              | Deny explicitly only in a FAQ context, using cosmic terms throughout                                                                                   |
| gambling, gamble                             | Rewrite as "participate" or "make a gesture"                                                                                                           |
| draw, draws, drawing, prize draw, lucky draw | Always "Stellar Selection" (cosmic) or "random selection" (neutral). "Draw" is lottery language - never use.                                           |
| sweepstakes, giveaway                        | Never - rewrite as "Stellar Selection" and describe the allocation track procedurally. "Sweepstakes" has its own regulated category; do not invoke it. |
| game, gaming                                 | Always "protocol" (cosmic/neutral). Exception: "game-theoretic" as an academic phrase discussing mechanism design is acceptable.                       |
| play, player, players                        | Always "participate", "participant", "participants".                                                                                                   |
| compete, competing, competition, contest     | Rewrite as "participate" or "take part". "Competition" is a regulated category in the UK and elsewhere.                                                |
| tournament                                   | Never - rewrite around the cycle structure.                                                                                                            |
| earn, earnings                               | Always "receive", "is imprinted with", or "is allocated". "Earn" imports a securities / compensation frame.                                            |
| income                                       | Never - rewrite as "cycle distribution" or "allocation".                                                                                               |
| degen, ape, moon, lambo                      | Rewrite entirely - no substitution needed                                                                                                              |
| alpha (as in "pure alpha")                   | Rewrite as "early insight" or "strategy guide"                                                                                                         |
| ROI, return on investment                    | Rewrite as "cycle distribution" - never quantify as a return                                                                                           |
| dividend, interest, yield                    | Always "cycle distribution to anchors"                                                                                                                 |
| profit, profits                              | Rewrite as "allocation" or "distribution"                                                                                                              |
| cash out                                     | Always "retrieve"                                                                                                                                      |
| tax-deductible                               | Never use                                                                                                                                              |
| investor, investment                         | Always "participant", "participation"                                                                                                                  |
| house, house edge                            | Never - there is no house                                                                                                                              |
| ticket                                       | Always "gesture" or "entry"                                                                                                                            |
| odds                                         | Always "selection frequency"                                                                                                                           |
| win, winning, won                            | Rewrite around "Recipient", "is allocated", or the specific allocation track. Acceptable only in casual Discord voice; never in marketing or the dapp. |

### C.1a - Alternate "bid" replacements considered

Full list of candidates evaluated before landing on **Gesture**, preserved so any future swap is mechanical rather than another round of brainstorming. Each row gives the hero line, the button label, and the word's primary strength and drawback when stacked against the chosen frame.

| Word                 | Hero line                                  | Button             | Verb     | Narrative noun     | Strength                                                                                                          | Drawback                                                                                          |
| -------------------- | ------------------------------------------ | ------------------ | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Gesture** (chosen) | "Every Gesture shapes the Signature."      | "Make a Gesture"   | make     | Performance Cycle  | Embodied, human, artistic. "A signature gesture" is a real English phrase. Furthest from tech/engineering jargon. | Slightly softer than "bid"; may read as ephemeral to readers used to financial commitment framing |
| Note                 | "Every Note shapes the Signature."         | "Sound a Note"     | sound    | Composition Cycle  | Musical, brand-charged ("a signature note"), invokes _Music of the Spheres_; strongest alternative                | Slight risk of literal-musical reading (e.g. "what song is playing?")                             |
| Mark                 | "Every Mark shapes the Signature."         | "Place your Mark"  | place    | _(keep "Cycle")_   | Plain, universal, directly brand-aligned (signature = mark). Most accessible.                                     | Utilitarian; less evocative than other options                                                    |
| Seal                 | "Every Seal shapes the Signature."         | "Place your Seal"  | place    | _(keep "Cycle")_   | Ceremonial, premium, ancient-signature feel (wax seals, signets).                                                 | Can feel formal / heraldic; less playful                                                          |
| Stroke               | "Every Stroke shapes the Signature."       | "Add a Stroke"     | add      | Composition Cycle  | Painterly, perfect fit for the generative-art NFT; "the last stroke completes the painting"                       | Can read as athletic/medical in some contexts                                                     |
| Verse                | "Every Verse shapes the Signature."        | "Add your Verse"   | add      | Composition Cycle  | Poetic, Whitman / Apple-ad energy; highly emotional.                                                              | Literary register may feel heavy for a dapp                                                       |
| Moment               | "Every Moment shapes the Signature."       | "Mark the Moment"  | mark     | _(keep "Cycle")_   | Most emotional; "a signature moment" is a real phrase; ties to the cycle's time mechanic.                         | Very abstract; weak as a concrete on-screen noun                                                  |
| Glyph                | "Every Glyph shapes the Signature."        | "Etch a Glyph"     | etch     | _(keep "Cycle")_   | Arcane, visual, unique. Ties to constellations (glyphs in the sky).                                               | Niche vocabulary; unfamiliar to many readers                                                      |
| Orbit                | "Every Orbit shapes the Signature."        | "Enter your Orbit" | enter    | _(keep "Cycle")_   | Maximum cosmic-brand reinforcement.                                                                               | Does not pair with "signature" as a phrase; requires more setup                                   |
| Ember                | "Every Ember shapes the Signature."        | "Cast an Ember"    | cast     | _(keep "Cycle")_   | Warm, kinetic, light-the-cycle-forward imagery.                                                                   | Not specifically brand-charged to "signature"                                                     |
| Pulse                | "Every Pulse shapes the Signature."        | "Send a Pulse"     | send     | _(keep "Cycle")_   | Cosmic (pulsars), short, punchy.                                                                                  | Still reads tech/radio; closest cousin of "Signal"                                                |
| Transmission         | "Every Transmission shapes the Signature." | "Transmit"         | transmit | Transmission Cycle | Matches a coherent radio/protocol world.                                                                          | Engineering-jargon feel - the reason "Signal" was rejected                                        |
| Beacon               | "Every Beacon shapes the Signature."       | "Set a Beacon"     | set      | _(keep "Cycle")_   | Strong visual (lighthouses, space beacons).                                                                       | Weak verb morphology                                                                              |
| Flare                | "Every Flare shapes the Signature."        | "Launch a Flare"   | launch   | _(keep "Cycle")_   | Very cosmic (solar flares), urgent.                                                                               | Mostly a noun; verb form is weaker                                                                |
| Move                 | "Every Move shapes the Signature."         | "Make your Move"   | make     | _(keep "Cycle")_   | Game-like; plain.                                                                                                 | Drops the cosmic metaphor on this specific word                                                   |

**How to swap.** If a future copy review decides to change course, the mechanical recipe is:

1. Global-replace in this file: `Gesture → X`, `make → <new verb>`, `Performance → <new narrative noun>` (omit the last if the chosen row keeps `Cycle`).
2. Re-render the Section C.0 narrative paragraph using the chosen row's word, verb, and narrative noun.
3. Re-render the Section E primary-button labels and Section F contract-call-bridge labels.
4. No other files are affected. The contract ABI stays untouched regardless.

### C.2 Seven most-load-bearing words - extended rationale

For the seven terms that appear hundreds of times across the repo, a one-paragraph note so a copywriter can choose between cosmic and neutral without second-guessing.

**1. `bid` → Gesture (primary) / Entry (neutral).** "Bid" appears in roughly every public file. _Gesture_ works beautifully in narrative copy ("Every gesture shapes the Signature" / "Make your gesture before the Performance closes") and carries a naturally artistic, embodied register that is almost impossible to misread as a wager. _Entry_ is right for UI where the user has never seen the cosmic frame ("Submit Entry"). Never leave "Bid" in final public copy.

**2. `auction` → Calibration Window (primary) / Price Window (neutral).** The mechanic is a descending price with a known floor over a known duration - which is exactly what "Calibration Window" communicates without the auction-law payload. _Price Window_ is the plain description and is safe on any surface.

**3. `prize` → Allocation (primary) / Distribution (neutral).** "Prize" is the single highest-risk word in the entire repo. Every instance must change. _Allocation_ reads as procedural protocol output; _Distribution_ is the plain-English equivalent. Reserve "Signature Allocation" specifically for the 25% main-prize slot so it has brand identity.

**4. `winner` → Recipient (primary) / Designated Participant (neutral).** "Winner" implies a contest decided by chance or a game where everyone else lost. _Recipient_ simply describes who receives a given allocation. Acceptable to use "won the Main Prize" only in casual Discord voice; never in marketing or the dapp.

**5. `raffle` → Stellar Selection (primary) / Random Allocation (neutral).** "Raffle" is regulated by name in many U.S. states. _Stellar Selection_ is the cosmic-brand rendering of a random selection; _Random Allocation_ is the plainest procedural framing. The previously-used term _Stellar Draw_ has been retired (2026-04-23) because "draw" is the canonical lottery verb in the UK, Australia, Canada, and most U.S. states - see B.7.1.

**6. `yield` → Cycle distribution to anchors (primary) / Protocol share (neutral).** The most dangerous word in the staking section. Every "yield" must go. Say explicitly: _"Anchored NFTs receive a share of each cycle's ETH distribution proportional to the number of NFTs anchored."_

**7. `charity` → Public Goods Beneficiary (primary) / Public Goods Allocation (neutral).** Finish the rename the brand team already started. Also clearly say, once, on the FAQ: _"This is a forwarding of ETH to a public-goods address (currently Protocol Guild). It is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment."_

---

## Section D - Before/After Copy Transformations

Six concrete rewrites taken directly from current files, to show the lexicon applied end-to-end. Use these as paste-ready templates for the follow-up rewrite pass.

### D.1 Hero headline

**Current** ([`marketing/landing-page.html`](landing-page.html) lines 361-368):

> The Last Bidder Wins. But So Does Everyone Else.
>
> Cosmic Signature is the strategic on-chain game where every round creates 10+ winners. Zero ETH goes to any team wallet. 7% funds Ethereum core development. 50% rolls into a growing prize pool. Bid with ETH or CST. Earn NFTs. Stake for yield. Shape the game through DAO governance.

**Cosmic rewrite:**

> Every Gesture Shapes the Signature.
>
> Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures across a Performance Cycle; when the Performance closes, the protocol distributes its reserves across more than ten allocation tracks. Zero ETH accrues to any team wallet. 7% of every cycle is forwarded to Protocol Guild, funding Ethereum's core contributors. About half of each cycle's ETH compounds into the next. Make a gesture with ETH or CST. Receive Cosmic Signature NFTs. Anchor NFTs to share in per-cycle distributions. Coordinate the protocol through the Cosmic Council.

**Neutral rewrite** (for dapp hero, compliance-sensitive surfaces):

> Every Entry Shapes the Cycle.
>
> Cosmic Signature is a procedural on-chain protocol on Arbitrum. Participants submit entries during a cycle; when the cycle finalization window closes, the protocol distributes its reserves across more than ten allocation tracks. No ETH is allocated to any team wallet. Roughly half of each cycle's ETH rolls into the next. Participate with ETH or CST. Anchor NFTs to share in per-cycle distributions. Coordinate the protocol through on-chain coordination proposals.

### D.2 Stats bar numbers

**Current** ([`marketing/landing-page.html`](landing-page.html) lines 377-400):

| Stat | Label                      |
| ---- | -------------------------- |
| 10+  | Prize Categories Per Round |
| 50%  | ETH Rolls to Next Round    |
| 0%   | ETH to Team / Creators     |
| 7%   | Funds Ethereum Development |
| 100  | CST Earned Per Bid         |

**Rewrite:**

| Stat | Cosmic label                | Neutral label               |
| ---- | --------------------------- | --------------------------- |
| 10+  | Allocation Tracks per Cycle | Allocation tracks per cycle |
| ~50% | ETH Rolls into Next Cycle   | ETH rolls into next cycle   |
| 0%   | ETH to Team Wallets         | ETH to team wallets         |
| 7%   | Forwarded to Protocol Guild | Forwarded to Protocol Guild |
| 100  | CST Imprinted per Gesture   | CST per entry               |

### D.3 ETH-flow bars (where the money goes)

**Current** ([`marketing/landing-page.html`](landing-page.html) lines 442-470): "Main Prize (Last Bidder) 25%", "Chrono-Warrior (Longest EC Reign) 8%", "Protocol Guild (Ethereum Development) 7%", "COSMIC NFT Stakers (Passive Yield) 6%", "ETH Raffle (3 Random Bidders) 4%", "Rolls to Next Round (Growing Pool) ~50%".

**Cosmic rewrite:**

| %    | Cosmic label                                                               |
| ---- | -------------------------------------------------------------------------- |
| 25%  | Signature Allocation (Final Gesture)                                       |
| 8%   | Chrono-Warrior Allocation (Longest Endurance Window)                       |
| 7%   | Public Goods Allocation (Protocol Guild - 170+ Ethereum core contributors) |
| 6%   | Anchor Distribution (Cosmic Signature NFT holders who anchor)              |
| 4%   | Stellar Selection Allocation (3 participants selected at random)           |
| ~50% | Compounding Cycle Reserve (rolls into next cycle)                          |

**Neutral rewrite:**

| %    | Neutral label                                          |
| ---- | ------------------------------------------------------ |
| 25%  | Cycle Main Allocation (Last Participant)               |
| 8%   | Chrono-Warrior Allocation (longest endurance interval) |
| 7%   | Forwarded to Protocol Guild                            |
| 6%   | Anchored-NFT Share                                     |
| 4%   | Random Allocation across 3 Participants                |
| ~50% | Rolls into Next Cycle                                  |

### D.4 "Prize card" grid (10+ ways to win)

**Current** ([`marketing/landing-page.html`](landing-page.html) lines 479-527): Six cards titled "Main Prize (Last Bidder)", "Chrono-Warrior", "Endurance Champion", "Last CST Bidder", "ETH Raffles (3 Winners)", "NFT Raffles" - each framed around _winning_.

**Rewrite:** rename the section from **"Multiple Winners Every Round"** to **"Allocation Tracks per Cycle"**. Example card rewrites:

- **Main Prize (Last Bidder)** → **Signature Allocation - Final Gesture.** _"25% of the cycle's ETH reserve, plus one Cosmic Signature NFT and a Recognition CST allocation, are directed to whoever made the final gesture when the Performance closed."_
- **ETH Raffles (3 Winners)** → **ETH Stellar Selection - 3 Participants.** _"4% of the cycle's ETH reserve is split across three participants selected at random. Every gesture you make increases your selection frequency in future Stellar Selections."_ (Previously read: "More bids = better odds.")
- **NFT Raffles** → **NFT Stellar Selection.** _"Up to ten participants and up to ten anchored-Random-Walk-NFT holders are each allocated a Cosmic Signature NFT and a Recognition CST allocation through on-chain random selection."_
- **Last CST Bidder** → **Final CST Gesture Allocation.** _"The participant who made the final CST gesture of the cycle receives a Cosmic Signature NFT and a Recognition CST allocation."_

### D.5 FAQ: "Is this a lottery or casino?"

**Current** ([`marketing/press-kit.md`](press-kit.md) lines 312-313):

> **Q: Is this a lottery or casino?**
> A: No. Cosmic Signature is a strategy game where players make active decisions: when to bid, which currency to use...

**Rewrite:**

> **Q: Is this a lottery, casino, or gambling product?**
> A: No. Cosmic Signature is a procedural on-chain protocol where participants make gestures over the duration of a Performance Cycle. The outcome of each cycle is determined by a combination of (a) who made the final gesture before the Performance closed, (b) who sustained the longest endurance intervals, and (c) on-chain random selection across a defined set of allocation tracks. There is no prize, no wager, no entry fee in the casino sense, and no house. Every gesture results in a deterministic on-chain imprint of CST to the participant. The protocol additionally forwards 7% of each cycle's ETH to the Protocol Guild public-goods address; this is a forwarding of funds, not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment. Cosmic Signature is not licensed as, and is not marketed as, a lottery, raffle, casino product, securities offering, or charitable fundraising vehicle in any jurisdiction.

### D.6 X launch thread opener

**Current** ([`marketing/x-launch-thread-may-7-2026.md`](x-launch-thread-may-7-2026.md) lines 7-11):

> Cosmic Signature begins where most launches end: with 60+ ETH in the contract.
>
> May 7, 2026 at 9:00 PM ET. Anyone can participate: 15 ETH minimum to the winner, the first Cosmic Signature NFT, and 7% of every round to @ProtocolGuild. Support Ethereum's future by participating.

**Rewrite:**

> Cosmic Signature opens with 60+ ETH already seeded into the protocol.
>
> May 7, 2026, 9:00 PM ET. Anyone can make a gesture. Based on the opening reserve alone: the first cycle's Signature Allocation is on the order of 15 ETH, the first Cosmic Signature NFT ever minted is directed to whoever makes the final gesture, and 7% of every cycle is forwarded to @ProtocolGuild - the collective that funds Ethereum's core contributors. By participating, you help fund the infrastructure Ethereum itself runs on.

---

## Section E - Dapp Screen-by-Screen Labels

Reference table the frontend team can implement literally. All strings are UI labels only - they do not change the underlying contract calls (Section F maps them 1:1). Both **Cosmic** and **Neutral** columns are shown; pick one voice for the whole dapp.

### E.1 Connect-wallet screen

No rename needed - standard Web3 pattern. Use the exact wallet vendor's recommended copy.

### E.2 Home / active cycle screen

| Underlying field                                     | Current likely label | Cosmic label                                            | Neutral label               |
| ---------------------------------------------------- | -------------------- | ------------------------------------------------------- | --------------------------- |
| `roundNum`                                           | Round 47             | **Cycle 47**                                            | Cycle 47                    |
| `roundActivationTime` (before start)                 | Round opens in...    | **Cycle opens in...**                                   | Cycle opens in...           |
| `mainPrizeTime`                                      | Main Prize Time      | **Performance closes in...**                            | Cycle finalization in...    |
| `lastBidderAddress`                                  | Last Bidder          | **Last Participant** (person) / **Final Gesture** (act) | Most recent participant     |
| `lastCstBidderAddress`                               | Last CST Bidder      | **Last CST Participant** / **Final CST Gesture**        | Most recent CST participant |
| `enduranceChampionAddress`                           | Endurance Champion   | **Endurance Champion** (kept)                           | Endurance Champion          |
| `chronoWarriorAddress`                               | Chrono-Warrior       | **Chrono-Warrior** (kept)                               | Chrono-Warrior              |
| `getTotalNumBids(roundNum)`                          | Total Bids           | **Total Gestures**                                      | Total entries               |
| `getNextEthBidPrice()`                               | Next ETH Bid Price   | **Next ETH Gesture Cost**                               | Next ETH entry cost         |
| `getNextCstBidPrice()`                               | Next CST Bid Price   | **Next CST Gesture Cost**                               | Next CST entry cost         |
| `getMainEthPrizeAmount()`                            | Main Prize           | **Signature Allocation**                                | Cycle main allocation       |
| `getChronoWarriorEthPrizeAmount()`                   | Chrono-Warrior Prize | **Chrono-Warrior Allocation**                           | Chrono-Warrior allocation   |
| `getRaffleTotalEthPrizeAmountForBidders()`           | ETH Raffle Pool      | **ETH Stellar Selection Reserve**                       | Random ETH allocation pool  |
| `getCosmicSignatureNftStakingTotalEthRewardAmount()` | Staking ETH Yield    | **Anchor ETH Distribution**                             | Anchored-NFT ETH allocation |
| `getCharityEthDonationAmount()`                      | Charity ETH          | **Public Goods Allocation**                             | Protocol Guild allocation   |

Page title: **"Cosmic Signature - Cycle 47"** (cosmic) / **"Cosmic Signature - Round 47"** (neutral).

Primary CTA (big button): **"Make a Gesture"** (cosmic) / **"Submit an Entry"** (neutral).

### E.3 Make-a-Gesture modal (four tabs)

All four tabs call the corresponding `bid*` contract function. No contract change. Primary-button copy per tab:

| Tab                   | Cosmic title                      | Cosmic button         | Neutral button          | Contract call                          |
| --------------------- | --------------------------------- | --------------------- | ----------------------- | -------------------------------------- |
| ETH                   | **Make a Gesture - ETH**          | "Make - N.NNNN ETH"   | "Submit - N.NNNN ETH"   | `bidWithEth(randomWalkNftId, message)` |
| CST                   | **Make a Gesture - CST**          | "Make - N.NNNN CST"   | "Submit - N.NNNN CST"   | `bidWithCst(priceMaxLimit, message)`   |
| ETH + attached ERC-20 | **Make a Gesture + Attach Token** | "Make + Attach Token" | "Submit + Attach Token" | `bidWithEthAndDonateToken(...)`        |
| ETH + attached NFT    | **Make a Gesture + Attach NFT**   | "Make + Attach NFT"   | "Submit + Attach NFT"   | `bidWithEthAndDonateNft(...)`          |

Tab-level helper text (cosmic):

- _"A gesture extends the Performance and positions you as the participant who made the most recent gesture. Every gesture also imprints 100 CST into your wallet."_
- _"The ETH Calibration Window sets a descending cost until the opening gesture is made. Afterward, each gesture costs marginally more than the previous one."_
- _"The CST Calibration Window resets after each CST gesture and calibrates the cost downward over time."_

Optional Random-Walk NFT field: **"Attach a Random Walk NFT for a 50% Gesture-Cost discount (one-time use per NFT)."**

Optional message field: **"Gesture message (optional, up to N characters - visible on-chain)."**

### E.4 Finalize-Cycle modal

Replaces the current "Claim Main Prize" UI.

- Title: **"Finalize Cycle 47"** (cosmic) / **"Close Cycle 47"** (neutral).
- Body: _"The Performance has closed. You are the participant who made the final gesture, so you may finalize the cycle. Finalization distributes every Allocation Track in one on-chain transaction, mints Cosmic Signature NFTs to all recipients, and opens the next cycle after the between-cycles delay."_
- Allocation preview (cosmic):
  - **Signature Allocation (you): N.NN ETH, 1 Cosmic Signature NFT, N CST**
  - **Chrono-Warrior Allocation: N.NN ETH to 0xABC...**
  - **Anchor Distribution: N.NN ETH split across M anchored NFTs**
  - **Stellar Selection Allocations: 3 × ~N.NN ETH**
  - **Public Goods Forwarding: N.NN ETH → Protocol Guild**
  - **Compounding into Next Cycle: ~N.NN ETH**
- Open-finalization note: _"After the exclusivity window (~1 day), any address may finalize this cycle."_
- Primary button: **"Finalize Cycle"** → calls `claimMainPrize()`.

### E.5 Anchor screen (formerly Stake)

| UI element                  | Cosmic label                                    | Neutral label          | Contract call                                            |
| --------------------------- | ----------------------------------------------- | ---------------------- | -------------------------------------------------------- |
| Screen title                | **Anchor NFTs to the Protocol**                 | Dedicate NFTs          | -                                                        |
| Anchor one                  | **Anchor NFT**                                  | Dedicate NFT           | `stake(nftId)`                                           |
| Anchor many                 | **Anchor Multiple NFTs**                        | Dedicate multiple NFTs | `stakeMany(nftIds)`                                      |
| Release                     | **Release Anchor**                              | Withdraw dedication    | `unstake(stakeActionId)`                                 |
| Release many                | **Release Multiple Anchors**                    | Withdraw multiple      | `unstakeMany(ids)`                                       |
| Pending ETH                 | **Pending Anchor Distribution**                 | Pending allocation     | (read `rewardAmountPerStakedNft` minus recorded initial) |
| "Your current anchor share" | **Your anchor share of the cycle distribution** | Your per-cycle share   | -                                                        |

Helper text: _"Each Cosmic Signature NFT can be anchored once, ever. While anchored, it receives a pro-rata share of ETH distributions allocated to anchored NFTs each cycle. Released anchors cannot be re-anchored."_

### E.6 Cosmic Council screen (formerly DAO)

| UI element        | Cosmic label                     | Neutral label          | Contract call       |
| ----------------- | -------------------------------- | ---------------------- | ------------------- |
| Screen title      | **Cosmic Council**               | Protocol Coordination  | -                   |
| Create a proposal | **Open a Coordination Proposal** | New proposal           | `propose(...)`      |
| Cast a vote       | **Support / Oppose**             | Support / Oppose       | `castVote(...)`     |
| Delegate          | **Delegate Coordination Weight** | Delegate voting weight | `delegate(...)`     |
| Your voting power | **Your Coordination Weight**     | Your weight            | `getVotes(address)` |

Primary-button copy never uses "vote" on-surface; the **Support** / **Oppose** buttons describe the action without invoking shareholder-democracy imagery.

Help-text explicitly says: _"CST is a coordination token, not an ownership instrument. Coordination weight is not equity, not a right to profits, and not a claim on any entity's assets."_

### E.7 Retrieve screen (formerly PrizesWallet withdrawals)

| UI element               | Cosmic label                                                                                            | Neutral label                                               | Contract call                |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| Screen title             | **Retrieve Allocations**                                                                                | Collect allocations                                         | -                            |
| Retrieve ETH for a cycle | **Retrieve ETH Allocation**                                                                             | Collect ETH                                                 | `withdrawEth(roundNum)`      |
| Retrieve many            | **Retrieve All ETH Allocations**                                                                        | Collect all ETH                                             | `withdrawEthMany(roundNums)` |
| Retrieve attached ERC-20 | **Retrieve Attached Token**                                                                             | Collect attached token                                      | `claimDonatedToken(...)`     |
| Retrieve attached NFT    | **Retrieve Attached NFT**                                                                               | Collect attached NFT                                        | `claimDonatedNft(index)`     |
| Retrieve everything      | **Retrieve Everything**                                                                                 | Collect everything                                          | `withdrawEverything(...)`    |
| Exclusivity banner       | **Your allocations are retrievable until [date]. After that, anyone may retrieve them on your behalf.** | (same, substituting "your allocations" for "your balances") | -                            |

### E.8 Error toasts (translations for every `CosmicSignatureErrors` custom error)

The contract throws 26 custom errors (see [`contracts/production/libraries/CosmicSignatureErrors.sol`](../contracts/production/libraries/CosmicSignatureErrors.sol)). Each needs a human-facing toast. Cosmic voice on the left; neutral fallback in parentheses. The error **name** (e.g. `BidHasBeenPlacedInCurrentRound`) remains unchanged on-chain.

| Error                            | Player-facing toast                                                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FirstRound`                     | "This action isn't available during the very first cycle. (Action unavailable in the first round.)"                                                                                               |
| `RoundIsInactive`                | "The cycle isn't open yet. It opens in {duration}. (Round not yet active.)"                                                                                                                       |
| `RoundIsActive`                  | "The cycle is already in progress. (Round is active.)"                                                                                                                                            |
| `NoBidsPlacedInCurrentRound`     | "No gestures have been made yet in this cycle. (No entries placed in this round.)"                                                                                                                |
| `BidHasBeenPlacedInCurrentRound` | "A gesture has already been made in this cycle. (An entry has already been placed this round.)"                                                                                                   |
| `WrongBidType`                   | "That gesture type isn't allowed right now. (That entry type isn't allowed right now.)"                                                                                                           |
| `InsufficientReceivedBidAmount`  | "Gesture cost not met. Current cost: {X}. You sent: {Y}. Please retry with at least the required amount. (Entry cost not met.)"                                                                   |
| `TooLongBidMessage`              | "Gesture message is too long ({N} characters). Please shorten it. (Entry message too long.)"                                                                                                      |
| `UsedRandomWalkNft`              | "This Random Walk NFT has already been used for a gesture-cost discount. (Already used.)"                                                                                                         |
| `CallerIsNotNftOwner`            | "You don't own this NFT. (Not the NFT owner.)"                                                                                                                                                    |
| `MainPrizeEarlyClaim`            | "The Performance hasn't closed yet. Ready in {duration}. (Too early to finalize.)"                                                                                                                |
| `MainPrizeClaimDenied`           | "Only the participant who made the final gesture may finalize the cycle right now. The open-finalization window begins in {duration}. (Only the last participant may close the round right now.)" |
| `TooLongNftName`                 | "That NFT name is too long ({N} characters). (Name too long.)"                                                                                                                                    |
| `EthWithdrawalDenied`            | "You can't retrieve this allocation yet. The open-retrieval window opens at {time}. (Not yet retrievable.)"                                                                                       |
| `DonatedTokenClaimDenied`        | "You can't retrieve this attached token yet. (Not yet retrievable.)"                                                                                                                              |
| `InvalidDonatedNftIndex`         | "That attached NFT doesn't exist. (Invalid index.)"                                                                                                                                               |
| `DonatedNftAlreadyClaimed`       | "This attached NFT has already been retrieved. (Already collected.)"                                                                                                                              |
| `DonatedNftClaimDenied`          | "You can't retrieve this attached NFT yet. (Not yet retrievable.)"                                                                                                                                |
| `ThereAreStakedNfts`             | "There are still anchored NFTs. (Still dedicated NFTs present.)"                                                                                                                                  |
| `NftHasAlreadyBeenStaked`        | "This NFT has been anchored before. Each NFT can be anchored only once. (Already dedicated once.)"                                                                                                |
| `NftStakeActionInvalidId`        | "That anchor action ID is invalid. (Invalid dedication ID.)"                                                                                                                                      |
| `NftStakeActionAccessDenied`     | "This anchor action belongs to another wallet. (Dedication belongs to another address.)"                                                                                                          |
| `UnauthorizedCaller`             | "Your wallet isn't authorized for this action. (Unauthorized.)"                                                                                                                                   |
| `FundTransferFailed`             | "The ETH transfer failed. Please retry. (Transfer failed.)"                                                                                                                                       |
| `ZeroAddress`                    | "Please enter a non-zero address. (Address cannot be zero.)"                                                                                                                                      |
| `InvalidOperationInCurrentState` | "This action isn't available in the protocol's current state. (Invalid for current state.)"                                                                                                       |

---

## Section F - The Contract-Call Bridge (for Engineers)

This table is for the frontend engineer who needs to wire UI labels to contract calls without introducing ambiguity. Every "UI string" in the left column is a cosmic-lexicon label from Section E. Every contract-call target on the right is unchanged from the current production ABI.

| UI action                         | UI label (cosmic)                             | Contract call                                                            | Interface reference                                                                                                       |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Make an ETH gesture               | "Make a Gesture - ETH"                        | `cosmicSignatureGame.bidWithEth(randomWalkNftId, message)`               | [`contracts/production/interfaces/IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 90                 |
| Make a CST gesture                | "Make a Gesture - CST"                        | `cosmicSignatureGame.bidWithCst(priceMaxLimit, message)`                 | [`contracts/production/interfaces/IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 137                |
| Make ETH gesture + attached token | "Make a Gesture + Attach Token"               | `cosmicSignatureGame.bidWithEthAndDonateToken(...)`                      | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 67                                                 |
| Make ETH gesture + attached NFT   | "Make a Gesture + Attach NFT"                 | `cosmicSignatureGame.bidWithEthAndDonateNft(...)`                        | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 74                                                 |
| Make CST gesture + attached token | "Make a Gesture + Attach Token (CST)"         | `cosmicSignatureGame.bidWithCstAndDonateToken(...)`                      | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 123                                                |
| Make CST gesture + attached NFT   | "Make a Gesture + Attach NFT (CST)"           | `cosmicSignatureGame.bidWithCstAndDonateNft(...)`                        | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 128                                                |
| Finalize cycle                    | "Finalize Cycle"                              | `cosmicSignatureGame.claimMainPrize()`                                   | [`IMainPrize.sol`](../contracts/production/interfaces/IMainPrize.sol) line 49                                             |
| Contribute ETH to the protocol    | "Contribute ETH"                              | `cosmicSignatureGame.donateEth()`                                        | [`IEthDonations.sol`](../contracts/production/interfaces/IEthDonations.sol) line 43                                       |
| Contribute ETH + note             | "Contribute ETH with a note"                  | `cosmicSignatureGame.donateEthWithInfo(data)`                            | [`IEthDonations.sol`](../contracts/production/interfaces/IEthDonations.sol) line 51                                       |
| Read current ETH gesture cost     | "Next ETH Gesture Cost"                       | `cosmicSignatureGame.getNextEthBidPrice()`                               | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 94                                                 |
| Read current CST gesture cost     | "Next CST Gesture Cost"                       | `cosmicSignatureGame.getNextCstBidPrice()`                               | [`IBidding.sol`](../contracts/production/interfaces/IBidding.sol) line 140                                                |
| Read time to finalization         | "Performance closes in"                       | `cosmicSignatureGame.getDurationUntilMainPrize()`                        | [`IMainPrizeBase.sol`](../contracts/production/interfaces/IMainPrizeBase.sol) line 12                                     |
| Read Signature Allocation (ETH)   | "Signature Allocation"                        | `cosmicSignatureGame.getMainEthPrizeAmount()`                            | [`IMainPrize.sol`](../contracts/production/interfaces/IMainPrize.sol) line 53                                             |
| Read Chrono-Warrior Allocation    | "Chrono-Warrior Allocation"                   | `cosmicSignatureGame.getChronoWarriorEthPrizeAmount()`                   | [`ISecondaryPrizes.sol`](../contracts/production/interfaces/ISecondaryPrizes.sol) line 91                                 |
| Read Stellar Selection Reserve    | "ETH Stellar Selection Reserve"               | `cosmicSignatureGame.getRaffleTotalEthPrizeAmountForBidders()`           | [`ISecondaryPrizes.sol`](../contracts/production/interfaces/ISecondaryPrizes.sol) line 95                                 |
| Read Anchor Distribution          | "Anchor ETH Distribution"                     | `cosmicSignatureGame.getCosmicSignatureNftStakingTotalEthRewardAmount()` | [`ISecondaryPrizes.sol`](../contracts/production/interfaces/ISecondaryPrizes.sol) line 99                                 |
| Read Public Goods Allocation      | "Public Goods Allocation"                     | `cosmicSignatureGame.getCharityEthDonationAmount()`                      | [`IMainPrize.sol`](../contracts/production/interfaces/IMainPrize.sol) line 59                                             |
| Read current champions            | "Current Endurance Champion / Chrono-Warrior" | `cosmicSignatureGame.tryGetCurrentChampions()`                           | [`IBidStatistics.sol`](../contracts/production/interfaces/IBidStatistics.sol) lines 38-45                                 |
| Anchor an NFT                     | "Anchor NFT"                                  | `stakingWalletCosmicSignatureNft.stake(nftId)`                           | [`IStakingWalletNftBase.sol`](../contracts/production/interfaces/IStakingWalletNftBase.sol) line 11                       |
| Anchor many NFTs                  | "Anchor Multiple NFTs"                        | `stakingWalletCosmicSignatureNft.stakeMany(ids)`                         | [`IStakingWalletNftBase.sol`](../contracts/production/interfaces/IStakingWalletNftBase.sol) line 16                       |
| Release anchor                    | "Release Anchor"                              | `stakingWalletCosmicSignatureNft.unstake(stakeActionId)`                 | [`IStakingWalletCosmicSignatureNft.sol`](../contracts/production/interfaces/IStakingWalletCosmicSignatureNft.sol) line 68 |
| Anchor Random Walk NFT            | "Anchor Random Walk NFT"                      | `stakingWalletRandomWalkNft.stake(nftId)`                                | [`IStakingWalletNftBase.sol`](../contracts/production/interfaces/IStakingWalletNftBase.sol) line 11                       |
| Release Random Walk anchor        | "Release Random Walk Anchor"                  | `stakingWalletRandomWalkNft.unstake(stakeActionId)`                      | [`IStakingWalletRandomWalkNft.sol`](../contracts/production/interfaces/IStakingWalletRandomWalkNft.sol) line 42           |
| Retrieve ETH allocation           | "Retrieve ETH Allocation"                     | `prizesWallet.withdrawEth(roundNum)`                                     | [`IPrizesWallet.sol`](../contracts/production/interfaces/IPrizesWallet.sol) line 238                                      |
| Retrieve many ETH allocations     | "Retrieve All ETH Allocations"                | `prizesWallet.withdrawEthMany(roundNums)`                                | [`IPrizesWallet.sol`](../contracts/production/interfaces/IPrizesWallet.sol) line 248                                      |
| Retrieve attached token           | "Retrieve Attached Token"                     | `prizesWallet.claimDonatedToken(roundNum, token, amount)`                | [`IPrizesWallet.sol`](../contracts/production/interfaces/IPrizesWallet.sol) line 282                                      |
| Retrieve attached NFT             | "Retrieve Attached NFT"                       | `prizesWallet.claimDonatedNft(index)`                                    | [`IPrizesWallet.sol`](../contracts/production/interfaces/IPrizesWallet.sol) line 309                                      |
| Retrieve everything               | "Retrieve Everything"                         | `prizesWallet.withdrawEverything(...)`                                   | [`IPrizesWallet.sol`](../contracts/production/interfaces/IPrizesWallet.sol) line 219                                      |
| Forward public-goods funds        | "Forward to Public Goods"                     | `charityWallet.send()`                                                   | [`ICharityWallet.sol`](../contracts/production/interfaces/ICharityWallet.sol) line 49                                     |
| Open coordination proposal        | "Open a Coordination Proposal"                | `cosmicSignatureDao.propose(...)`                                        | OpenZeppelin `IGovernor`                                                                                                  |
| Support or oppose a proposal      | "Support" / "Oppose"                          | `cosmicSignatureDao.castVote(proposalId, support)`                       | OpenZeppelin `IGovernor`                                                                                                  |
| Delegate coordination weight      | "Delegate Coordination Weight"                | `cosmicSignatureToken.delegate(delegatee)`                               | OpenZeppelin `ERC20Votes`                                                                                                 |

This bridge lets the frontend show zero regulated financial vocabulary while preserving ABI parity with the deployed contracts and every existing integrator (block explorers, subgraphs, Dune, audit reports).

---

## Section G - What Must NOT Be Renamed

Hard constraints. Each of these is deliberately left untouched, and the lexicon must not leak into any of them.

### G.1 Smart contract source (do not rename)

Every function name, struct field, event name, event field name, error name, and public state variable in:

- [`contracts/production/`](../contracts/production/) and all files beneath it.
- [`contracts/production/interfaces/`](../contracts/production/interfaces/) - all 24 interface files.
- [`contracts/production/libraries/`](../contracts/production/libraries/) - `CosmicSignatureErrors.sol`, `CosmicSignatureEvents.sol`, `CosmicSignatureConstants.sol`, `CosmicSignatureHelpers.sol`, `ArbitrumHelpers.sol`, `RandomNumberHelpers.sol`, `CryptographyHelpers.sol`.

**Why:** the ABI is the protocol's permanent external contract. Renaming a single public function changes its selector, breaking every deployed integration, every block-explorer verification, every subgraph that indexes events, every Certora specification, and every audit artifact. Any such rename would be an emergency-scale change - not a copy polish.

Examples that stay as-is: `bidWithEth`, `bidWithCst`, `claimMainPrize`, `donateEth`, `donateEthWithInfo`, `stake`, `unstake`, `getNextEthBidPrice`, `getMainEthPrizeAmount`, `getChronoWarriorEthPrizeAmount`, `getRaffleTotalEthPrizeAmountForBidders`, `withdrawEth`, `claimDonatedToken`, `claimDonatedNft`, `CharityWallet.send()`, `BidPlaced` event, `MainPrizeClaimed` event, `RaffleWinnerPrizePaid` event, `NftStaked` event, `InsufficientReceivedBidAmount` error, `MainPrizeClaimDenied` error, every field like `paidEthPrice`, `beneficiaryAddress`, `ethPrizeAmount`, `prizeCosmicSignatureNftId`.

### G.2 Events and event fields (do not rename)

All events in [`contracts/production/interfaces/`](../contracts/production/interfaces/) (e.g. `BidPlaced`, `FirstBidPlacedInRound`, `MainPrizeClaimed`, `ChronoWarriorPrizePaid`, `EnduranceChampionPrizePaid`, `LastCstBidderPrizePaid`, `RaffleWinnerBidderEthPrizeAllocated`, `RaffleWinnerPrizePaid`, `EthDonated`, `EthDonatedWithInfo`, `NftMinted`, `NftStaked`, `NftUnstaked`, `EthDepositReceived`, `DonationReceived`, `TokenDonated`, `NftDonated`, `EthReceived`, `EthWithdrawn`, `DonatedTokenClaimed`, `DonatedNftClaimed`, every `*Changed` config event) - all indexed by external systems.

### G.3 Custom errors (do not rename)

Every error in [`contracts/production/libraries/CosmicSignatureErrors.sol`](../contracts/production/libraries/CosmicSignatureErrors.sol). These surface in reverted-transaction decoders on Etherscan / Arbiscan / Tenderly / wallet UIs; the string that renders is the Solidity error name. Section E.8 shows the _participant-facing toast_ that wraps each error - the error itself stays.

### G.4 Developer documentation (do not rename)

These are for engineers, auditors, and Certora. They must match the code literally:

- [`docs/cosmic-signature-contracts-functional-requirements.md`](../docs/cosmic-signature-contracts-functional-requirements.md)
- [`docs/cosmic-signature-contracts-audit-considerations.md`](../docs/cosmic-signature-contracts-audit-considerations.md)
- [`docs/numbered-comments.md`](../docs/numbered-comments.md)
- [`docs/SIMULATOR-VERIFICATION.md`](../docs/SIMULATOR-VERIFICATION.md)
- [`certora_instructions.md`](../certora_instructions.md)
- Everything under [`live-blockchain-testing/docs/`](../live-blockchain-testing/docs/)
- Everything under [`test/src/contract-simulators/`](../test/src/contract-simulators/)
- Everything under [`tasks/docs/`](../tasks/docs/)
- [`contracts-compiling/docs/contracts-compiling.md`](../contracts-compiling/docs/contracts-compiling.md)

### G.5 Configuration, tests, scripts (do not rename)

- [`LICENSE`](../LICENSE), [`.solhint.json`](../.solhint.json), [`.solcover.js`](../.solcover.js), [`hardhat.config.js`](../hardhat.config.js), [`package.json`](../package.json), [`eslint.config.js`](../eslint.config.js), everything under [`scripts/`](../scripts/), [`tasks/`](../tasks/), [`simulation/`](../simulation/), [`src/`](../src/), [`test/`](../test/), [`slither/`](../slither/), [`smtchecker/`](../smtchecker/), [`certora/`](../certora/), and all deployment configs under [`tasks/config/`](../tasks/config/).

### G.6 The explicit promise to compliance reviewers

The lexicon says publicly, and means: **the contract is what it is**, deployed on Arbitrum, open-source, audited, and formally verified. Copy is copy. If a reviewer asks "why does the contract function say `bidWithEth` but your UI says 'Make a Gesture - ETH'?", the honest answer is: _"The contract was written against a general-purpose auction-game convention. The UI language was subsequently standardized around the cosmic-protocol frame that reflects how the protocol actually behaves. Both refer to the same on-chain operation."_ That is a defensible answer. Do not pretend the ABI does not exist.

---

## Section H - Implementation Checklist

Once this lexicon is ratified, apply it to these files in the following priority order. Do not start until a product owner has signed off on Section C.

| #   | File                                                                                                                                                                                                                                                                                                                                                                                                                       | Highest-impact terms to swap                                                                                                                           | Notes                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 1   | [`marketing/landing-page.html`](landing-page.html)                                                                                                                                                                                                                                                                                                                                                                         | bid→Gesture, auction→Calibration Window, prize→Allocation, winner→Recipient, raffle→Stellar Selection, yield→Anchor Distribution, charity→Public Goods | Highest external visibility; ~40+ term swaps                |
| 2   | [`README.md`](../README.md)                                                                                                                                                                                                                                                                                                                                                                                                | charity, donation, auction, bid, prize, raffle, stake, reward                                                                                          | Root file - regulators and journalists land here via GitHub |
| 3   | [`marketing/press-kit.md`](press-kit.md)                                                                                                                                                                                                                                                                                                                                                                                   | Same set as #1; also the FAQ rewrite from D.5                                                                                                          |                                                             |
| 4   | [`marketing/brand-identity-guide.md`](brand-identity-guide.md)                                                                                                                                                                                                                                                                                                                                                             | Replace the section-4 mini-table with a "See the Cosmic Lexicon" pointer to this file                                                                  | Single source of truth going forward                        |
| 5   | [`marketing/infographic-anatomy-of-a-round.html`](infographic-anatomy-of-a-round.html)                                                                                                                                                                                                                                                                                                                                     | Bid, Auction, Raffle, Prize, Winner, Stake labels on the visual                                                                                        | Visual - confirm typography still fits                      |
| 6   | [`marketing/explainer-video-script.md`](explainer-video-script.md)                                                                                                                                                                                                                                                                                                                                                         | Full rewrite using cosmic narrative                                                                                                                    | Re-record or re-caption video after                         |
| 7   | [`marketing/x-launch-thread-may-7-2026.md`](x-launch-thread-may-7-2026.md)                                                                                                                                                                                                                                                                                                                                                 | Use D.6 rewrite                                                                                                                                        |                                                             |
| 8   | [`marketing/cosmic-codex-strategy-guide.md`](cosmic-codex-strategy-guide.md)                                                                                                                                                                                                                                                                                                                                               | Strategy-guide vocabulary: bid timing → gesture timing, odds → selection frequency                                                                     | Also fix "sweeten the pot" idiom                            |
| 9   | [`marketing/content-calendar-12-weeks.md`](content-calendar-12-weeks.md)                                                                                                                                                                                                                                                                                                                                                   | Any template copy: bid, prize, winner, raffle; also remove "pure alpha"                                                                                |                                                             |
| 10  | [`marketing/ambassador-program.md`](ambassador-program.md), [`marketing/partnership-outreach-materials.md`](partnership-outreach-materials.md), [`marketing/influencer-target-list.md`](influencer-target-list.md), [`marketing/social-channels-setup.md`](social-channels-setup.md), [`marketing/quest-campaigns-design.md`](quest-campaigns-design.md), [`marketing/cosmic-signature-quiz.md`](cosmic-signature-quiz.md) | Same global term swap                                                                                                                                  |                                                             |
| 11  | [`docs/QUICKSTART.md`](../docs/QUICKSTART.md), [`docs/cosmic-signature-game-prizes.md`](../docs/cosmic-signature-game-prizes.md), [`docs/endurance-chrono-README.md`](../docs/endurance-chrono-README.md)                                                                                                                                                                                                                  | Player-facing docs only. Keep parenthetical "(contract: `claimMainPrize`)" hints where helpful for integrators                                         |                                                             |
| 12  | Future dapp source (not in repo)                                                                                                                                                                                                                                                                                                                                                                                           | Build from day 1 against this lexicon                                                                                                                  | Primary win - the UI ships clean                            |

**Validation step after the rewrite:** run a repo-wide search for each banned token in the table at the end of Section C.1. None should remain in participant-facing files. (The engineering files in Section G.1-G.5 may and should still contain them.)

---

## Section I - Legal Disclaimer and Escalation

**1. This document is copy guidance, not legal cover.** Renaming "bid" to "Gesture" does not remove any legal risk that would attach to the underlying mechanic. It reduces the optics and the surface area for bad-faith misreading. A regulator who reaches the contract will still see `bidWithEth` emitting `BidPlaced`. The defense is always the substance of the mechanic (skill, no house, deterministic smart-contract distribution, open-source code, no team wallet receiving ETH, public-goods forwarding), not the vocabulary.

**2. Before any public U.S. launch**, obtain review from attorneys competent in each of:

- **U.S. securities law** - the Howey test applied to CST (coordination token, not "governance token"), to anchoring ("anchor distribution", not "staking yield"), and to the compounding cycle reserve ("not an investment vehicle").
- **U.S. state gambling law** - the three-prong _prize + chance + consideration_ test applied jurisdiction-by-jurisdiction, with specific attention to Stellar Selections (random-selection allocation tracks) and the "anyone can participate" framing.
- **U.S. money-transmitter regimes (state and federal, plus FinCEN)** - because the protocol receives ETH from members of the public and forwards a percentage to a third-party public-goods address, a reviewer should assess whether this triggers any transmission or aggregation test.
- **Charitable-solicitation statutes in any jurisdiction you promote in** - even with the "Public Goods" rename, any copy that reads as fundraising solicitation may fall under state charitable-solicitation registration.
- **Consumer-protection / advertising statutes** - specifically for any stat ("15 ETH minimum to whoever makes the final gesture") that a reviewer could construe as an inducement to participate based on a prospective reward.

**3. International exposure.** Gambling, auction, and securities law vary dramatically by jurisdiction. If you promote in the EU, UK, Canada, Australia, Singapore, South Korea, or Japan, each needs its own review. Several of these have _stricter_ prize-draw rules than most U.S. states.

**4. If a regulator reaches out.** Do not respond in-channel. Do not answer on Twitter, Discord, email, or phone. Acknowledge receipt, state that you will respond through counsel, and contact your attorney the same business day. Preserve every document, message, and contract state relevant to the inquiry.

**5. Ongoing hygiene.** The lexicon is a living document. When a new marketing asset is drafted, it goes through a lexicon review before publication. When a regulator clarifies the treatment of any of the terms on the banned list (for example, if stablecoin-yield guidance evolves), this document is updated.

---

_Maintained by the Cosmic Signature team. License: CC0 1.0 Universal, consistent with the rest of the project. Updates to this document supersede the terminology section of [`marketing/brand-identity-guide.md`](brand-identity-guide.md)._

<!-- lexicon-allow-end -->
