import { ethDistributionFacts, nftAllocationFacts, protocolFacts } from '@/content/protocol-facts';

import { formatCount } from '@/utils/format/numbers';

import type { FAQText } from './structure';

/**
 * Protocol amounts in this locale's number style (grouping from
 * `i18n/localeConfig.ts` through the format layer, never an Intl tag typed
 * into a copy module).
 */
const cst = formatCount(protocolFacts.specialAllocationCst, 'en');
const outreachCst = formatCount(protocolFacts.outreachReserveCst, 'en');

/** English FAQ copy, keyed by the skeleton in structure.ts. */
export const faqTextEn = {
  'getting-started': {
    title: 'Getting started',
    description: 'The basics of Cosmic Signature and how to participate',
    items: {
      'what-is-cosmic-signature': {
        question: 'What is Cosmic Signature?',
        answer:
          'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures during a Performance Cycle; every gesture shapes the cycle’s final Signature. When the cycle finalizes, the protocol distributes its reserves across a fixed set of allocation tracks — including Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
      },
      'how-does-the-bidding-game-work': {
        question: 'How does a Performance Cycle work?',
        answer: `Each cycle opens with an ETH Calibration Window for the first gesture. That first gesture starts the Cycle Finalization Time, currently about 24 hours by default. Subsequent gestures with ETH or CST add the current time increment to the stored finalization time, with the increment starting at one hour and growing ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% per finalized cycle. When the Cycle Finalization Time expires, the participant who made the Final Gesture has an exclusive ${protocolFacts.finalGestureExclusivityHours}-hour window to finalize the cycle and retrieve the Signature Allocation; gestures remain possible until the cycle is actually finalized.`,
      },
      'what-type-of-gestures-are-available': {
        question: 'What types of gestures are available?',
        answer:
          'Gestures use ETH or CST. The first gesture of every cycle must be an ETH gesture. An unused Random Walk NFT owned by the sender can reduce one ETH Gesture Cost by 50%; it remains in its owner’s wallet. Cosmic Signature NFTs are allocation and anchoring assets, not gesture payment. CST base cost declines at an on-chain rate; both currencies can carry the late-gesture premium.',
      },
      'can-i-participate-without-nfts': {
        question: 'Can I participate if I don’t own any NFTs?',
        answer:
          'Yes. Anyone can participate in a Cosmic Signature Performance Cycle by making a gesture. An unused Random Walk NFT can be attached to an ETH gesture for a 50% Gesture Cost reduction.',
      },
      'how-can-i-get-involved': {
        question: 'How can I get involved?',
        answer:
          'You can participate by making gestures during a Performance Cycle, or by contributing an NFT from your project to be attached to a participant’s gesture. Join the Discord to meet other participants.',
      },
      'how-long-does-each-round-last': {
        question: 'How long does each Performance Cycle last?',
        answer: `Each cycle begins when the first ETH gesture is made, which starts the Cycle Finalization Time at roughly 24 times the current time increment (about one day at launch). Every later gesture adds the current time increment, which started at exactly one hour and grows ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with each finalized cycle. A cycle can therefore last much longer than a day if gestures keep arriving before finalization.`,
      },
      'can-i-place-multiple-gestures': {
        question: 'Can I make multiple gestures in one cycle?',
        answer:
          'Yes. Each gesture records a weighted Stellar Selection entry. In V3, a later gesture credits Participation CST to the previous participant for the elapsed interval. The first gesture credits none, and finalization does not settle additional Participation CST for the final participant. Repeated gestures by the same address can credit that address.',
      },
    },
  },
  'allocations-and-rewards': {
    title: 'Allocations & distributions',
    description: 'What participants may receive when the cycle finalizes',
    items: {
      'what-is-the-main-allocation': {
        question: 'What is the Signature Allocation?',
        answer: `The Signature Allocation goes to whoever finalizes the cycle. For the first ${protocolFacts.finalGestureExclusivityHours} hours after the Cycle Finalization Time, only the participant who made the Final Gesture can finalize; after that, anyone can. It includes ${nftAllocationFacts.mainPrizeNftPhrase.en}, a Recognition CST imprint of ${cst} CST, and ${ethDistributionFacts.mainEthPercentage}% of the Cycle Reserve in ETH, plus any tokens or NFTs attached to participant gestures during the cycle.`,
      },
      'what-rewards-per-bid': {
        question: 'What do I receive for each gesture?',
        answer:
          'Every gesture records a weighted Stellar Selection entry and updates the cycle’s timing records. V3 Participation CST grows linearly with the time since the previous gesture, but it is credited to that previous participant when the next gesture executes. The opening gesture credits none. Finalization does not settle additional Participation CST for the final participant.',
      },
      'how-does-the-stellarSelection-work': {
        question: 'How does Stellar Selection work?',
        answer: `At finalization, ${protocolFacts.ethStellarSelectionRecipients} participant selections share ${ethDistributionFacts.stellarSelectionEthPercentage}% of the reserve in ETH, and ${protocolFacts.nftStellarSelectionRecipients} participant selections each receive ${cst} CST and one NFT. Both tracks use each gesture’s undiscounted, premium-free ETH base cost as its weight. CST gestures use the concurrent ETH base cost. Selections are made with replacement, so repeats are possible. A separate track selects ${protocolFacts.anchoredRwlkNftSelectionRecipients} active Random Walk NFT entries, each carrying ${cst} CST and one NFT, when any are anchored.`,
      },
      'how-random-selection-works': {
        question: 'How are random selections made?',
        answer:
          'Both participant ETH and NFT Stellar Selections use the accumulated undiscounted, premium-free ETH base cost of the participant’s gestures as weight. CST gestures use the concurrent ETH base cost. Random Walk NFT selection instead uses active anchored NFT entries. All selections allow repeats. Entropy is derived from block context and fallback inputs at finalization; it is not an externally verified randomness service and can be influenced by transaction timing and block production.',
      },
      'how-do-i-claim-my-allocation': {
        question: 'How do I retrieve my allocation if I’m a recipient?',
        answer: `The Final Gesture participant has ${protocolFacts.finalGestureExclusivityHours} hours after the deadline to finalize exclusively.\n\nAfter that, whoever finalizes receives the entire Signature Allocation: its ETH share, ${cst} CST in total, ${nftAllocationFacts.mainPrizeNftPhrase.en}, and attached-asset beneficiary rights.\n\nSecondary ETH and attached assets sit in the Allocations Wallet with a separate retrieval deadline, currently ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks. After that deadline, anyone may retrieve an unretrieved allocation for themselves. CST and NFTs already imprinted directly to a recipient are not subject to that retrieval timeout.`,
      },
      'how-does-anchoring-work': {
        question: 'How does Anchoring work?',
        answer: `Cosmic Signature NFTs can be anchored to the protocol to receive ETH Anchor Distributions: each finalized cycle allocates ${ethDistributionFacts.anchorDistributionPercentage}% of the Cycle Reserve, split equally per anchored Cosmic Signature NFT, and the accumulated ETH is paid out when you release the anchor.\n\nRandom Walk NFTs can also be anchored, but only for Anchored-NFT Stellar Selection eligibility — selected anchor-holders receive CST and Cosmic Signature NFTs, not ETH.\n\nTwo rules to know: every NFT can be anchored only once, ever (after you release an anchor, that NFT can never be anchored again), and if no Cosmic Signature NFTs are anchored when a cycle finalizes, that cycle’s ${ethDistributionFacts.anchorDistributionPercentage}% simply stays in the Cycle Reserve. CST (ERC-20) cannot be anchored. Visit the My Anchors page (from your account menu) to manage anchors.`,
      },
      'what-are-marketing-rewards': {
        question: 'What is the Outreach Reserve?',
        answer: `You can receive CST tokens (ERC-20) for helping promote the protocol. The Outreach Reserve imprints ${outreachCst} CST per cycle and distributes it to ecosystem contributors. Contact the Outreach Custodian via Discord for guidance.`,
      },
      'how-many-nfts-minted': {
        question: 'How many Cosmic Signature NFTs are imprinted each cycle?',
        answer: `With every track present, a cycle imprints ${nftAllocationFacts.typicalNftsPerCycle} Cosmic Signature NFTs: ${nftAllocationFacts.mainPrizeNftsWord.en} for the Signature Allocation, one each for the Final CST Gesture, Endurance Champion and Chrono-Warrior, ${protocolFacts.nftStellarSelectionRecipients} for participant selection and ${protocolFacts.anchoredRwlkNftSelectionRecipients} for anchored Random Walk NFT selection. The main allocation receives ${cst} CST once for all its NFTs; each other NFT allocation receives ${cst} CST. A cycle without CST gestures or active Random Walk anchors has the corresponding track skipped for that cycle.`,
      },
      'what-happens-to-remaining-eth': {
        question: 'What happens to the remaining ETH in the Cycle Reserve?',
        answer:
          'About half of the reserve carries into the next cycle. Integer rounding, a missing anchoring track, or a failed Public Goods transfer can retain more. Carryover does not guarantee that a later cycle begins with a larger balance.',
      },
      'what-happens-to-attached-assets': {
        question: 'What happens to tokens or NFTs attached to gestures?',
        answer: `ERC-20 tokens or ERC-721 NFTs attached to gestures are held in escrow by the Allocations Wallet contract; they do not join the ETH Cycle Reserve. After finalization, the cycle beneficiary (normally the Final Gesture participant) has exclusive priority to retrieve them. If attached assets remain unretrieved past the secondary retrieval timeout, currently ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks by default, the contracts permit anyone to retrieve them for themselves.`,
      },
      'who-receives-10-percent': {
        question: 'Who receives the public-goods allocation from the Cycle Reserve?',
        answer: `Finalization attempts to transfer ${ethDistributionFacts.publicGoodsPercentage}% of the reserve to the Public Goods Vault. Anyone can then send the vault’s balance to its configured beneficiary in a separate transaction. The current beneficiary is Protocol Guild; the vault owner can change it. A failed transfer from the protocol leaves that share in the reserve without necessarily reverting finalization. Ownership has not automatically moved to the Cosmic Council.`,
      },
    },
  },
  'game-mechanics': {
    title: 'Cycle mechanics',
    description: 'Deep dive into gesture timing and protocol rules',
    items: {
      'how-does-price-increase': {
        question: 'How does Gesture Cost change across a cycle?',
        answer:
          'ETH opening cost descends through its Calibration Window. Each ETH gesture then increases the premium-free ETH base cost by the configured step plus one wei. CST base cost declines at an adaptive on-chain rate and resets after CST gestures. Both final prices carry a late premium near the deadline; this premium does not increase later base costs or selection weights.',
      },
      'what-is-dutch-auction': {
        question: 'What is the Calibration Window?',
        answer: `A Calibration Window describes a declining base cost. The opening ETH cost falls to about 1/${protocolFacts.ethCalibrationFloorDivisor} of its ceiling: exactly floor(ceiling / ${protocolFacts.ethCalibrationFloorDivisor}) + 1 wei. CST base cost is max(ceiling − elapsed seconds × decline rate, 0). V3 changes that decline rate, not the old stored duration. A late premium can apply to either currency; a zero CST base remains zero, so a free CST gesture is possible; network gas still applies.`,
      },
      'how-is-participation-cst-calculated': {
        question: 'How is Participation CST calculated?',
        answer: `V3 computes floor(elapsed seconds × multiplier / increment in microseconds), in CST smallest units. Divide by 10^18 to express CST.\n\nAt the original one-hour increment the rate is about ${protocolFacts.v3.dynamicCstRewardPerMinuteAtLaunch} CST per minute; later increments change that rate. The next gesture credits the previous participant, the first gesture credits none, and finalization does not pay a final dynamic amount. Elapsed time alone is not a retrievable CST balance.`,
      },
      'why-minimum-cst-reward-protection': {
        question: 'What is Minimum CST Reward Protection?',
        answer:
          'The minimum Participation CST argument constrains the amount credited to the previous participant. It does not promise CST to the sender unless the sender is also that participant. The app can apply this protection when your address holds the latest position; the opening ETH gesture skips the check. Cost caps are separate protections. Review the preview and recipient before confirming.',
      },
      'how-cst-calibration-window-changes': {
        question: 'How does each gesture change the CST Calibration Window?',
        answer: `V3 adapts the decline rate. At divisor ${protocolFacts.cstDeclineRateChangeDivisor}, an ETH gesture proposes rate + floor(rate / 100); it is accepted only if the resulting rate times ${protocolFacts.cstCalibrationRestartMinimumSeconds} seconds does not exceed the current ceiling. A CST gesture uses rate − floor(rate / 101), then resets the ceiling to the largest of twice its premium-free CST base cost, ${protocolFacts.cstCalibrationCeilingMinCst} CST, and the new rate times ${protocolFacts.cstCalibrationRestartMinimumSeconds} seconds. An ETH rate change applies to the full elapsed interval. The safeguard is not a waiting period between gestures.`,
      },
      'what-is-open-finalization-window': {
        question: 'What is the Open-Finalization Window?',
        answer: `Only the Final Gesture participant can finalize during the first ${protocolFacts.finalGestureExclusivityHours} hours after the deadline. Thereafter any caller can finalize. The finalizer receives the full Signature Allocation, including ${cst} CST in total and ${nftAllocationFacts.mainPrizeNftPhrase.en}. Gestures remain possible until finalization; they extend the stored deadline, which can still remain in the past.`,
      },
      'what-is-endurance-champion': {
        question: 'What is an Endurance Champion?',
        answer:
          'The participant who remained the most recent gesture maker for the longest consecutive interval within a cycle (the longest gap before another gesture arrived). When the cycle finalizes, the Endurance Champion receives a Recognition CST imprint of 1,000 CST and one Cosmic Signature NFT.',
      },
      'what-is-final-cst-gesture': {
        question: 'What is the Final CST Gesture?',
        answer:
          'The Final CST Gesture is the last gesture made with CST tokens during a cycle. When the cycle finalizes, the participant who made it receives a Recognition CST imprint of 1,000 CST and one Cosmic Signature NFT.',
      },
      'what-is-chrono-warrior': {
        question: 'What is a Chrono-Warrior?',
        answer: `The participant who held the Endurance Champion position for the longest consecutive interval. Analogous to the Endurance Champion being the longest-reigning recent gesture maker, the Chrono-Warrior is the longest-reigning Endurance Champion. When the cycle finalizes, the Chrono-Warrior receives ${ethDistributionFacts.chronoWarriorEthPercentage}% of the Cycle Reserve in ETH, ${cst} CST, and one Cosmic Signature NFT.`,
      },
      'does-time-per-bid-stay-same': {
        question: 'Does the time added per gesture always stay the same?',
        answer: `No. The time added after each gesture started at exactly one hour at launch and grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% every time a cycle finalizes. Because a larger increment also makes each cycle last longer, the growth naturally slows down in calendar time.`,
      },
      'why-time-per-bid-increases': {
        question: 'Why does the time added per gesture increase over time?',
        answer:
          'It sets the long-term pace of imprinting. As cycles lengthen, fewer new Cosmic Signature NFTs are imprinted in the same span of time.',
      },
      'how-time-increase-affects-game': {
        question: 'How does the increase in time per gesture affect the protocol?',
        answer:
          'As the time added per gesture increases, cycles run longer on average. The change is gradual, preserving a smooth participation experience while limiting total Cosmic Signature NFT supply over long time horizons.',
      },
      'what-if-two-gestures-same-time': {
        question: 'What happens if two gestures are submitted at the same time?',
        answer:
          'The sequencer orders transactions on Arbitrum. Each gesture is checked against the protocol state when it executes. A later gesture can still succeed, but an earlier one may change its cost or Participation CST amount. If those changes exceed the protections set for your gesture, the transaction will revert.',
      },
      'is-there-game-theory': {
        question: 'Is there a strategic element in Cosmic Signature?',
        answer:
          'Yes. Participant timing, gesture frequency, and method (ETH vs CST vs Random Walk attachment) all shape how allocations distribute. The social dynamics and protocol design are designed so that multiple strategies can succeed across different allocation tracks.',
      },
    },
  },
  'tokens-and-nfts': {
    title: 'Tokens & Cosmic Signatures',
    description: 'CST, the on-chain art, and digital assets',
    items: {
      'what-are-cst-and-dao': {
        question: 'What are CST tokens and the Cosmic Council?',
        answer:
          'CST is the protocol token, used for gestures and delegated Coordination Weight. The Council uses historical delegated balances for proposals and expressions. It controls only permissions actually assigned to it; the core protocol is currently managed by the protocol owner, and the Public Goods beneficiary by the vault owner. No automatic ownership transfer is built into V3.',
      },
      'what-can-i-do-with-cst': {
        question: 'What can I do with CST tokens?',
        answer:
          'CST tokens can be used as an alternative to ETH for gestures through the CST Calibration Window; CST spent on a gesture is burned (permanently removed from supply) rather than pooled. Gestures can also imprint Participation CST, but the amount is dynamic and depends on how long it has been since the previous gesture. CST also expresses Coordination Weight on the Cosmic Council once delegated (you can delegate to yourself).',
      },
      'what-makes-nfts-unique': {
        question: 'What makes Cosmic Signature NFTs unique?',
        answer:
          'Each Cosmic Signature NFT records a seed on-chain. The open-source Rust renderer uses it to simulate and render three celestial bodies. Images and videos are generated and hosted off-chain; reproducing an output requires the matching renderer revision, configuration and toolchain.',
      },
      'how-are-nft-images-created': {
        question: 'How are the NFT images created?',
        answer:
          'Each Cosmic Signature NFT visualizes the three-body problem in Newtonian gravity. The pipeline simulates three celestial bodies under gravity and spectrally renders their trajectories across 64 wavelength bins spanning 380–700 nanometers, creating a unique chaotic pattern for every NFT.',
      },
      'significance-of-random-seed': {
        question: 'Why is each NFT generated from an on-chain seed?',
        answer:
          'The on-chain seed preserves a public input for regeneration. Reproduction also requires the matching renderer revision and configuration and a compatible toolchain. The current reference-image checks are manual; unchanged pixels across arbitrary versions or machines are not guaranteed.',
      },
      'is-nft-supply-limited': {
        question: 'Is the number of Cosmic Signature NFTs limited?',
        answer: `The contract has no hard supply cap. The time added per gesture grows ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle, which tends to lengthen cycles and slow the pace of NFT imprinting. The actual pace also depends on participation.`,
      },
      'impact-of-limiting-nfts': {
        question: 'How does cycle length affect how many new NFTs are imprinted?',
        answer:
          'A growing time increment tends to lengthen cycles, so fewer NFTs are imprinted in the same span of time. Each Cosmic Signature NFT records a part of the protocol’s history, and the total has no fixed cap.',
      },
      'connection-with-randomwalknft': {
        question: 'What is the connection with Random Walk NFT?',
        answer:
          'Random Walk NFT holders can attach an unused token to one ETH gesture for a 50% ETH Gesture Cost reduction. Random Walk NFT anchor-holders also receive entries into the Anchored-NFT Stellar Selection each cycle.',
      },
      'how-to-trade-nfts-tokens': {
        question: 'How can I trade or sell my Cosmic Signature NFTs or CST?',
        answer:
          'Cosmic Signature NFTs trade on Axiom Zero (axiomzero.market), the zero-fee NFT marketplace built for Cosmic Signature and Random Walk NFTs, and CST trades on Uniswap on Arbitrum. Both are standard ERC-721 and ERC-20 assets, so any other Arbitrum marketplace or exchange that supports those standards works too, including OpenSea.',
      },
      'where-to-buy-cosmic-signature-nfts': {
        question: 'Where can I buy or sell Cosmic Signature NFTs?',
        answer:
          'The primary venue is Axiom Zero (https://www.axiomzero.market/cosmic-signature), a zero-fee NFT marketplace on Arbitrum built for fair-launch generative art. Listings and sales settle directly on-chain, sellers receive the full sale amount, and every token page shows the NFT’s anchor status read live from the anchoring contracts — a never-anchored token keeps its one-time anchoring option open for its next owner.',
      },
      'cosmic-signature-prediction-market': {
        question: 'Is there a prediction market for Cosmic Signature?',
        answer:
          'Yes. Chaos Zero (https://chaoszero.com) is a prediction market built specifically for Cosmic Signature. Each Performance Cycle it opens one question: will this cycle finalize with more gestures than the previous one? Positions are denominated in CST and fully collateralized by construction, and markets resolve from the public on-chain gesture count with no owner or admin keys.',
      },
      'participate-dao-without-bidding': {
        question: 'Can I participate in the Cosmic Council without making a gesture?',
        answer:
          'Yes. You can acquire CST on a supported exchange and use it to express Coordination Weight on the Cosmic Council after delegating it (to yourself or another address). Making gestures remains the primary way to imprint new CST.',
      },
      'donate-nfts-to-game': {
        question: 'How can other NFT projects contribute their tokens to a cycle?',
        answer:
          'Projects can attach their tokens (ERC-721 or ERC-20) to a gesture using the “Advanced” pane. Provide the contract address and token ID or amount and submit the gesture. Attached tokens are held in the Allocations Wallet escrow and flow to the Signature Allocation recipient after finalization.',
      },
    },
  },
  'arbitrum-and-technical': {
    title: 'Arbitrum & technical',
    description: 'Network setup, wallets, and technical details',
    items: {
      'what-is-arbitrum': {
        question: 'What is Arbitrum and why is Cosmic Signature deployed on it?',
        answer:
          'Arbitrum is an Ethereum Layer 2 rollup designed to process transactions at lower cost. Cosmic Signature uses it for frequent on-chain interactions. Fees vary with network conditions, and Arbitrum has its own execution and settlement rules.',
      },
      'why-arbitrum-not-ethereum': {
        question: 'Why Arbitrum and not Ethereum mainnet?',
        answer:
          'Most on-chain activity is migrating to Layer 2s. Arbitrum offers dramatically lower gas costs while maintaining the same security model as Ethereum Layer 1 — making it the right home for a gesture-heavy protocol like Cosmic Signature.',
      },
      'arbitrum-security': {
        question: 'What makes Arbitrum as secure as Ethereum Layer 1?',
        answer:
          'Arbitrum is a rollup, not a sidechain. Every batch of transactions is posted back to Ethereum mainnet. This anchors Arbitrum’s security in Ethereum itself: the data and dispute resolution live on Layer 1.',
      },
      'how-to-get-eth-on-arbitrum': {
        question: 'How do I get ETH on Arbitrum?',
        answer:
          'Bridge ETH from Ethereum mainnet using the official Arbitrum bridge or other supported bridges. Your ETH is locked on Ethereum and an equivalent amount becomes available on Arbitrum. Bridging requires an Ethereum Layer 1 gas payment.',
      },
      'existing-wallet-on-arbitrum': {
        question: 'Can I use my existing Ethereum wallet on Arbitrum?',
        answer:
          'Yes. The same private keys sign transactions on both networks. You just need to add the Arbitrum network to your wallet’s network list.',
      },
      'view-tokens-on-arbitrum': {
        question: 'How do I view my CST tokens and Cosmic Signature NFTs on Arbitrum?',
        answer:
          'View them directly on the Cosmic Signature website, or add the contract addresses to your wallet manually. Contract addresses are published on the Contracts page and in the community Discord.',
      },
      'trade-on-arbitrum': {
        question: 'Can I trade my Cosmic Signature NFTs and CST on Arbitrum?',
        answer:
          'Yes. Cosmic Signature NFTs trade on Axiom Zero, the zero-fee marketplace for the collection, and CST trades on Uniswap. Both are standard ERC-721 and ERC-20 assets on Arbitrum, so any marketplace or exchange that supports those standards works. Always confirm the contract address before trading.',
      },
      'verify-bid-success': {
        question: 'How can I confirm that my gesture was submitted successfully?',
        answer:
          'Successful gestures are confirmed on Arbitrum and visible on the Arbitrum block explorer (Arbiscan). Your transaction hash can be pasted into the explorer to verify the gesture.',
      },
      'game-security': {
        question: 'How is the protocol’s security ensured?',
        answer:
          'Contract addresses, source resources, verification status and audit scope are published for inspection. Hacken reviewed a historical revision; that report does not independently cover every V2 or V3 change. The deployed V3 runtime matches the reviewed production artifact, but its Sourcify page currently reports it as unverified. No audit or source match eliminates all risk.',
      },
      'fees-involved': {
        question: 'Are there any fees involved?',
        answer:
          'Beyond the Gesture Cost itself, you pay Arbitrum network gas fees for each transaction. Gas fees fluctuate with network conditions and are not controlled by Cosmic Signature.',
      },
      'is-cosmic-signature-related-to-biology': {
        question: 'Is Cosmic Signature related to the COSMIC biology database?',
        answer:
          'No. Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC mutational signatures in biology. It is an on-chain art protocol and app focused on deterministic three-body NFT art.',
      },
    },
  },
  'trust-and-governance': {
    title: 'Trust & coordination',
    description: 'Transparency, team control, and the open-source vision',
    items: {
      'team-controls': {
        question: 'What controls does the team have over the protocol?',
        answer:
          'The owner can change core configuration and upgrade the UUPS implementation before cycle activation. Core settings lock once the next cycle activates. While no first gesture exists, the owner can postpone activation and reopen that maintenance interval.\n\nThe next-cycle delay and peripheral settings, including the vault beneficiary, NFT metadata links and retrieval timeout, have separate owner controls.\n\nV3 is the current implementation; owner powers have not automatically expired.',
      },
      'will-team-always-have-control': {
        question: 'Will the team always have control over the protocol’s parameters?',
        answer:
          'Current owner powers remain until an authorized transaction changes them. V3 has no automatic handover, expiry or renunciation. Transferring ownership to the Cosmic Council preserves those powers under Council control; renouncing ownership disables that owner role. Each contract’s ownership must be checked separately.',
      },
      'what-is-renounce-ownership': {
        question: 'What does “renouncing ownership” mean?',
        answer:
          'Renouncing an Ownable role sets its owner to the zero address and disables that role’s owner-only operations. It is different from transferring ownership to the Council, which preserves the powers for the new owner. Other contracts and independent roles are not changed by one renunciation.',
      },
      'why-renounce-ownership': {
        question: 'Why would the team renounce ownership?',
        answer:
          'The goal is a fair and decentralized protocol. Renouncing ownership ensures that the protocol’s rules cannot be changed arbitrarily once live — strengthening trust and predictability for participants.',
      },
      'how-team-profits': {
        question: 'How does the Cosmic Signature team receive value from the protocol?',
        answer: `The current ETH split has no separate team allocation. The Outreach Reserve receives ${outreachCst} CST per finalized cycle, distributed by its appointed treasurer. Team-associated addresses can participate under the same rules as others. These facts do not guarantee asset values or imply that administrative powers have ended.`,
      },
      'why-was-cs-created': {
        question: 'Why was Cosmic Signature created?',
        answer:
          'Cosmic Signature was born from a fascination with chaos theory and the unsolvable nature of the three-body problem. The idea of unique, deterministic art generated from on-chain seeds was both intriguing and fitting for a public-goods-aligned protocol.',
      },
      'what-if-team-disappears': {
        question: 'What if the team disappears?',
        answer:
          'The protocol is designed to be self-sustaining. Seeds are stored on-chain; anyone can regenerate NFT images and videos using the open-source Rust pipeline. This ensures the continued availability of every Cosmic Signature NFT regardless of the team’s status.',
      },
      'can-create-competing-site': {
        question: 'Can I fork this and build my own site?',
        answer:
          'Absolutely. Project-owned contracts, shaders, renderers, pages, and documentation are dedicated under CC0 1.0 — no rights reserved. Third-party dependencies, fonts, and assets retain their own licenses; see THIRD_PARTY_NOTICES.md.',
      },
      'donate-to-pot': {
        question: 'Can I contribute ETH to the Cycle Reserve without making a gesture?',
        answer:
          'Yes. The protocol contract exposes dedicated contribution functions that accept ETH independent of a gesture, and you may attach a note that can surface on the cycle’s contribution list. Use the app’s contribution flow rather than a plain wallet transfer: ETH sent directly to the protocol address is processed as an ETH gesture, not as a contribution. Reach out via Discord for details.',
      },
      'get-help': {
        question: 'How can I get help if I have questions?',
        answer:
          'Use the official Discord and X (Twitter) links, or the support email listed on the About page.',
      },
      'stay-updated': {
        question: 'How can I stay updated on Cosmic Signature news?',
        answer:
          'Follow the official social media channels and join the Discord community for the latest announcements, protocol coordination proposals, and cycle recaps.',
      },
    },
  },
} satisfies FAQText;
