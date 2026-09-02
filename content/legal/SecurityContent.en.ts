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
        'Protocol actions are recorded by Arbitrum smart contracts. Public pages should let users and crawlers inspect the contract addresses, source-code resources, verification context, and operational assumptions before connecting a wallet or making a gesture.',
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
