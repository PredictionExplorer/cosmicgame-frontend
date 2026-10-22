import { whitePaperV13Facts as protocolFacts } from '@/content/protocol-facts';

import type { WhitePaperText } from './structure';
import { getWhitePaperEdition } from './types';

const cst = (amount: number): string => amount.toLocaleString('en-US');

/** English white-paper copy, keyed by the skeleton in structure.ts. */
export const whitePaperTextEn = {
  metadata: {
    title: 'Cosmic Signature White Paper 1.3 | Contract V3',
    description:
      'English white paper 1.3 describes deployed contract V3: Gesture costs, late-cycle premiums, weighted Stellar Selections, Participation CST, allocations, art provenance, and owner powers.',
  },
  breadcrumbLabel: 'White paper',
  breadcrumbs: {
    ariaLabel: 'Breadcrumb',
    homeLabel: 'Home',
  },
  hero: {
    eyebrow: 'White paper',
    subtitle: 'A Procedural On-Chain Art Protocol on Arbitrum',
    versionLabel: `Version ${getWhitePaperEdition('en').version}`,
    dateLabel: 'October 21, 2026',
    downloadLabel: 'Download PDF',
  },
  abstract: {
    heading: 'Abstract',
    paragraphs: [
      'Cosmic Signature is a procedural art protocol on Arbitrum One. Participants make Gestures with ETH or CST, extending timed Performance Cycles and recording participation for Stellar Selections. A successful finalization distributes configured portions of the ETH reserve, creates Cosmic Signature NFTs with seeds recorded on-chain, and schedules the next cycle. The remaining reserve carries forward; growth between cycles is not guaranteed.',
      'This English edition 1.3 describes deployed contract V3, checked at Arbitrum One block 517046699 on October 21, 2026 at 22:29:53 UTC. V3 pays linear Participation CST to the previous participant when a later Gesture arrives, weights participant selections by the contemporary ETH base cost, adds a late-cycle cost premium, adapts the CST decline rate, and changes allocation percentages and the main NFT count. The contract upgrade executed on October 21, 2026; publishing this paper does not change the contracts. Translated editions currently remain version 1.0.',
      'The contracts determine timing, allocations, ownership, and seed provenance. Artwork is generated off-chain; reproduction depends on the renderer revision and configuration as well as the seed. The protocol remains upgradeable and owner-configurable within the conditions described here. V3 does not automatically transfer or remove owner powers.',
    ],
  },
  tocHeading: 'Contents',
  sections: {
    introduction: {
      heading: 'Introduction',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature began with two convictions. The first is that generative art is most interesting when nothing about it is arbitrary: when every image is the output of a physical process, fixed by a seed, and anyone can rerun that process to verify the result. The second is that a protocol which holds ETH on behalf of its participants owes them a mechanical, readable answer to the question of where every wei goes.',
        },
        {
          kind: 'paragraph',
          text: 'A Performance Cycle opens at its activation time and accepts Gestures until finalization succeeds. Its countdown is a condition for finalization, not an automatic closing transaction. The Final Gesture participant has the first right to finalize; the open window in Section 3.3 later permits another caller to become the beneficiary. Further Gestures remain possible after expiry and can change that position.',
        },
        {
          kind: 'paragraph',
          text: 'Three properties anchor the design.',
        },
        {
          kind: 'list',
          items: [
            'Recorded provenance. Each NFT stores a seed on-chain. The open-source renderer computes artwork from that seed and its software configuration; image and video files are not stored by the protocol.',
            'Explicit distribution. Finalization executes the configured allocation rules. Owner powers, transfer failures, integer rounding, and omitted tracks matter when reading those rules.',
            'Visible administration. Core configuration and upgrades have restrictions, but owner powers are substantial. There is no automatic expiry or compulsory transfer to the Cosmic Council.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Sections 2 through 5 explain the system, timing, costs, and allocations. Sections 6 through 10 cover art, CST, Anchoring, the Cosmic Council, and Public Goods. Sections 11 through 14 describe security limits, deployment history, administration, and risks. Amounts use integer smallest units: ETH and CST each have 18 decimal places. Time uses seconds except the stored cycle increment, which uses microseconds. Defaults and the dated snapshot are identified separately; the intended deployment remains authoritative.',
        },
      ],
    },
    'protocol-overview': {
      heading: 'Protocol overview',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The system consists of one core contract and a ring of narrow, single-purpose contracts around it. The core, deployed behind an upgradeable proxy, runs the cycles: it prices gestures, tracks the countdown, holds the Cycle Reserve, and executes finalization. Around it sit the CST token, the Cosmic Signature NFT collection, an escrow wallet for allocations, two anchoring wallets, the Public Goods Vault, the Outreach Reserve, and the Cosmic Council.',
        },
        {
          kind: 'table',
          table: {
            columns: ['Component', 'Role'],
            rows: [
              [
                'Protocol contract',
                'Runs Performance Cycles: gesture pricing, the countdown, the Cycle Reserve, and finalization.',
              ],
              [
                'CST (ERC-20)',
                'Participation token. Created by the protocol, burned for CST Gestures or by holders and approved spenders, and used for delegated Coordination Weight.',
              ],
              [
                'Cosmic Signature NFT (ERC-721)',
                'Deterministic three-body artwork. Imprinted only at finalization, with its seed stored on-chain.',
              ],
              [
                'Random Walk NFT',
                'An earlier generative collection from the same team. Grants a one-time Gesture Cost reduction and a separate anchored Selection track.',
              ],
              [
                'Allocations Wallet',
                'Holds secondary ETH balances and attached NFTs; separate per-cycle token holders hold attached ERC-20s. Retrieval permissions have deadlines.',
              ],
              [
                'Anchoring wallets',
                'One for Cosmic Signature NFTs (ETH Anchor Distributions) and one for Random Walk NFTs (Selection eligibility).',
              ],
              [
                'Public Goods Vault',
                'Receives the Public Goods Allocation. A separate permissionless operation forwards the accumulated balance to its configured beneficiary, currently Protocol Guild.',
              ],
              [
                'Outreach Reserve',
                `Receives ${cst(protocolFacts.outreachReserveCst)} CST per cycle for community outreach.`,
              ],
              [
                'Cosmic Council',
                'On-chain coordination body in which delegated CST expresses Coordination Weight.',
              ],
            ],
          },
        },
        {
          kind: 'paragraph',
          text: 'The website, indexer, media hosting, and external marketplaces support discovery and interaction. They do not determine contract execution or guarantee liquidity. A core implementation upgrade does not replace companion contracts. An Allocations Wallet replacement requires a separate configuration action and does not migrate historical assets or deadlines (Section 5.4).',
        },
      ],
    },
    'performance-cycle': {
      heading: 'The Performance Cycle',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The first Gesture must use ETH and starts the cycle countdown and CST Calibration Window. Later ETH or CST Gestures extend the stored deadline. Finalization is a separate transaction after that deadline, subject to the eligibility rules in Section 3.3. Gesture pricing is described in Section 4.',
        },
      ],
      subsections: {
        'eth-calibration-window': {
          heading: 'Opening and the ETH Calibration Window',
          blocks: [
            {
              kind: 'paragraph',
              text: `The ETH Calibration Window begins at ${protocolFacts.ethCalibrationCeilingMultiplier} times the previous cycle's opening undiscounted base cost and descends linearly to floor(ceiling / ${protocolFacts.ethCalibrationFloorDivisor}) + 1 wei. A Random Walk NFT reduction, retained overpayment, or late premium does not enter that next-cycle ceiling. At the original one-hour increment, the descent lasts approximately two days; its duration scales with the increment. The original first cycle used a fixed ${protocolFacts.initialGestureCostEth} ETH base cost.`,
            },
            {
              kind: 'paragraph',
              text: 'Integer interpolation subtracts floor((ceiling - floor) * elapsed / duration) from the ceiling until the floor is reached. The floor then remains unless configuration changes. After the window ends and before the first Gesture, a permitted owner operation can lower that floor further by changing the opening-window divisors.',
            },
          ],
        },
        countdown: {
          heading: 'The countdown',
          blocks: [
            {
              kind: 'paragraph',
              text: `The opening Gesture sets the deadline approximately ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours ahead at original launch settings. Every later Gesture adds floor(increment / 1,000,000) seconds to the stored deadline. The increment began at one hour and grows by approximately ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% per finalized cycle, subject to integer rounding. At the snapshot it is ${protocolFacts.currentCycleIncrementMicroseconds} microseconds. There is no fixed maximum cycle length.`,
            },
            {
              kind: 'paragraph',
              text: 'A Gesture after expiry still extends the old deadline and becomes the Final Gesture. The deadline can remain in the past after that extension, permitting a contract to make a Gesture and finalize in one transaction. Overtime does not automatically restart the countdown from the current time.',
            },
          ],
        },
        finalization: {
          heading: 'Finalization and the Open-Finalization Window',
          blocks: [
            {
              kind: 'paragraph',
              text: 'When the Cycle Finalization Time expires, the participant who made the Final Gesture becomes eligible to finalize. Finalization is one transaction: it reads the protocol\u2019s ETH balance, distributes the allocation tracks of Section 5, imprints the cycle\u2019s NFTs and CST, records the seed for each new artwork, and schedules the next cycle.',
            },
            {
              kind: 'paragraph',
              text: `The Final Gesture participant has exclusive finalization access for ${protocolFacts.finalGestureExclusivityHours} hours after the stored deadline. At or after that timeout, anyone may finalize and become the beneficiary, receiving the Signature Allocation's ETH, ${cst(protocolFacts.specialAllocationCst)} CST, ${protocolFacts.mainAllocationNfts} sequential NFTs, and priority over attached assets. The endurance calculations still use the participation history. A reverting finalization does not complete any of these changes.`,
            },
            {
              kind: 'paragraph',
              text: `The next activation is scheduled from the successful finalization timestamp. The checked deployment uses ${protocolFacts.nextCycleDelayDaysAtSnapshot} days. The Solidity default is ${protocolFacts.defaultNextCycleDelayMinutes} minutes, but it is not the live delay. The owner can change this delay separately. The snapshot's upcoming cycle activation is October 22, 2026 at 00:00 UTC.`,
            },
          ],
        },
      },
    },
    gestures: {
      heading: 'Gestures',
      blocks: [
        {
          kind: 'paragraph',
          text: "Each Gesture extends the countdown, records a weighted entry for participant Stellar Selections, updates endurance records, and may create Participation CST for the previous participant. ETH adds to the reserve; CST is burned instead. The premium and the amount actually paid do not determine an entry's weight.",
        },
      ],
      subsections: {
        'eth-gestures': {
          heading: 'ETH gestures',
          blocks: [
            {
              kind: 'paragraph',
              text: `Every ETH Gesture, including the opening one, sets the next ETH base cost to base + floor(base / 100) + 1 wei at the default ${protocolFacts.ethGestureCostStepUpPercent}% step. CST Gestures do not advance this sequence. The late premium of Section 12.3 is added to the current base cost. Excess ETH is refunded only when it exceeds the configured gas-based threshold; smaller excess remains in the reserve. A failed refund reverts the Gesture. Neither the premium nor excess payment increases the next base cost or selection weight (Section 5.3).`,
            },
          ],
        },
        'random-walk-attachment': {
          heading: 'Random Walk NFT attachment',
          blocks: [
            {
              kind: 'paragraph',
              text: `An eligible Random Walk NFT gives a ${protocolFacts.randomWalkDiscountPercentage}% ETH reduction after any late premium is added: the payable half is rounded upward in wei. The NFT remains with its owner and its ID is permanently marked used; a transfer does not restore this reduction. Selection weight still uses the undiscounted, premium-free ETH base cost. This record is independent of the NFT's one-time Anchoring eligibility.`,
            },
          ],
        },
        'cst-gestures': {
          heading: 'CST gestures',
          blocks: [
            {
              kind: 'paragraph',
              text: `The CST base cost is max(0, beginning cost - elapsed seconds * decline rate), using CST smallest units. The late premium is added to this base. A CST Gesture burns the full amount due and restarts the window at the maximum of ${protocolFacts.cstCalibrationCeilingMultiplier} times its premium-free base cost, the configured ${protocolFacts.cstCalibrationCeilingMinCst} CST minimum, and the updated decline rate times ${protocolFacts.cstRestartMinimumSeconds} seconds. The premium does not raise the restarted base cost (Section 12.3).`,
            },
            {
              kind: 'paragraph',
              text: `At the default change divisor ${protocolFacts.cstDeclineRateChangeDivisor}, an ETH Gesture proposes rate + floor(rate / 100), while a CST Gesture adopts rate - floor(rate / 101). The ETH increase is accepted only when the candidate rate times ${protocolFacts.cstRestartMinimumSeconds} does not exceed the current beginning cost. After opening, an ETH Gesture changes the rate without resetting the window timestamp, so the new rate applies to its entire elapsed interval. The restart safeguard is not a cooldown; successive Gestures can arrive immediately.`,
            },
            {
              kind: 'paragraph',
              text: 'A sufficiently old window reaches zero base cost and therefore zero premium. Gas and other transaction requirements still apply. The maximum accepted CST cost protects the sender if the amount due rises before execution; inside the late window, the total CST cost need not fall monotonically. The protocol burns CST directly without a token spending approval, and the required balance must exist before Participation CST is created under Section 7.1.',
            },
            {
              kind: 'paragraph',
              text: 'CST cannot open a cycle. The decline rate carries between cycles, and the beginning cost produced by the first CST Gesture is carried into the following cycle. Without a CST Gesture that carried beginning cost stays unchanged. V3 retained the prior carried value; its new configured minimum does not immediately replace that first-window value. The first window of a later cycle can be shorter than the restart safeguard.',
            },
          ],
        },
        'messages-and-attachments': {
          heading: 'Messages and attached assets',
          blocks: [
            {
              kind: 'paragraph',
              text: `A Gesture can include up to ${protocolFacts.gestureMessageMaxLength} bytes of message data, which may be fewer characters. Attached ERC-20s are held in a per-cycle token holder; attached ERC-721s are held by the Allocations Wallet. That wallet needs the relevant approval. The beneficiary has priority to retrieve them after finalization under Section 5.4. Dedicated ETH contribution methods add to the reserve without a Gesture, weight, or Participation CST; an empty-calldata ETH transfer instead attempts an ETH Gesture with default arguments.`,
            },
          ],
        },
      },
    },
    'allocation-tracks': {
      heading: 'The Cycle Reserve and allocation tracks',
      blocks: [
        {
          kind: 'paragraph',
          text: "The Cycle Reserve is the protocol's ETH balance, including Gesture payments, retained ETH, and direct contributions. Finalization calculates configured allocations against this balance before making outgoing transfers. The following V3 values were checked at the snapshot in Appendix A.",
        },
      ],
      subsections: {
        'distribution-at-finalization': {
          heading: 'Distribution at finalization',
          blocks: [
            {
              kind: 'table',
              table: {
                columns: ['ETH track', 'Share of Cycle Reserve', 'Recipient'],
                rows: [
                  [
                    'Signature Allocation',
                    `${protocolFacts.mainEthPercentage}%`,
                    'The cycle beneficiary, normally the Final Gesture participant.',
                  ],
                  [
                    'Chrono-Warrior Allocation',
                    `${protocolFacts.chronoWarriorEthPercentage}%`,
                    'The longest-reigning Endurance Champion (Section 5.2).',
                  ],
                  [
                    'ETH Stellar Selection',
                    `${protocolFacts.stellarSelectionEthPercentage}%`,
                    `${protocolFacts.ethStellarSelectionRecipients} entries selected from the cycle\u2019s gesture pool, sharing the amount equally.`,
                  ],
                  [
                    'Anchor Distribution',
                    `${protocolFacts.anchorDistributionPercentage}%`,
                    'Anchored Cosmic Signature NFTs, pro rata.',
                  ],
                  [
                    'Public Goods Allocation',
                    `${protocolFacts.publicGoodsPercentage}%`,
                    'Protocol Guild, via the Public Goods Vault.',
                  ],
                  [
                    'Compounding Cycle Reserve',
                    `~${protocolFacts.compoundingReservePercentage}% (the remainder)`,
                    'Rolls forward into the next cycle.',
                  ],
                ],
                footnote:
                  'Percentages are read against the protocol\u2019s ETH balance at the moment of finalization.',
              },
            },
            {
              kind: 'paragraph',
              text: 'The configured outgoing shares total half of the reserve. Integer rounding and split remainders can retain additional wei. If no Cosmic Signature NFTs are anchored, their allocation stays in the reserve; a failed Public Goods transfer also leaves its share there. Retention does not guarantee that the next cycle starts larger.',
            },
            {
              kind: 'table',
              table: {
                columns: ['CST and NFT track', 'Distribution', 'Recipient'],
                rows: [
                  [
                    'Signature Allocation',
                    `${cst(protocolFacts.specialAllocationCst)} CST total and ${protocolFacts.mainAllocationNfts} NFTs`,
                    'The cycle beneficiary.',
                  ],
                  [
                    'Chrono-Warrior',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT`,
                    'The Chrono-Warrior.',
                  ],
                  [
                    'Endurance Champion',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT`,
                    'The Endurance Champion.',
                  ],
                  [
                    'Final CST Gesture',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT`,
                    'The participant who made the cycle\u2019s last CST gesture.',
                  ],
                  [
                    'NFT Stellar Selection',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT, ${protocolFacts.nftStellarSelectionRecipients} times`,
                    `${protocolFacts.nftStellarSelectionRecipients} entries selected from the gesture pool.`,
                  ],
                  [
                    'Anchored-NFT Stellar Selection',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT, ${protocolFacts.anchoredRwlkNftSelectionRecipients} times`,
                    `${protocolFacts.anchoredRwlkNftSelectionRecipients} selections across anchored Random Walk NFTs.`,
                  ],
                  [
                    'Outreach Reserve',
                    `${cst(protocolFacts.outreachReserveCst)} CST`,
                    'Community outreach (Section 7.1).',
                  ],
                ],
              },
            },
            {
              kind: 'paragraph',
              text: `A typical cycle therefore imprints ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFTs and ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST in fixed distributions, plus whatever Participation CST individual gestures imprinted along the way. Cycles with no CST gestures skip the Final CST Gesture track; cycles with no anchored Random Walk NFTs skip the anchored Selection.`,
            },
          ],
        },
        'endurance-and-chrono': {
          heading: 'Endurance Champion and Chrono-Warrior',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Two tracks measure persistence rather than position. The Endurance Champion is the participant who remained the most recent gesture maker for the longest unbroken interval during the cycle: the longest quiet gap that a single gesture survived. The Chrono-Warrior sits one level up: the participant who held the Endurance Champion title itself for the longest unbroken interval.',
            },
            {
              kind: 'paragraph',
              text: 'Records are evaluated on subsequent Gestures and finalization. The algorithm reconstructs when a new endurance record overtook the preceding one; the transaction noticing it is not necessarily the start of its reign. Strict comparisons and second-level rounding resolve ties. Repeated Gestures by one address remain distinct records. The final quiet interval is considered at finalization, so delaying that transaction can affect the recipients. The Participation CST rule in Section 7.1 is separate from this recognition.',
            },
          ],
        },
        'stellar-selections': {
          heading: 'Stellar Selections',
          blocks: [
            {
              kind: 'paragraph',
              text: `Each Gesture's weight is its contemporary undiscounted, premium-free ETH base cost, in wei. This includes CST Gestures, even at zero CST cost, and ETH Gestures using the Random Walk reduction. At finalization, ${protocolFacts.ethStellarSelectionRecipients} weighted selections share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve, and ${protocolFacts.nftStellarSelectionRecipients} weighted selections receive NFTs and CST. Repeats are allowed. Intended relative proportions follow accumulated weight rather than Gesture count; integer sampling and block-derived randomness still have the limits in Section 11.3.`,
            },
            {
              kind: 'paragraph',
              text: `A separate Anchored-NFT Stellar Selection runs across anchored Random Walk NFTs: ${protocolFacts.anchoredRwlkNftSelectionRecipients} selections, weighted by the number of NFTs each holder has anchored. This track distributes CST and Cosmic Signature NFTs only; it carries no ETH.`,
            },
            {
              kind: 'paragraph',
              text: 'The randomness behind these selections is constructed on-chain at finalization. Section 11.3 describes its sources and its limits.',
            },
          ],
        },
        'delivery-and-timeouts': {
          heading: 'Delivery, escrow, and timeouts',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Signature Allocation ETH is sent directly to the successful finalization caller; a caller unable to receive it causes finalization to revert. Secondary ETH is recorded in the Allocations Wallet and retrieved separately. CST and NFTs are created directly for recipients; NFT creation does not call an ERC-721 receiver callback, so contract recipients need a way to manage those NFTs. Public Goods ETH first goes to the configured vault, not automatically to its final beneficiary.',
            },
            {
              kind: 'paragraph',
              text: `At cycle-end registration, the wallet records a retrieval deadline using its timeout, currently ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks. At or after expiry, another caller can retrieve eligible uncollected assets for themselves; expiry does not transfer them automatically. ETH balances and deadlines are separate for each cycle and recipient, and later allocations do not extend earlier deadlines. Changing the timeout affects future registrations. Historical assets remain in their original wallet after a wallet replacement.`,
            },
          ],
        },
      },
    },
    'the-art': {
      heading: 'The art: Deterministic three-body Signatures',
      blocks: [
        {
          kind: 'paragraph',
          text: "Cosmic Signature artwork depicts the gravitational three-body problem. A seed is stored on-chain when each NFT is created; the creation event links it to a cycle. The NFT derives its seed using Keccak-256, distinct from the renderer's SHA3-256 pseudorandom stream. No explicit uniqueness check guarantees that every seed or visual output differs.",
        },
        {
          kind: 'paragraph',
          text: 'Images are generated off-chain by a Rust physics simulation and renderer, without a generative model. Gestures affect finalization timing and its chain context; messages and paid amounts are not instructions for drawing particular image features. A contract upgrade neither installs a renderer nor proves that hosted media uses a particular renderer version. Seed inputs are discussed in Section 11.3.',
        },
      ],
      subsections: {
        'art-pipeline': {
          heading: 'The pipeline',
          blocks: [
            {
              kind: 'list',
              items: [
                "Seed. A recorded seed initializes the renderer's SHA3-256 pseudorandom stream. The result also depends on the renderer revision, configuration, and execution environment.",
                'Simulation. Default search batches consider one hundred thousand candidates, with a configurable one-million-step setting for each warmup and recording phase. Candidates may be rejected early. A fourth-order Yoshida integrator advances the system.',
                'Selection. Borda-style ranking considers chaos, equilateralness, and spatial interest, then an image-space aesthetic stage evaluates a shortlist, with retry batches when needed.',
                'Camera. Seed-dependent camera and layer parameters control the view of the selected orbit.',
                'Color. A continuous perceptual palette varies hue and other color properties; the current palette is not fixed to equal hue spacing among bodies.',
                'Spectral rendering. The spectral edition uses sixty-four wavelength bins spanning 380 to 700 nanometers.',
                'Finishing. AgX tonemapping and version-specific layers, including halation, prism, diffraction spikes, and stardust, shape the output.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'The reviewed generator revision 4dc6d64e produces a 16-bit master image, web derivatives, video in web and archival formats, and metadata. The default video duration is approximately thirty seconds. These are renderer settings, not guarantees enforced by the NFT contract.',
            },
          ],
        },
        'reproducibility-and-license': {
          heading: 'Reproducibility and license',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Reproduction requires the recorded seed, the correct generator revision and configuration, and a compatible toolchain. The repository provides deterministic reference checks, but the current continuous-integration workflow does not compare generated image hashes. Cross-version or cross-machine byte identity is not promised. Access to source and chain data permits regeneration in a suitable environment; it does not guarantee uninterrupted metadata or media hosting.',
            },
            {
              kind: 'paragraph',
              text: 'Owners may name their NFTs on-chain, up to 32 bytes. Project-owned contracts, shaders, and rendering pipelines are dedicated under CC0 1.0, with no rights reserved; third-party dependencies retain their own licenses.',
            },
          ],
        },
      },
    },
    cst: {
      heading: 'The CST token',
      blocks: [
        {
          kind: 'paragraph',
          text: 'CST is an ERC-20 participation and coordination token whose initial supply was zero. The immutable protocol address authorizes creation and protocol-directed burns. Holders may also burn their own CST, and approved spenders can use allowance-based burns.',
        },
      ],
      subsections: {
        'imprint-rules': {
          heading: 'Imprint rules',
          blocks: [
            {
              kind: 'paragraph',
              text: `V3 creates Participation CST for the previous participant when a later Gesture arrives. If Alice gestures and Bob gestures next, Bob's transaction credits Alice for that elapsed interval; if Alice gestures twice, she receives it herself. The opening Gesture creates none. Finalization does not settle additional Participation CST for the Final Gesture participant. Fixed recognition allocations create ${cst(protocolFacts.specialAllocationCst)} CST each; the Signature Allocation receives that amount once in total for its ${protocolFacts.mainAllocationNfts} NFTs. The Outreach Reserve separately receives ${cst(protocolFacts.outreachReserveCst)} CST.`,
            },
            {
              kind: 'formula',
              formula: protocolFacts.dynamicCstRewardFormula,
              notation: protocolFacts.participationCstNotation,
              legend: [
                {
                  symbol: protocolFacts.participationCstSymbols[0],
                  meaning: 'seconds since the previous gesture',
                },
                {
                  symbol: protocolFacts.participationCstSymbols[1],
                  meaning: 'the Participation CST multiplier, a contract parameter',
                },
                {
                  symbol: protocolFacts.participationCstSymbols[2],
                  meaning: 'the current cycle time increment, in microseconds',
                },
              ],
              caption:
                'The result is in CST smallest units; divide by 10^18 to express CST. Elapsed seconds are multiplied by the configured multiplier, then divided by the increment in microseconds, truncating once.',
            },
            {
              kind: 'paragraph',
              text: 'The formula is linear, with a V3 multiplier of 6 * 10^25. At the original one-hour increment it creates one CST per elapsed minute; the larger snapshot increment gives slightly less. A shared timestamp produces zero. The minimum Participation CST argument constrains the amount credited to the previous participant, not an amount promised to the sender; the opening ETH Gesture skips that check. Elapsed time alone is not a retrievable CST balance.',
            },
            {
              kind: 'table',
              table: {
                columns: ['Time since previous gesture', 'Participation CST'],
                rows: protocolFacts.dynamicCstRewardExamples.map((example) => [
                  example.elapsed,
                  example.cst,
                ]),
                footnote: `Approximate displayed amounts, computed at the original time increment of exactly ${protocolFacts.dynamicCstRewardExamplesAssumeIncrementHours} hour. Amounts become lower as the increment grows; the contract reports the exact smallest-unit amount.`,
              },
            },
          ],
        },
        'supply-dynamics': {
          heading: 'Burning and supply dynamics',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST supply reflects Participation CST, fixed allocations, and burns. With every track present, finalization creates ${cst(protocolFacts.typicalCstImprintsPerCycle)} fixed CST, not one allocation for every individual NFT. Quiet intervals create Participation CST only when a subsequent Gesture executes. The complete CST cost, including the premium in Section 12.3, is burned before Participation CST is credited.`,
            },
            {
              kind: 'paragraph',
              text: 'V1 created a fixed amount for the sender of each Gesture; V2 used a square-root elapsed-time formula for that sender. V3 uses the linear formula for the previous participant. There is no scheduled economic supply cap or guaranteed supply trajectory, although the inherited voting-token representation limits total supply to 2^208 - 1 smallest units.',
            },
          ],
        },
        'coordination-weight': {
          heading: 'Coordination Weight',
          blocks: [
            {
              kind: 'paragraph',
              text: 'CST doubles as the weight token of the Cosmic Council (Section 9). Weight activates on delegation: a holder delegates to themselves or to another address, and each CST then expresses one unit of Coordination Weight. The token uses timestamp-based checkpoints, so proposal snapshots refer to wall-clock time rather than block numbers.',
            },
          ],
        },
      },
    },
    anchoring: {
      heading: 'Anchoring',
      blocks: [
        {
          kind: 'paragraph',
          text: `Anchoring is the protocol\u2019s form of long-term alignment. An owner may anchor a Cosmic Signature NFT to the protocol; while it is anchored, it accrues a proportional share of each cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution. The accrued ETH is retrieved when the anchor is released. There is no fixed term and no penalty, but anchoring is a once-per-NFT decision: each NFT can be anchored only once, ever, so releasing it permanently ends that NFT\u2019s anchoring eligibility.`,
        },
        {
          kind: 'paragraph',
          text: 'An anchor belongs to the recorded original participant until released. Ownership transfers do not restore used eligibility. Failed NFT return or ETH delivery reverts release. Integer accounting can leave residual ETH; once no Cosmic Signature NFTs remain anchored, the anchoring wallet owner can send its remaining ETH to a chosen nonzero address (Section 13).',
        },
        {
          kind: 'paragraph',
          text: `Random Walk NFTs anchor separately and for a different purpose: anchored Random Walk NFTs take part in the Anchored-NFT Stellar Selection (Section 5.3), ${protocolFacts.anchoredRwlkNftSelectionRecipients} per cycle, each carrying ${cst(protocolFacts.specialAllocationCst)} CST and a Cosmic Signature NFT. Random Walk anchoring carries no ETH distributions. The same once-ever rule applies.`,
        },
      ],
    },
    'cosmic-council': {
      heading: 'The Cosmic Council',
      blocks: [
        {
          kind: 'paragraph',
          text: `The Cosmic Council is the protocol\u2019s on-chain coordination body, built on the audited OpenZeppelin Governor framework with CST as its weight token. Any address holding at least ${protocolFacts.councilProposalThresholdCst} CST of delegated weight may submit a Coordination Proposal. Proposals wait through a ${protocolFacts.councilVotingDelayDays}-day coordination delay, then remain open for a ${protocolFacts.councilVotingPeriodWeeks}-week coordination period.`,
        },
        {
          kind: 'paragraph',
          text: `A proposal passes when two conditions hold: Support exceeds Opposition, and Support plus Abstain weight reaches the Coordination Quorum of ${protocolFacts.councilQuorumPercent}% of total CST supply. Opposition weight does not count toward the quorum. Expressing weight is a cryptographic act, not a share or an equity instrument, and delegation can be changed at any time.`,
        },
        {
          kind: 'paragraph',
          text: 'The Council uses historical checkpoints and has no separate execution timelock after a successful proposal. It can change its own coordination settings and exercise only the assets and permissions it actually controls. At the snapshot it does not own the protocol or the checked administrative wallets. Transferring an owner role to the Council and renouncing it are different operations, as Section 13 explains.',
        },
      ],
    },
    'public-goods': {
      heading: 'Public Goods',
      blocks: [
        {
          kind: 'paragraph',
          text: `The configured Public Goods Allocation is ${protocolFacts.publicGoodsPercentage}% of the Cycle Reserve. Finalization attempts to send it to the Public Goods Vault. A separate permissionless vault operation forwards the accumulated balance to its configured beneficiary, currently Protocol Guild. The vault owner can change that beneficiary. A failed transfer from the protocol is recorded and leaves that ETH in the reserve; successful forwarding to the ultimate beneficiary is not guaranteed in the finalization transaction.`,
        },
        {
          kind: 'paragraph',
          text: "This creates an explicit path for funding Ethereum's core development through Protocol Guild. The vault also accepts ETH directly outside a cycle. The Outreach Reserve is separate: its appointed treasurer distributes the CST it receives, and its owner appoints that treasurer. Neither role follows automatically from holding CST.",
        },
        {
          // lexicon-allow-start: tax-status disclaimer must name the concepts it denies.
          kind: 'note',
          text: 'This is a forwarding of ETH to a public-goods address, currently Protocol Guild. It is not a charitable contribution or a donation in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment in any jurisdiction.',
          // lexicon-allow-end
        },
      ],
    },
    security: {
      heading: 'Security, randomness, and verifiability',
      blocks: [],
      subsections: {
        'independent-review': {
          heading: 'Independent review',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Hacken reviewed an earlier Cosmic Signature contract revision in late 2025; its final report was published in January 2026. Its findings and scope belong to that reviewed revision. The report is not an independent review of every later V2 or V3 change, and exact-match source verification is not a security assessment.',
            },
            {
              kind: 'paragraph',
              text: 'The historical report includes fuzz testing of fourteen specified system invariants over ten thousand runs. Those results are evidence within that test scope, not proof of all possible executions or of the deployed V3 implementation.',
            },
            {
              kind: 'paragraph',
              text: 'The repository contains contract tests, Certora specifications, SMTChecker configuration, and static-analysis tooling. Their presence alone does not establish complete coverage or a proof of the entire deployed system. Review reports, verification results, code revisions, and deployment addresses must be considered together.',
            },
          ],
        },
        'defensive-design': {
          heading: 'Defensive design',
          blocks: [
            {
              kind: 'list',
              items: [
                'Reentrancy protection applies to guarded entry points; it is not a statement that every public function has the same guard.',
                'Escrow. Secondary ETH is held for retrieval, but other failures can still revert finalization, including inability of its caller to receive the Signature Allocation.',
                'Public Goods. Transfers have a specific failure-tolerant path. This does not make all external calls failure-tolerant or automatically retry a failed forwarding (Section 10).',
                'Configuration locks. Most core settings and upgrades require the owner and an inactive cycle. The next-cycle delay, activation controls, ownership operations, and companion settings have different conditions.',
              ],
            },
          ],
        },
        randomness: {
          heading: 'Randomness',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The protocol needs randomness twice: for the Stellar Selections at finalization and for each new NFT\u2019s seed. It builds a seed on-chain by folding together the previous block hash, the current base fee, and Arbitrum-specific entropy from the ArbSys and ArbGasInfo precompiles: the previous Arbitrum block hash, the gas backlog, and L1 pricing counters. Individual values are then derived from that seed with keccak256. The precompile calls are failure-tolerant; if one is unavailable, the construction falls back to the remaining sources.',
            },
            {
              kind: 'paragraph',
              text: 'Block-derived entropy is not an externally verified randomness service. Sequencers and transaction timing can influence inputs; the construction does not guarantee unbiased selections. Randomness affects selections and NFT seeds, while pricing, timing, and allocation arithmetic follow deterministic rules. Finalization eligibility still follows the exclusive and open windows described in Section 3.3.',
            },
          ],
        },
        'open-verification': {
          heading: 'Open verification',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The V3 runtime was checked against the local production build, accounting for its implementation-address immutable values. At the snapshot the public Sourcify lookup did not report a match for V3; public exact-match source verification is therefore not asserted here. Exact-match verification, where available, connects source and bytecode but does not prove correctness or extend a historical audit to new code. Project-owned code is CC0; third-party dependencies retain their own licenses.',
            },
          ],
        },
      },
    },
    'upgrade-history': {
      heading: 'Deployment history and V3',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Paper edition numbers and implementation versions are separate. English edition 1.3 replaces the earlier frontend English 1.0 description and its obsolete V3 proposal; it does not imply intervening published editions 1.1 or 1.2. The prior English PDF and translated 1.0 editions remain available. The following deployment dates are based on transaction records.',
        },
      ],
      subsections: {
        v1: {
          heading: 'V1: Launch',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The current proxy was deployed on April 24, 2026 at 06:42:34 UTC, block 455767589, with implementation 0x7739148013777c485AD9f3d971e1005Eca686661. V1 established the cycles and companion system. Its timing and CST rules differ from later versions. Core upgrades require the owner and an inactive cycle under the current authorization logic.',
            },
          ],
        },
        v2: {
          heading: 'V2: Historical implementation',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The V2 upgrade executed on June 21, 2026 at 19:38:53 UTC, block 475913365, with implementation 0x50eB3d05d2C463949DE9238D419385594f7AdB97. It has now been replaced by V3. Its principal changes were:',
            },
            {
              kind: 'list',
              items: [
                "Participation CST. V2 used a square-root formula and credited the current sender, unlike V3's linear credit to the previous participant.",
                'Minimum-amount protection. Gesture methods gained a minimum accepted Participation CST argument.',
                'Adaptive CST duration. The stored window duration changed with ETH and CST participation; V3 replaces its pricing role with a decline rate.',
                'Longer exclusivity. The finalization timeout increased from one day to two days.',
                'Stored-deadline extension. Later Gestures added to the stored deadline, even in overtime. Wrapping arithmetic addressed a particular next-cycle scheduling overflow path; it did not make every parameter configuration safe.',
              ],
            },
          ],
        },
        v3: {
          heading: 'V3: Deployed mechanics and late-cycle premium',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V3 was installed on October 21, 2026 at 06:53:07 UTC, block 516839618, at implementation 0xc1b97E1b0baC86248653B18706dbC5c8898c5c06. It changes Participation CST timing and recipient, participant selection weights, CST decline-rate adaptation, ETH shares, and the main NFT count. It also adds a late premium to ETH and CST costs after opening. The window is floor(increment / 3000000) seconds: about twenty minutes at the original increment and 1236 seconds at the snapshot.',
            },
            {
              kind: 'formula',
              formula:
                'L = floor(I / D); e = clamp(L - (deadline - now), 0, L)\nq = floor(e * M / I)\npremium = floor(q^k * base / 2^(13*k)); due = base + premium',
              caption:
                'I is the increment in microseconds; D = 3000000, M = 29228998656 and k = 8 at V3 initialization. The premium is skipped before opening and when e is zero.',
            },
            {
              kind: 'paragraph',
              text: 'The smooth approximation is total cost / base = 1 + 4 * (e / L)^8. At default settings this approaches five times the base at expiry and remains capped in overtime; exact integer results differ slightly. It is not the ten-times premium described in edition 1.0. The Random Walk reduction applies after the premium. Premiums do not raise subsequent base costs or selection weights, and a zero base produces zero premium.',
            },
            {
              kind: 'paragraph',
              text: "V3 initialization preserves settings it does not explicitly rewrite, including the increment, next-cycle delay, carried first CST beginning cost, and companion addresses. Historical statistics are not retroactively populated. Indexers must use the ordered proxy upgrade event as the version boundary: an unchanged event signature can carry changed meaning. The event's Participation CST amount belongs to the previous participant in V3, and its calibration value is a rate rather than the old duration. Historical wallet assets stay with the wallet that received them.",
            },
          ],
        },
      },
    },
    decentralization: {
      heading: 'Owner powers and possible future coordination',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The snapshot identifies 0x14c82Ce4E5713E88C9462680E9c02BF4a3089871 as the core protocol owner and the checked administrative-wallet owner. The Council does not acquire these roles automatically. Ownership is observable state, not an assurance that control will later disappear.',
        },
        {
          kind: 'paragraph',
          text: 'Most core setters and UUPS upgrade authorization require the owner and an inactive cycle, determined by activation time. The next-cycle delay can be changed separately; activation controls apply before the first Gesture. Ownership transfer and renunciation use inherited permissions. Companion owners separately control settings such as NFT metadata, the Public Goods beneficiary, future retrieval timeouts, the Outreach treasurer, and residual anchoring ETH when no NFTs remain anchored.',
        },
        {
          kind: 'paragraph',
          text: "An authorized upgrade can replace implementation logic. Restrictions in today's implementation are not a guarantee that a future authorized implementation preserves them. Users should evaluate the actual owner, implementation, and settings before transacting.",
        },
        {
          kind: 'paragraph',
          text: "V3 contains no automatic sunset, compulsory Council transfer, or scheduled renunciation. Transferring ownership to the Council preserves the relevant powers under collective control. Renouncing ownership disables that role's owner-only operations. Each contract has its own ownership role, so these outcomes must be evaluated separately.",
        },
        {
          kind: 'paragraph',
          text: 'Any future change in control should be described as completed only after its transaction is observable. Earlier statements of intention are not an executed transfer or a contract-enforced schedule.',
        },
      ],
    },
    clarifications: {
      heading: 'Clarifications and risk factors',
      blocks: [],
      subsections: {
        'what-it-is-not': {
          heading: 'What Cosmic Signature is not',
          blocks: [
            // lexicon-allow-start: denial copy must name the concepts it denies, matching FAQ practice.
            {
              kind: 'paragraph',
              text: 'Cosmic Signature is designed for procedural art and participation. A Gesture extends the cycle and records participation; it does not specify particular visual features. At the snapshot there is no separately configured team ETH percentage. The Outreach Reserve does receive CST under the treasurer controls in Section 10. Contract mechanics alone do not determine the legal classification of participation in every jurisdiction.',
            },
            {
              kind: 'paragraph',
              text: 'Cosmic Signature is not an investment product, and nothing in this paper is investment advice or an offer of securities. CST and Cosmic Signature NFTs are participation and art objects. The protocol makes no promises about their price, liquidity, or future value, and no one should acquire them with an expectation of profit from the efforts of others.',
            },
            // lexicon-allow-end
          ],
        },
        'risk-factors': {
          heading: 'Risk factors',
          blocks: [
            {
              kind: 'list',
              items: [
                'Smart contract risk. Historical reviews, testing, and source verification have defined scopes. Defects can remain in software that holds assets.',
                'Randomness limits. Stellar Selections use block-derived entropy and can be influenced by block production and transaction timing.',
                `Timing responsibilities. The ${protocolFacts.finalGestureExclusivityHours}-hour finalization window and the ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week escrow timeout are real deadlines. Allocations left unretrieved past them become available to others, by design.`,
                'Administrative risk. Authorized owners can change configuration and implementation under the applicable conditions; V3 has no automatic removal of those powers.',
                'Asset volatility. The values of ETH, CST, and NFTs move. Participation costs real money; treat gestures as expenditure on participation and art, not as a path to financial gain.',
                'Regulatory uncertainty. The legal treatment of digital assets varies by jurisdiction and continues to evolve.',
              ],
            },
          ],
        },
      },
    },
    conclusion: {
      heading: 'Conclusion',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature connects a public clock, configured reserve allocations, participation records, and procedurally generated art. V3 changes both costs and recognition, including who receives Participation CST and how entries are weighted. The source, dated deployment evidence, and live configuration allow these rules to be checked; neither reserve growth, asset value, unbiased randomness, nor future removal of owner powers is guaranteed.',
        },
      ],
    },
    'appendix-a': {
      heading: 'Appendix A: Contract addresses at the snapshot',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Contract', 'Address (Arbitrum One)'],
            rows: [
              ['Protocol contract (proxy)', protocolFacts.contractAddresses.proxy],
              ['Protocol implementation (V3)', protocolFacts.contractAddresses.implementation],
              ['CST token', protocolFacts.contractAddresses.cstToken],
              ['Cosmic Signature NFT', protocolFacts.contractAddresses.cosmicSignatureNft],
              ['Random Walk NFT', protocolFacts.contractAddresses.randomWalkNft],
              ['Cosmic Council', protocolFacts.contractAddresses.cosmicCouncil],
              ['Public Goods Vault', protocolFacts.contractAddresses.publicGoodsVault],
              ['Outreach Reserve', protocolFacts.contractAddresses.outreachReserve],
              ['Allocations Wallet', protocolFacts.contractAddresses.allocationsWallet],
              [
                'Anchoring Wallet, Cosmic Signature NFTs',
                protocolFacts.contractAddresses.cosmicSignatureNftAnchoringWallet,
              ],
              [
                'Anchoring Wallet, Random Walk NFTs',
                protocolFacts.contractAddresses.rwlkAnchoringWallet,
              ],
            ],
            footnote:
              'Arbitrum One, chain 42161, block 517046699, October 21, 2026 at 22:29:53 UTC. Block hash: 0x5bcc8f77b3674f5611f559353689ae1d87d59cb12a92add2b46581ef1448b395. The EIP-1967 implementation slot points to V3. These are dated observations; inspect live state before transacting. The upgrade history appears in Section 12.',
          },
        },
      ],
    },
    'appendix-b': {
      heading: 'Appendix B: Parameters at a glance',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Parameter', 'Value'],
            rows: [
              ['Opening cost, first cycle', `${protocolFacts.initialGestureCostEth} ETH (fixed)`],
              [
                'ETH Calibration Window ceiling',
                'Twice the preceding opening undiscounted base cost',
              ],
              [
                'ETH Calibration Window floor',
                `ceiling / ${protocolFacts.ethCalibrationFloorDivisor}, plus one wei`,
              ],
              [
                'ETH Gesture Cost step-up',
                `${protocolFacts.ethGestureCostStepUpPercent}% per ETH gesture, plus one wei`,
              ],
              [
                'Random Walk NFT reduction',
                `${protocolFacts.randomWalkDiscountPercentage}%, once ever per NFT`,
              ],
              [
                'CST Calibration Window ceiling',
                'max(twice premium-free CST base, configured minimum, updated rate * 180 seconds)',
              ],
              ['CST Calibration Window floor', `${protocolFacts.cstCalibrationFloorCst} CST`],
              [
                'CST decline-rate adaptation',
                'ETH candidate: rate + floor(rate / 100), subject to safeguard; CST: rate - floor(rate / 101)',
              ],
              [
                'Initial countdown after opening gesture',
                `about ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours at launch`,
              ],
              [
                'Time increment per gesture',
                `${protocolFacts.initialCycleTimeIncrementHours} hour at launch, growing ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% per cycle`,
              ],
              [
                'Finalization exclusivity window',
                `${protocolFacts.finalGestureExclusivityHours} hours`,
              ],
              [
                'Escrow retrieval timeout',
                `${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks, then open retrieval`,
              ],
              ['Gesture message limit', `${protocolFacts.gestureMessageMaxLength} bytes`],
              [
                'ETH allocation tracks',
                `${protocolFacts.mainEthPercentage}% Signature, ${protocolFacts.chronoWarriorEthPercentage}% Chrono-Warrior, ${protocolFacts.publicGoodsPercentage}% Public Goods, ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution, ${protocolFacts.stellarSelectionEthPercentage}% ETH Stellar Selection`,
              ],
              [
                'Compounding Cycle Reserve',
                `about ${protocolFacts.compoundingReservePercentage}% rolls forward`,
              ],
              ['Recognition CST per allocation', `${cst(protocolFacts.specialAllocationCst)} CST`],
              ['Outreach Reserve per cycle', `${cst(protocolFacts.outreachReserveCst)} CST`],
              [
                'Typical imprints per cycle',
                `${protocolFacts.typicalNftsPerCycle} NFTs, ${cst(protocolFacts.typicalCstImprintsPerCycle)} fixed CST`,
              ],
              [
                'Council parameters',
                `${protocolFacts.councilProposalThresholdCst} CST proposal threshold, ${protocolFacts.councilVotingDelayDays}-day delay, ${protocolFacts.councilVotingPeriodWeeks}-week period, ${protocolFacts.councilQuorumPercent}% quorum`,
              ],
              [
                'Delay before next cycle',
                `${protocolFacts.nextCycleDelayDaysAtSnapshot} days at snapshot; ${protocolFacts.defaultNextCycleDelayMinutes} minutes is the Solidity default`,
              ],
            ],
          },
        },
      ],
    },
  },
  references: {
    heading: 'References',
    items: [
      {
        label: 'Cosmic Signature V3 source at reviewed revision 9d1a6447',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature/tree/9d1a644744e0ee588ef5af1947f6decdf8bdb3f3/contracts/production',
      },
      {
        label: 'Cosmic Signature app',
        href: 'https://app.cosmicsignature.com',
      },
      {
        label: 'Cosmic Signature protocol site',
        href: 'https://cosmicsignature.com',
      },
      {
        label: 'Hacken security review of the Cosmic Signature contracts, January 2026',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
      },
      {
        label: 'Protocol Guild documentation',
        href: 'https://protocol-guild.readthedocs.io',
      },
      {
        label: 'OpenZeppelin Governor documentation',
        href: 'https://docs.openzeppelin.com/contracts/5.x/governance',
      },
      {
        label: 'Reviewed art generator revision 4dc6d64e',
        href: 'https://github.com/PredictionExplorer/CS-Image-Generation/tree/4dc6d64e8ec93bef5f4303ea034857b16189e6e9',
      },
      {
        label: 'Arbitrum One',
        href: 'https://arbitrum.io',
      },
      {
        label: 'V3 upgrade transaction, October 21, 2026',
        href: 'https://arbiscan.io/tx/0x6adb029eadca055f12ded5d48c606edd8f84dad3433e0eab08d841d7962569ad',
      },
      {
        label: 'V3 implementation public source-verification lookup',
        href: 'https://repo.sourcify.dev/42161/0xc1b97E1b0baC86248653B18706dbC5c8898c5c06',
      },
      {
        label: 'Detailed V2-to-V3 change register',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature/blob/e24542a4ac5f4cd28afa2f5f6d83d66975f4f753/docs/v3-vs-v2-changes.md',
      },
      {
        label: 'Historical English white paper 1.0',
        href: 'https://cosmicsignature.com/white-paper/cosmic-signature-white-paper-v1.0.pdf',
      },
    ],
  },
  licenseNote:
    'This paper, like all project-owned Cosmic Signature materials, is dedicated to the public domain under CC0 1.0.',
  reading: {
    railLabel: 'On this page',
    openContentsLabel: 'Contents',
    backToTopLabel: 'Back to top',
    headingLinkTemplate: 'Link to this section: {title}',
    formulaLabel: 'Formula',
    noteLabel: 'Note',
    contractExpressionLabel: 'The expression in the contract',
    figureTemplate: 'Figure {number}',
    readingTimeTemplate: '{minutes} min read',
    newTabNote: '(opens in a new tab)',
  },
  figures: {
    cycle: {
      title: 'A Performance Cycle, from opening to the next cycle',
      caption:
        'Opening durations are original defaults; the next-cycle delay is the dated live setting. Section 3 distinguishes them.',
      steps: [
        {
          label: 'Opening',
          detail:
            'The ETH Calibration Window lowers the opening cost until someone makes the first gesture.',
        },
        {
          label: 'Gestures',
          detail: `Each subsequent Gesture adds the time increment to the countdown: ${protocolFacts.initialCycleTimeIncrementHours} hour at launch.`,
        },
        {
          label: 'Final Gesture window',
          detail: `Once the countdown expires, only the Final Gesture participant may finalize, for ${protocolFacts.finalGestureExclusivityHours} hours.`,
        },
        {
          label: 'Open finalization',
          detail: 'After that, anyone may finalize and take over the beneficiary\u2019s role.',
        },
        {
          label: 'Next cycle',
          detail: `The next activation is scheduled ${protocolFacts.nextCycleDelayDaysAtSnapshot} days after finalization at the snapshot setting.`,
        },
      ],
    },
    allocation: {
      title: 'Where the Cycle Reserve goes at finalization',
      caption:
        'Shares of the protocol\u2019s ETH balance at finalization. The remainder, about half, compounds into the next cycle.',
    },
    art: {
      title: 'Two Signatures from the collection',
      caption:
        'Artwork derives from the recorded seed together with its renderer revision and configuration.',
      seedLabel: 'Seed',
    },
  },
} satisfies WhitePaperText;
