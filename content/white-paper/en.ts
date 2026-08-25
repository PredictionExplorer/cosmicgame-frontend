import { protocolFacts } from '@/content/protocol-facts';

import {
  WHITE_PAPER_DATE_DISPLAY,
  WHITE_PAPER_PATH,
  WHITE_PAPER_PDF_PATH,
  WHITE_PAPER_VERSION,
  type WhitePaperContent,
} from './types';

const cst = (amount: number): string => amount.toLocaleString('en-US');

export const whitePaperContentEn = {
  metadata: {
    title: 'Cosmic Signature White Paper | A Procedural On-Chain Art Protocol',
    description:
      'The reference description of Cosmic Signature: Performance Cycles, gestures, allocation tracks, deterministic three-body NFT art, CST, anchoring, the Cosmic Council, protocol upgrades, and the path to full decentralization.',
    path: WHITE_PAPER_PATH,
  },
  breadcrumbLabel: 'White Paper',
  breadcrumbs: {
    ariaLabel: 'Breadcrumb',
    homeLabel: 'Home',
  },
  hero: {
    eyebrow: 'White paper',
    title: 'Cosmic Signature',
    subtitle: 'A Procedural On-Chain Art Protocol on Arbitrum',
    authorName: 'Taras Bobrovytsky',
    authorEmail: 'taras@cosmicsignature.com',
    versionLabel: `Version ${WHITE_PAPER_VERSION}`,
    dateLabel: WHITE_PAPER_DATE_DISPLAY,
    downloadLabel: 'Download PDF',
    downloadHref: WHITE_PAPER_PDF_PATH,
  },
  abstract: {
    heading: 'Abstract',
    paragraphs: [
      'Cosmic Signature is a procedural art protocol on Arbitrum One. It runs as a sequence of timed Performance Cycles. During a cycle, participants make gestures with ETH or with CST, the protocol\u2019s ERC-20 token. Every gesture extends the cycle\u2019s countdown, records an entry in the cycle\u2019s Stellar Selections, and can imprint new CST. When the countdown expires and the cycle is finalized, the protocol distributes its ETH reserve across more than ten allocation tracks, imprints a new generation of Cosmic Signature NFTs, and forwards a fixed share to Protocol Guild, the funding mechanism for more than 170 Ethereum core contributors. About half of the reserve rolls forward, so each cycle begins larger than the last.',
      'Each Cosmic Signature NFT is a deterministic rendering of the gravitational three-body problem, generated from an on-chain seed and reproducible by anyone, pixel for pixel. No neural network touches the image. This paper describes the mechanics and token design in full, documents the V2 upgrade that is live today, presents the planned V3 upgrade, and sets out the commitment to remove every form of privileged control from the deploying address once the design is complete.',
    ],
  },
  tocHeading: 'Contents',
  sections: [
    {
      id: 'introduction',
      number: '1',
      heading: 'Introduction',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature began with two convictions. The first is that generative art is most interesting when nothing about it is arbitrary: when every image is the output of a physical process, fixed by a seed, and anyone can rerun that process to verify the result. The second is that a protocol which holds ETH on behalf of its participants owes them a mechanical, readable answer to the question of where every wei goes.',
        },
        {
          kind: 'paragraph',
          text: 'The result is a protocol built around time. A Performance Cycle opens, fills with gestures, and closes when its countdown runs out. A gesture is a small on-chain act: it carries ETH or CST, it may carry a short message or an attached asset, and it pushes the cycle\u2019s finalization time further into the future. The participant whose gesture stands last when the countdown expires, the Final Gesture, finalizes the cycle. Finalization distributes the reserve, imprints the cycle\u2019s NFTs, and prepares the next cycle.',
        },
        {
          kind: 'paragraph',
          text: 'Three properties anchor the design.',
        },
        {
          kind: 'list',
          items: [
            'Determinism. The artwork is computed from a seed recorded on-chain at imprint time. The rendering pipeline is open source, and the same seed always produces the same image and video, bit for bit.',
            'Mechanical distribution. Allocation percentages are constants in verified contracts. No discretionary account sits between participants and the distribution rules, and no team wallet receives ETH from gestures.',
            'A finite role for the team. Owner powers are narrow, are locked while a cycle runs, and are scheduled to be removed entirely once the remaining upgrades land.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'This paper is the reference description of the protocol. Section 2 sketches the system. Sections 3 through 5 specify cycles, gestures, and allocations. Section 6 covers the art. Sections 7 through 10 cover CST, anchoring, the Cosmic Council, and Public Goods. Section 11 covers security and verifiability. Sections 12 and 13 record the upgrade history and the road to full decentralization, and Section 14 states plainly what the protocol is not. Numbers quoted in this paper are contract constants or launch values of on-chain parameters; the deployed contracts, listed in Appendix A, remain the final authority.',
        },
      ],
    },
    {
      id: 'protocol-overview',
      number: '2',
      heading: 'Protocol Overview',
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
                'Participation token. Imprinted only by the protocol, burned when spent on gestures, and expresses Coordination Weight once delegated.',
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
                'Escrow for secondary ETH allocations and assets attached to gestures, with an open retrieval timeout.',
              ],
              [
                'Anchoring wallets',
                'One for Cosmic Signature NFTs (ETH Anchor Distributions) and one for Random Walk NFTs (Selection eligibility).',
              ],
              [
                'Public Goods Vault',
                'Receives and forwards the per-cycle Public Goods Allocation. The beneficiary is currently Protocol Guild.',
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
          text: 'Around the contracts, an ecosystem has grown: the app at app.cosmicsignature.com, the Axiom Zero marketplace for the NFTs, Uniswap liquidity for CST on Arbitrum, and Chaos Zero, a prediction venue for cycle outcomes. None of these are required. Every mechanic in this paper can be exercised directly against the contracts.',
        },
      ],
    },
    {
      id: 'performance-cycle',
      number: '3',
      heading: 'The Performance Cycle',
      blocks: [
        {
          kind: 'paragraph',
          text: 'A cycle is a window in time. It opens with descending-cost Calibration Windows, fills with gestures, and ends when the Cycle Finalization Time expires and someone finalizes it. This section covers the clock; Section 4 covers the gestures themselves.',
        },
      ],
      subsections: [
        {
          id: 'eth-calibration-window',
          number: '3.1',
          heading: 'Opening and the ETH Calibration Window',
          blocks: [
            {
              kind: 'paragraph',
              text: `Each cycle must open with an ETH gesture, and the ETH Calibration Window sets its cost. The window begins at ${protocolFacts.ethCalibrationCeilingMultiplier} times the opening cost actually paid in the previous cycle and declines linearly to a floor of one two-hundredth of that starting value, plus one wei. At launch parameters the descent takes about two days; its duration is tied to the cycle time increment, so it stretches slowly as the protocol ages. If the window fully elapses before anyone gestures, the cost simply rests at the floor. The first cycle opened at a fixed ${protocolFacts.initialGestureCostEth} ETH.`,
            },
            {
              kind: 'paragraph',
              text: 'This opening mechanism performs price discovery without an order book. If the previous cycle opened too cheap, the doubling restores headroom; if the doubled value proves too high, the two-day descent finds the level at which someone is willing to begin.',
            },
          ],
        },
        {
          id: 'countdown',
          number: '3.2',
          heading: 'The Countdown',
          blocks: [
            {
              kind: 'paragraph',
              text: `The opening gesture starts the clock, setting the Cycle Finalization Time about ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours ahead at launch parameters. Every subsequent gesture, whether ETH or CST, adds the current time increment to the stored finalization time. The increment began at exactly one hour and grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle, so cycles lengthen gradually and the pace of NFT imprinting slows over the years. There is no hard bound on a cycle\u2019s length while gestures keep arriving; in practice, rising Gesture Costs make indefinite extension expensive.`,
            },
            {
              kind: 'paragraph',
              text: 'Extensions apply to the stored time, not to the present moment. A gesture made after the countdown has expired, but before finalization executes, adds one increment to the stored value and takes over the Final Gesture position. It does not restart the clock.',
            },
          ],
        },
        {
          id: 'finalization',
          number: '3.3',
          heading: 'Finalization and the Open-Finalization Window',
          blocks: [
            {
              kind: 'paragraph',
              text: 'When the Cycle Finalization Time expires, the participant who made the Final Gesture becomes eligible to finalize. Finalization is one transaction: it reads the protocol\u2019s ETH balance, distributes the allocation tracks of Section 5, imprints the cycle\u2019s NFTs and CST, records the seed for each new artwork, and schedules the next cycle.',
            },
            {
              kind: 'paragraph',
              text: `The Final Gesture participant holds this right exclusively for ${protocolFacts.finalGestureExclusivityHours} hours. After that, the Open-Finalization Window begins: anyone may finalize, and the contract treats whoever does as the cycle\u2019s beneficiary, with everything the role carries: the Signature Allocation\u2019s ETH share, its CST imprint, its NFT, and priority over attached assets. The rule is deliberately unforgiving. It keeps the protocol alive if a participant disappears, and it prices carelessness: a beneficiary who does not act within two days has left the role open to the first caller.`,
            },
            {
              kind: 'paragraph',
              text: `After finalization, the next cycle activates following a short delay, ${protocolFacts.defaultNextCycleDelayMinutes} minutes by default, and its Calibration Windows open.`,
            },
          ],
        },
      ],
    },
    {
      id: 'gestures',
      number: '4',
      heading: 'Gestures',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Gestures are the protocol\u2019s only input. Each one, regardless of currency, extends the countdown, records one entry in the cycle\u2019s participant Stellar Selections, updates the endurance clocks of Section 5.2, and can imprint Participation CST as described in Section 7.1.',
        },
      ],
      subsections: [
        {
          id: 'eth-gestures',
          number: '4.1',
          heading: 'ETH Gestures',
          blocks: [
            {
              kind: 'paragraph',
              text: `After the opening gesture, each ETH gesture raises the next ETH Gesture Cost by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei. The sequence is public and exact: anyone can read the current cost from the contract before acting. Overpayment above a dust threshold is refunded in the same transaction; below that threshold a refund would cost more in gas than it returns, so the difference stays in the reserve.`,
            },
          ],
        },
        {
          id: 'random-walk-attachment',
          number: '4.2',
          heading: 'Random Walk NFT Attachment',
          blocks: [
            {
              kind: 'paragraph',
              text: `A participant who owns a Random Walk NFT may attach it to one ETH gesture for a ${protocolFacts.randomWalkDiscountPercentage}% reduction in that gesture\u2019s cost. The NFT is not transferred; the contract marks it used. Each Random Walk NFT can be attached exactly once across all cycles, which makes the reduction a consumable resource and ties a fixed external collection into the protocol\u2019s economy.`,
            },
          ],
        },
        {
          id: 'cst-gestures',
          number: '4.3',
          heading: 'CST Gestures',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST offers a second way in. The CST Calibration Window starts at ${protocolFacts.cstCalibrationCeilingMultiplier} times the cost paid for the previous CST gesture, and never below ${protocolFacts.cstCalibrationCeilingMinCst} CST, then declines linearly to zero over the window\u2019s duration. Every CST gesture restarts the window from its new starting value, and the CST spent is burned, permanently removed from supply.`,
            },
            {
              kind: 'paragraph',
              text: `The window\u2019s duration is itself a live parameter, and it is one of the protocol\u2019s quieter feedback loops. It began at a ${protocolFacts.initialCstCalibrationWindowHours}-hour reference. Each ETH gesture shortens it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, and each CST gesture lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%. Heavy ETH activity therefore speeds the CST descent, making CST gestures attractive sooner; heavy CST activity slows it back down. The loop nudges every cycle toward a balanced mix of the two currencies.`,
            },
            {
              kind: 'paragraph',
              text: 'Because the descent can reach zero, a long quiet period can make a CST gesture nearly free. That is intentional. It guarantees the cycle can always be extended by anyone holding even a small CST balance, and the burn on every CST gesture ties the token\u2019s supply to actual use. A participant submitting a CST gesture specifies the maximum cost they accept, so a gesture landing later than expected cannot spend more than authorized.',
            },
            {
              kind: 'paragraph',
              text: 'The first gesture of every cycle must be ETH; CST gestures are available from the second gesture onward.',
            },
          ],
        },
        {
          id: 'messages-and-attachments',
          number: '4.4',
          heading: 'Messages and Attached Assets',
          blocks: [
            {
              kind: 'paragraph',
              text: `A gesture may carry a message of up to ${protocolFacts.gestureMessageMaxLength} bytes, recorded on-chain alongside it. A gesture may also attach ERC-20 tokens or an ERC-721 NFT. Attached assets do not join the ETH reserve; they are held by the Allocations Wallet, and the cycle\u2019s beneficiary has priority to retrieve them after finalization, subject to the open retrieval timeout of Section 5.4.`,
            },
          ],
        },
      ],
    },
    {
      id: 'allocation-tracks',
      number: '5',
      heading: 'The Cycle Reserve and Allocation Tracks',
      blocks: [
        {
          kind: 'paragraph',
          text: 'All ETH paid for gestures accumulates in the protocol contract, together with roughly half of every previous cycle\u2019s reserve. This balance is the Cycle Reserve. Finalization reads it once and distributes fixed percentages of it.',
        },
      ],
      subsections: [
        {
          id: 'distribution-at-finalization',
          number: '5.1',
          heading: 'Distribution at Finalization',
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
                    'Public Goods Allocation',
                    `${protocolFacts.publicGoodsPercentage}%`,
                    'Protocol Guild, via the Public Goods Vault.',
                  ],
                  [
                    'Anchor Distribution',
                    `${protocolFacts.anchorDistributionPercentage}%`,
                    'Anchored Cosmic Signature NFTs, pro rata.',
                  ],
                  [
                    'ETH Stellar Selection',
                    `${protocolFacts.stellarSelectionEthPercentage}%`,
                    `${protocolFacts.ethStellarSelectionRecipients} entries drawn from the cycle\u2019s gesture pool, sharing the amount equally.`,
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
              text: 'The five distributed tracks sum to half of the reserve. The remainder compounds: the protocol accumulates rather than extracts, and each cycle opens with a larger reserve than the last. If a cycle finalizes with no Cosmic Signature NFTs anchored, that cycle\u2019s Anchor Distribution is skipped and its share compounds as well.',
            },
            {
              kind: 'table',
              table: {
                columns: ['CST and NFT track', 'Distribution', 'Recipient'],
                rows: [
                  [
                    'Signature Allocation',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT`,
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
                    `${protocolFacts.nftStellarSelectionRecipients} entries drawn from the gesture pool.`,
                  ],
                  [
                    'Anchored-NFT Stellar Selection',
                    `${cst(protocolFacts.specialAllocationCst)} CST and one NFT, ${protocolFacts.anchoredRwlkNftSelectionRecipients} times`,
                    `${protocolFacts.anchoredRwlkNftSelectionRecipients} draws across anchored Random Walk NFTs.`,
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
        {
          id: 'endurance-and-chrono',
          number: '5.2',
          heading: 'Endurance Champion and Chrono-Warrior',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Two tracks measure persistence rather than position. The Endurance Champion is the participant who remained the most recent gesture maker for the longest unbroken interval during the cycle: the longest quiet gap that a single gesture survived. The Chrono-Warrior sits one level up: the participant who held the Endurance Champion title itself for the longest unbroken interval.',
            },
            {
              kind: 'paragraph',
              text: 'The distinction is subtle but real. A participant who gestures during a slow afternoon and is not displaced for ten hours sets a strong endurance interval. Whether they end the cycle as its Chrono-Warrior depends on how long that record stands before another participant surpasses it. Endurance measures the gap you created; the Chrono track measures how long your record survived. Both resolve only at finalization.',
            },
          ],
        },
        {
          id: 'stellar-selections',
          number: '5.3',
          heading: 'Stellar Selections',
          blocks: [
            {
              kind: 'paragraph',
              text: `Each gesture records one entry in the cycle\u2019s participant Selection pool. At finalization, the contract draws ${protocolFacts.ethStellarSelectionRecipients} entries for the ETH Stellar Selection, which share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally, and ${protocolFacts.nftStellarSelectionRecipients} entries for the NFT Stellar Selection. Draws are made with replacement, so the same participant can be drawn more than once, and entries scale with gestures made: selection frequency is proportional to participation.`,
            },
            {
              kind: 'paragraph',
              text: `A separate Anchored-NFT Stellar Selection runs across anchored Random Walk NFTs: ${protocolFacts.anchoredRwlkNftSelectionRecipients} draws, weighted by the number of NFTs each holder has anchored. This track distributes CST and Cosmic Signature NFTs only; it carries no ETH.`,
            },
            {
              kind: 'paragraph',
              text: 'The randomness behind these draws is constructed on-chain at finalization. Section 11.3 describes its sources and its limits.',
            },
          ],
        },
        {
          id: 'delivery-and-timeouts',
          number: '5.4',
          heading: 'Delivery, Escrow, and Timeouts',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Distribution is deliberately split between push and pull. The Signature Allocation\u2019s ETH goes directly to the beneficiary during finalization, as does the Public Goods forwarding. The Chrono-Warrior\u2019s ETH and the ETH Selection shares are placed in the Allocations Wallet, an escrow contract, from which each recipient retrieves at their convenience. CST and NFTs are imprinted directly to their recipients during finalization.',
            },
            {
              kind: 'paragraph',
              text: `Escrowed allocations and attached assets wait ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks. After that, the contracts permit anyone to retrieve an unretrieved allocation for themselves. The rule mirrors the Open-Finalization Window: nothing in the protocol waits forever on an absent participant, and every distribution eventually reaches a hand that wants it. Retrieve promptly.`,
            },
          ],
        },
      ],
    },
    {
      id: 'the-art',
      number: '6',
      heading: 'The Art: Deterministic Three-Body Signatures',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Every Cosmic Signature NFT is a rendering of the gravitational three-body problem: three celestial bodies of comparable mass orbiting under Newtonian gravity. The three-body problem has no general closed-form solution, and its trajectories are chaotic; an imperceptible change in starting conditions produces a completely different dance. That chaos is the collection\u2019s engine. The seed decides the starting conditions, physics does the rest, and no two Signatures repeat.',
        },
        {
          kind: 'paragraph',
          text: 'No generative model is involved at any stage. There is no training data, no sampling, and no prompt. The pipeline is a physics simulation followed by a renderer, written in Rust, published as open source, and fully deterministic.',
        },
      ],
      subsections: [
        {
          id: 'art-pipeline',
          number: '6.1',
          heading: 'The Pipeline',
          blocks: [
            {
              kind: 'list',
              items: [
                'Seed. At imprint time the contract derives a 32-byte seed from on-chain data (Section 11.3) and stores it with the NFT. The seed initializes a SHA3-256 random number generator; everything downstream is a pure function of it.',
                'Simulation. One hundred thousand candidate configurations are integrated for one million physics steps each, using a fourth-order Yoshida symplectic integrator, which preserves the system\u2019s energy behavior over long horizons.',
                'Selection. A Borda rank aggregation scores candidates on chaos and on the equilateralness of the triangle the bodies form, then picks the most visually interesting orbit from the pool.',
                'Camera. A slow elliptical camera drift moves the viewpoint through the orbit, giving each Signature a cinematic parallax.',
                'Color. Colors are mixed in the OKLab perceptual space with 120-degree hue separation per body, modulated by drift and a sine wave.',
                'Spectral rendering. Sixty-four wavelength bins spanning 380 to 700 nanometers render the orbit trails with velocity-dependent thickness and depth of field.',
                'Finishing. AgX tonemapping, bloom, OpenSimplex nebula layers, and color grading complete the frame.',
              ],
            },
            {
              kind: 'paragraph',
              text: 'The output for every NFT is a 16-bit PNG and a 30-second H.265 video.',
            },
          ],
        },
        {
          id: 'reproducibility-and-license',
          number: '6.2',
          heading: 'Reproducibility and License',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Determinism is enforced, not assumed. The same seed produces the same image, pixel for pixel, on any machine, and SHA-256 hashes of generated frames are asserted in continuous integration. Because every seed is stored on-chain and the pipeline is public, the collection does not depend on any server. If every server disappeared tomorrow, every Signature could be regenerated from the chain.',
            },
            {
              kind: 'paragraph',
              text: 'Owners may name their NFTs on-chain, up to 32 bytes. Project-owned contracts, shaders, and rendering pipelines are dedicated under CC0 1.0, with no rights reserved; third-party dependencies retain their own licenses.',
            },
          ],
        },
      ],
    },
    {
      id: 'cst',
      number: '7',
      heading: 'The CST Token',
      blocks: [
        {
          kind: 'paragraph',
          text: 'CST is the protocol\u2019s ERC-20 token. Its supply starts at zero, and the token contract accepts imprint and burn instructions only from the protocol contract. Every CST in circulation traces back to participation in a cycle.',
        },
      ],
      subsections: [
        {
          id: 'imprint-rules',
          number: '7.1',
          heading: 'Imprint Rules',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST enters circulation through three flows. Participation CST is imprinted at gesture time by the formula below. Recognition CST is imprinted at finalization: ${cst(protocolFacts.specialAllocationCst)} CST accompanies each of the cycle\u2019s NFT distributions, ${protocolFacts.typicalNftsPerCycle} in a typical cycle. Finally, ${cst(protocolFacts.outreachReserveCst)} CST per cycle goes to the Outreach Reserve, which the team uses for community outreach; it is the only recurring CST flow the team directs, and it carries no special powers.`,
            },
            {
              kind: 'formula',
              formula: protocolFacts.dynamicCstRewardFormula,
              caption:
                'Participation CST imprinted by a gesture. Elapsed time is measured since the previous gesture and scaled against the current cycle time increment.',
            },
            {
              kind: 'paragraph',
              text: 'In plain terms, the amount grows with the square root of the time since the previous gesture. A gesture arriving one second after the last imprints almost nothing; a gesture that ends a day of silence imprints hundreds of CST.',
            },
            {
              kind: 'table',
              table: {
                columns: ['Time since previous gesture', 'Participation CST'],
                rows: protocolFacts.dynamicCstRewardExamples.map((example) => [
                  example.elapsed,
                  example.cst,
                ]),
                footnote: `Computed at the launch time increment of exactly ${protocolFacts.dynamicCstRewardExamplesAssumeIncrementHours} hour. Amounts drift slightly lower as the increment grows; the live app preview and the contract are the source of truth.`,
              },
            },
          ],
        },
        {
          id: 'supply-dynamics',
          number: '7.2',
          heading: 'Burning and Supply Dynamics',
          blocks: [
            {
              kind: 'paragraph',
              text: `CST leaves circulation whenever it is spent: the full cost of every CST gesture is burned. Supply is therefore shaped by behavior. Quiet cycles imprint little Participation CST, active CST usage burns supply back down, and the fixed Recognition and Outreach flows add a predictable ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST per typical cycle. There is no cap, no premine, and no team allocation.`,
            },
            {
              kind: 'paragraph',
              text: 'The square-root formula is itself a supply control, introduced in the V2 upgrade (Section 12.2). The original design imprinted a flat 100 CST per gesture, which made machine-speed gesture sequences an unbounded source of new CST. Under the current rule, a burst of rapid gestures imprints approximately zero, while patient participation is what creates supply.',
            },
          ],
        },
        {
          id: 'coordination-weight',
          number: '7.3',
          heading: 'Coordination Weight',
          blocks: [
            {
              kind: 'paragraph',
              text: 'CST doubles as the weight token of the Cosmic Council (Section 9). Weight activates on delegation: a holder delegates to themselves or to another address, and each CST then expresses one unit of Coordination Weight. The token uses timestamp-based checkpoints, so proposal snapshots refer to wall-clock time rather than block numbers.',
            },
          ],
        },
      ],
    },
    {
      id: 'anchoring',
      number: '8',
      heading: 'Anchoring',
      blocks: [
        {
          kind: 'paragraph',
          text: `Anchoring is the protocol\u2019s form of long-term alignment. An owner may anchor a Cosmic Signature NFT to the protocol; while it is anchored, it accrues a proportional share of each cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution. The accrued ETH is retrieved when the anchor is released. There is no fixed term and no penalty, but anchoring is a once-per-NFT decision: each NFT can be anchored only once, ever, so releasing it permanently ends that NFT\u2019s anchoring eligibility.`,
        },
        {
          kind: 'paragraph',
          text: 'The once-ever rule replaces the usual lock-up schedule with a single irreversible choice, and it gives the anchored set a real cost of exit. Whether to keep an NFT anchored is a live decision every cycle; whether to release it is a permanent one.',
        },
        {
          kind: 'paragraph',
          text: `Random Walk NFTs anchor separately and for a different purpose: anchored Random Walk NFTs receive draws in the Anchored-NFT Stellar Selection (Section 5.3), ${protocolFacts.anchoredRwlkNftSelectionRecipients} per cycle, each carrying ${cst(protocolFacts.specialAllocationCst)} CST and a Cosmic Signature NFT. Random Walk anchoring carries no ETH distributions. The same once-ever rule applies.`,
        },
      ],
    },
    {
      id: 'cosmic-council',
      number: '9',
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
          text: 'Today the Council coordinates alongside the team\u2019s scoped owner role. After the decentralization step of Section 13, it is the only coordination layer the protocol has.',
        },
      ],
    },
    {
      id: 'public-goods',
      number: '10',
      heading: 'Public Goods',
      blocks: [
        {
          kind: 'paragraph',
          text: `Every cycle forwards ${protocolFacts.publicGoodsPercentage}% of the Cycle Reserve to the Public Goods Vault, whose beneficiary is currently Protocol Guild, the collective funding mechanism for more than 170 Ethereum core protocol contributors. The forwarding is enforced on-chain as part of finalization; no one decides each cycle whether to honor it. The more the protocol is used, the more flows to the infrastructure Ethereum itself depends on.`,
        },
        {
          kind: 'paragraph',
          text: 'The reasoning is simple. Cosmic Signature exists because Ethereum\u2019s base layer keeps working, and a protocol that lives on public infrastructure should fund it the way it does everything else: mechanically, on a schedule, in public. The vault also accepts voluntary ETH contributions directly, outside any cycle.',
        },
        {
          // lexicon-allow-start: tax-status disclaimer must name the concepts it denies.
          kind: 'note',
          text: 'This is a forwarding of ETH to a public-goods address, currently Protocol Guild. It is not a charitable contribution or a donation in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment in any jurisdiction.',
          // lexicon-allow-end
        },
      ],
    },
    {
      id: 'security',
      number: '11',
      heading: 'Security, Randomness, and Verifiability',
      blocks: [],
      subsections: [
        {
          id: 'independent-review',
          number: '11.1',
          heading: 'Independent Review',
          blocks: [
            {
              kind: 'paragraph',
              text: 'In late 2025, Hacken carried out an independent security review of the Cosmic Signature contracts, covering the core protocol, the CST token, both NFT integrations, the anchoring wallets, and the supporting wallet and system-management contracts. The final report, published in January 2026, lists 23 findings: none critical, none high severity, 3 medium, 8 low, and 12 informational, most of them design trade-offs reviewed and accepted with written rationale.',
            },
            {
              kind: 'paragraph',
              text: 'Alongside the manual review, Hacken fuzz-tested 14 system invariants, properties such as the protocol\u2019s ETH balance always equaling deposits minus distributions. All 14 held across 10,000 runs. The full report is public and linked in the references.',
            },
            {
              kind: 'paragraph',
              text: 'Beyond external review, the repository carries Certora formal verification specifications, Solidity SMTChecker configuration, Slither static analysis, and a test suite that targets complete coverage of the Solidity sources.',
            },
          ],
        },
        {
          id: 'defensive-design',
          number: '11.2',
          heading: 'Defensive Design',
          blocks: [
            {
              kind: 'list',
              items: [
                'Reentrancy guards protect every external entry point of the core contract.',
                'Pull over push: secondary ETH allocations and attached assets sit in escrow rather than being sent during finalization, so no recipient contract can block a cycle from closing.',
                'Failure-tolerant forwarding: if the Public Goods transfer cannot complete, finalization proceeds anyway and the event is recorded for later handling.',
                'Inter-cycle locks: core parameter changes and contract upgrades are impossible while a cycle is running (Section 13).',
              ],
            },
          ],
        },
        {
          id: 'randomness',
          number: '11.3',
          heading: 'Randomness',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The protocol needs randomness twice: for Selection draws at finalization and for each new NFT\u2019s seed. It builds a seed on-chain by folding together the previous block hash, the current base fee, and Arbitrum-specific entropy from the ArbSys and ArbGasInfo precompiles: the previous Arbitrum block hash, the gas backlog, and L1 pricing counters. Individual values are then drawn from that seed with keccak256. The precompile calls are failure-tolerant; if one is unavailable, the construction falls back to the remaining sources.',
            },
            {
              kind: 'paragraph',
              text: 'This is deliberate minimalism: no oracle, no external committee, no callback that could strand a cycle. The trade-off is stated plainly. A sequencer could in principle influence block-level inputs, and the design bounds what that influence could reach. Selection draws and art seeds are the only consumers of randomness; the countdown, the Gesture Cost sequence, and every percentage in Section 5 are deterministic. The construction is consumed once per finalization, and finalization is a public transaction anyone can submit.',
            },
          ],
        },
        {
          id: 'open-verification',
          number: '11.4',
          heading: 'Open Verification',
          blocks: [
            {
              kind: 'paragraph',
              text: 'All contracts are source-verified with exact-match status on Sourcify for Arbitrum One (chain 42161), at the addresses fixed in Appendix A. The art pipeline\u2019s determinism is asserted in continuous integration with SHA-256 hashes of rendered frames. Project-owned code is CC0: anyone may fork the contracts, the renderer, or the site, and anyone can check any Signature by regenerating it from its seed.',
            },
          ],
        },
      ],
    },
    {
      id: 'upgrade-history',
      number: '12',
      heading: 'Deployment History and the Road Ahead',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature is designed to be finished. Upgradability exists so the mechanics can be corrected against observed behavior during the protocol\u2019s early life, and it ends when the design does. This section records what has shipped and what remains.',
        },
      ],
      subsections: [
        {
          id: 'v1',
          number: '12.1',
          heading: 'V1: Launch',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V1 launched the protocol on Arbitrum One behind a UUPS upgradeable proxy: cycles, gestures, the allocation tracks, anchoring, the Council, and the art pipeline, essentially as described in this paper. Upgrades require the owner and are only possible between cycles. There is deliberately no mechanism for changing the contract mid-cycle, whatever the circumstances.',
            },
          ],
        },
        {
          id: 'v2',
          number: '12.2',
          heading: 'The V2 Upgrade, Live Today',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V2 is the implementation deployed today. It made five changes, each a response to observed or anticipated behavior.',
            },
            {
              kind: 'list',
              items: [
                'Dynamic Participation CST. The flat 100 CST per gesture became the square-root formula of Section 7.1. Flat imprinting turned rapid gesture sequences into free CST; the new rule imprints by patience, not by frequency.',
                'Minimum-imprint guards. Every gesture method gained a parameter for the smallest Participation CST amount the participant will accept, protecting them from timing shifts between signing and execution.',
                'A living CST Calibration Window. The window\u2019s duration became a stored value that responds to the gesture mix (Section 4.3), so the ETH and CST paths keep each other in balance.',
                `A longer exclusivity window. The Final Gesture participant\u2019s exclusive finalization window grew from 24 to ${protocolFacts.finalGestureExclusivityHours} hours.`,
                'Timing and arithmetic hardening. Countdown extensions now always apply to the stored finalization time, closing a loophole in which near-free CST gestures made after expiry could repeatedly push the deadline outward. The arithmetic that schedules the next cycle was also hardened so that no parameter configuration, however extreme, can prevent a cycle from finalizing.',
              ],
            },
          ],
        },
        {
          id: 'v3',
          number: '12.3',
          heading: 'The Planned V3 Upgrade',
          blocks: [
            {
              kind: 'paragraph',
              text: 'V3, currently in development in the public repository, changes exactly one thing: the cost of acting late. During the final 20 minutes before the Cycle Finalization Time, every Gesture Cost, whether ETH, ETH with a Random Walk NFT, or CST, is multiplied by a premium that ramps polynomially from 1x to 10x, reaching 10x at the deadline and staying there for any gesture made during overtime.',
            },
            {
              kind: 'formula',
              formula: 'm(t) = 1 + 9 \u00b7 (t / T)^8, where T = 20 minutes',
              caption:
                'Late-cycle cost premium, with t the time elapsed within the final 20-minute window.',
            },
            {
              kind: 'paragraph',
              text: 'The exponent matters. Because the ramp is eighth-order, the premium is nearly invisible for most of the window and steep only at the very end: about 1.04x ten minutes before the deadline, about 1.9x at five minutes, about 7x at one minute, and 10x at zero.',
            },
            {
              kind: 'paragraph',
              text: 'The intent is to change the endgame. Under V2, waiting until the last seconds to gesture is nearly free, so a cycle can end in a flurry of low-signal timing moves. Under V3, a last-moment gesture is an expensive statement, sustained participation through the cycle is comparatively cheap, and the endurance tracks of Section 5.2 become much harder to ambush. Exact parameters may still be tuned before deployment; the mechanism is as described.',
            },
          ],
        },
      ],
    },
    {
      id: 'decentralization',
      number: '13',
      heading: 'The Path to Full Decentralization',
      blocks: [
        {
          kind: 'paragraph',
          text: 'The protocol currently has an owner: the address that deployed it. The role is real, and this paper does not minimize it. It is also narrow by construction and temporary by commitment.',
        },
        {
          kind: 'paragraph',
          text: 'While a cycle is running, the core parameters are locked. The owner cannot change percentages, increments, or costs mid-cycle, and cannot upgrade the contract; owner actions live in the gap between cycles. Three narrower controls remain available at any time: postponing an upcoming cycle\u2019s activation, though only until its first gesture arrives; adjusting the delay before the next cycle; and managing peripheral contracts, meaning the Public Goods Vault\u2019s beneficiary, NFT metadata URIs, and the escrow retrieval timeout. No owner power reaches escrowed allocations, imprinted NFTs, recorded seeds, or anyone\u2019s CST balance, and no team wallet receives ETH from gestures.',
        },
        {
          kind: 'paragraph',
          text: 'These powers exist because the mechanism is novel. V2 exists because live behavior taught lessons no simulation would have caught, and V3 exists for the same reason. A bounded, public adjustment period is how the design gets finished. The strongest power in the list is the upgrade itself, and even it is public: a new implementation is visible and verifiable on-chain before the next cycle begins.',
        },
        {
          kind: 'paragraph',
          text: 'It ends as follows. Once the remaining upgrades are complete, beginning with V3, and the mechanics and token design are judged final, privileged control will be removed from the deploying address entirely. The owner role will leave the deployer permanently, either by transfer to the Cosmic Council or by outright renouncement, with the exact mechanism announced in advance. From that point, no private party can upgrade the protocol or change its parameters, and the deploying address holds nothing that any other address does not. What remains is the protocol as deployed, the Council as its coordination layer, and the art.',
        },
        {
          kind: 'paragraph',
          text: 'Every step of this process is publicly visible on-chain, including the last one.',
        },
      ],
    },
    {
      id: 'clarifications',
      number: '14',
      heading: 'Clarifications and Risk Factors',
      blocks: [],
      subsections: [
        {
          id: 'what-it-is-not',
          number: '14.1',
          heading: 'What Cosmic Signature Is Not',
          blocks: [
            // lexicon-allow-start: denial copy must name the concepts it denies, matching FAQ practice.
            {
              kind: 'paragraph',
              text: 'Cosmic Signature is not a lottery, a casino, or a gambling product. There is no house, no dealer, and no bet. Participants exchange value for participation itself: every gesture is an expressive act that shapes the artwork, extends the cycle, and is recorded permanently on-chain. The protocol retains no operator\u2019s margin of any kind; every allocation track in Section 5 flows to participants, to anchored NFTs, to the compounding reserve, or to public goods.',
            },
            {
              kind: 'paragraph',
              text: 'Cosmic Signature is not an investment product, and nothing in this paper is investment advice or an offer of securities. CST and Cosmic Signature NFTs are participation and art objects. The protocol makes no promises about their price, liquidity, or future value, and no one should acquire them with an expectation of profit from the efforts of others.',
            },
            // lexicon-allow-end
          ],
        },
        {
          id: 'risk-factors',
          number: '14.2',
          heading: 'Risk Factors',
          blocks: [
            {
              kind: 'list',
              items: [
                'Smart contract risk. The contracts are reviewed, formally analyzed, and source-verified, and none of that is a guarantee. Unknown defects can exist in any software that holds value.',
                'Randomness limits. Selection draws use block-derived entropy (Section 11.3). A sequencer could in principle influence it; the design bounds the consequences but cannot eliminate them.',
                `Timing responsibilities. The ${protocolFacts.finalGestureExclusivityHours}-hour finalization window and the ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week escrow timeout are real deadlines. Allocations left unretrieved past them become available to others, by design.`,
                'Parameter changes. Until the decentralization step completes, parameters can change between cycles as described in Section 13. Every change is public before the next cycle begins.',
                'Asset volatility. The values of ETH, CST, and NFTs move. Participation costs real money; treat gestures as expenditure on participation and art, not as a path to financial gain.',
                'Regulatory uncertainty. The legal treatment of digital assets varies by jurisdiction and continues to evolve.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'conclusion',
      number: '15',
      heading: 'Conclusion',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Cosmic Signature is an attempt to build a generative art protocol that needs no one\u2019s permission and, eventually, no one\u2019s stewardship. The mechanics are small enough to specify completely: descending-cost windows, a countdown that gestures extend, fixed allocation percentages, a compounding reserve, and art that is a pure function of physics and a seed. The upgrades that remain are few and public. When they are done, the owner role goes away, and what is left is what this paper describes: a clock, a reserve, a token, a council, and an unbroken series of Signatures, each one the record of the hands that shaped it.',
        },
      ],
    },
    {
      id: 'appendix-a',
      number: 'A',
      heading: 'Appendix A: Verified Contract Addresses',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Contract', 'Address (Arbitrum One)'],
            rows: [
              ['Protocol contract (proxy)', protocolFacts.contractAddresses.proxy],
              ['Protocol implementation (V2)', protocolFacts.contractAddresses.implementation],
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
              'All contracts are exact-match verified on Sourcify for chain 42161. The proxy address is the protocol\u2019s permanent address; implementations change only through the public upgrade process described in Sections 12 and 13.',
          },
        },
      ],
    },
    {
      id: 'appendix-b',
      number: 'B',
      heading: 'Appendix B: Parameters at a Glance',
      blocks: [
        {
          kind: 'table',
          table: {
            columns: ['Parameter', 'Value'],
            rows: [
              ['Opening cost, first cycle', `${protocolFacts.initialGestureCostEth} ETH (fixed)`],
              [
                'ETH Calibration Window ceiling',
                `${protocolFacts.ethCalibrationCeilingMultiplier}x the previous cycle\u2019s opening cost paid`,
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
                `max(${protocolFacts.cstCalibrationCeilingMultiplier}x last CST cost paid, ${protocolFacts.cstCalibrationCeilingMinCst} CST)`,
              ],
              ['CST Calibration Window floor', `${protocolFacts.cstCalibrationFloorCst} CST`],
              [
                'CST Calibration Window duration',
                `${protocolFacts.initialCstCalibrationWindowHours}-hour initial reference; about \u2212${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% per ETH gesture, +${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% per CST gesture`,
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
              [
                'Recognition CST per NFT distribution',
                `${cst(protocolFacts.specialAllocationCst)} CST`,
              ],
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
                `${protocolFacts.defaultNextCycleDelayMinutes} minutes by default, owner-adjustable`,
              ],
            ],
            footnote:
              'Launch values are shown where a parameter evolves or is adjustable; the contracts report live values.',
          },
        },
      ],
    },
  ],
  references: {
    id: 'references',
    heading: 'References',
    items: [
      {
        label: 'Cosmic Signature contracts repository (source, tests, verification tooling)',
        href: 'https://github.com/PredictionExplorer/Cosmic-Signature',
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
        label: 'Arbitrum One',
        href: 'https://arbitrum.io',
      },
    ],
  },
  citation: `Bobrovytsky, T. (2026). Cosmic Signature: A Procedural On-Chain Art Protocol. Version ${WHITE_PAPER_VERSION}.`,
  licenseNote:
    'This paper, like all project-owned Cosmic Signature materials, is dedicated to the public domain under CC0 1.0.',
} as const satisfies WhitePaperContent;
