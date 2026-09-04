import type { TrustPageCopy } from './TrustPageContent';

/** English copy for /security, rendered by TrustPageContent. */
export const securityCopyEn: TrustPageCopy = {
  eyebrow: 'Trust and security',
  title: 'Cosmic Signature Security',
  intro:
    'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Its security posture depends on public smart contracts, transparent protocol data, careful wallet interactions, and clear participant education.',
  sections: [
    {
      heading: 'Security Model',
      paragraphs: [
        'Arbitrum smart contracts record protocol actions. Before connecting a wallet or making a gesture, review the published contract addresses, source code, verification reports, and operational assumptions.',
      ],
      bullets: [
        'Use the official app at `https://app.cosmicsignature.com/`.',
        'Verify contract addresses from the contracts page before interacting on-chain.',
        'Review wallet prompts carefully; blockchain transactions cannot be reversed.',
        'Do not treat CST, NFTs, gestures, or allocations as guaranteed financial outcomes.',
      ],
    },
    {
      heading: 'Verification Resources',
      paragraphs: [
        'The strongest security signal is consistency between visible app content, verified contracts, source code, and live Arbitrum data.',
      ],
      links: [
        {
          kind: 'app',
          href: '/contracts',
          label: 'Cosmic Signature contracts and Arbitrum addresses',
        },
        {
          kind: 'app',
          href: '/code',
          label: 'Cosmic Signature source code and rendering pipeline',
        },
        { kind: 'app', href: '/audits', label: 'Audits and formal verification notes' },
        {
          kind: 'app',
          href: '/risk-disclosures',
          label: 'Risk disclosures and participant clarity',
        },
      ],
    },
  ],
};
