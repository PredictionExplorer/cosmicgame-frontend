import type { TrustPageCopy } from './TrustPageContent';

/** English copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyVi: TrustPageCopy = {
  eyebrow: 'Risk and participant clarity',
  title: 'Cosmic Signature Risk Disclosures',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. It is not a lottery, casino, gambling product, investment product, or promise of financial results.',
  // lexicon-allow-end
  sections: [
    {
      heading: 'Key Risks',
      bullets: [
        'Blockchain transactions are public and generally irreversible.',
        'Wallet security, private keys, and transaction approvals are user responsibilities.',
        'Network congestion, RPC outages, indexer delays, or app issues can affect UX.',
        'Protocol parameters, allocations, and timing should be reviewed before participating.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CST and NFTs should not be understood as guaranteed returns or financial products.',
        // lexicon-allow-end
      ],
    },
    {
      heading: 'What Participants Do',
      paragraphs: [
        'Participants make gestures during Performance Cycles. Gestures can influence the evolving protocol state, imprint Participation CST, and contribute to the context of deterministic Cosmic Signature NFT art. Outcomes are defined by public smart-contract mechanics, not by off-chain promises.',
      ],
    },
    {
      heading: 'Related Pages',
      links: [
        // lexicon-allow-start: link label names the categories denied by the linked page.
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Is Cosmic Signature a lottery, casino, or investment?',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: 'Terms of Service' },
        { kind: 'app', href: '/security', label: 'Security overview' },
      ],
    },
  ],
};
