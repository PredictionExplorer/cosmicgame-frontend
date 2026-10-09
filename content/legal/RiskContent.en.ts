import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** English copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyEn: RiskCopy = {
  title: 'Risk disclosures',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. It is not a lottery, casino, gambling product, investment product, or promise of financial results.',
  // lexicon-allow-end
  keyPoint: {
    title: 'Before you take part',
    text: 'Only make gestures with funds you can afford to forgo. What you spend on a gesture is not refunded, whatever happens later in the cycle.',
  },
  groups: [
    {
      id: 'mechanics',
      heading: 'Cycle mechanics',
      risks: [
        'ETH or CST spent on a gesture is not refunded when a later gesture follows it.',
        `Each ETH gesture raises the next ETH Gesture Cost by ${facts.ethGestureCostStepUpPercent}%, so repeated gestures cost more each time.`,
        'The Calibration Window moves the CST Gesture Cost: it falls steadily while no one makes a CST gesture and restarts higher after each one, so the cost you see can change before your transaction lands.',
      ],
      source:
        'The rules: <termsMechanics>Protocol mechanics</termsMechanics> in the Terms of Service.',
    },
    {
      id: 'timing',
      heading: 'Timing and retrieval',
      risks: [
        `The participant who made the final gesture has ${facts.finalGestureExclusivityHours} hours after the Cycle Finalization Time to finalize the cycle alone. After that, anyone may finalize it and, under the contract rules, becomes the Recipient of the Signature Allocation.`,
        `Other ETH allocations and attached assets wait ${facts.secondaryRetrievalTimeoutWeeks} weeks by default for their Recipients. After that, anyone may retrieve what is left for themselves.`,
      ],
      source:
        'The rules: <termsRetrieval>Retrieving allocations</termsRetrieval> in the Terms of Service.',
    },
    {
      id: 'permanent',
      heading: 'Permanent actions',
      risks: [
        'Confirmed transactions cannot be reversed, cancelled or refunded.',
        'A Random Walk NFT used for the ETH Gesture Cost reduction is used up: it can never reduce a cost again.',
        'An NFT can be anchored only once. After it is released, it cannot be anchored again.',
      ],
      source:
        'The rules: <termsRandomWalk>Random Walk NFT cost reduction</termsRandomWalk> in the Terms of Service.',
    },
    {
      id: 'wallets',
      heading: 'Wallets and keys',
      risks: [
        'You alone hold your keys. Anyone with your seed phrase controls your wallet, and a lost phrase cannot be recovered.',
        'A wallet prompt can grant more than it seems to. Read every approval, and use only the <securityOfficial>official addresses</securityOfficial>.',
      ],
      source:
        'The rules: <termsEligibility>Eligibility and account requirements</termsEligibility> in the Terms of Service.',
    },
    {
      id: 'availability',
      heading: 'Networks and the app',
      risks: [
        'Network congestion, RPC outages, indexer delays or app issues can delay or block transactions and the data this site displays.',
        'The site can show data that lags the chain by a few seconds or more. When they differ, the contracts on Arbitrum are the source of truth.',
        'Smart contracts can contain defects that no audit found. See the <audits>audit</audits> for what was checked.',
      ],
      source: 'The rules: <termsRisks>Risks and disclaimers</termsRisks> in the Terms of Service.',
    },
    {
      id: 'value',
      heading: 'Value and outcomes',
      risks: [
        'The market value of ETH, CST and NFTs can change sharply, including to zero.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CST and NFTs should not be understood as guaranteed returns or financial products.',
        // lexicon-allow-end
        'No gesture guarantees an allocation. Outcomes follow the public contract rules, not off-chain promises.',
      ],
      source:
        'The rules: <termsNoGuarantee>No guaranteed outcomes</termsNoGuarantee> in the Terms of Service.',
    },
  ],
  participation: {
    heading: 'What participants do',
    paragraphs: [
      'Participants make gestures during Performance Cycles. Gestures can influence the evolving protocol state, imprint Participation CST, and contribute to the context of deterministic Cosmic Signature NFT art. Outcomes are defined by public smart-contract mechanics, not by off-chain promises.',
      // lexicon-allow-start: link label names the categories denied by the linked page.
      'Read why Cosmic Signature is <notALottery>not a lottery, casino or investment</notALottery>.',
      // lexicon-allow-end
    ],
  },
};
