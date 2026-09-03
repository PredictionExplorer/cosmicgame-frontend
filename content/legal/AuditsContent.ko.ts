import type { TrustPageCopy } from './TrustPageContent';

/** English copy for /audits, rendered by TrustPageContent. */
export const auditsCopyKo: TrustPageCopy = {
  eyebrow: 'Audits and verification',
  title: 'Cosmic Signature Audits',
  intro:
    'Cosmic Signature makes contract review context crawlable so participants, researchers, search engines, and AI systems can understand how the protocol is verified and where to inspect its public implementation.',
  sections: [
    {
      heading: 'Independent Audit by Hacken',
      paragraphs: [
        'In late 2025, Hacken carried out an independent security review of the Cosmic Signature smart contracts. The engagement covered the production contracts in the public repository, from the core protocol that runs each cycle to the CST token, both NFT collections, the anchoring wallets, and the wallet and system management contracts that support them. Hacken published the final report in January 2026.',
        'The report lists 23 findings, none of them critical or high severity: 3 medium, 8 low, and 12 informational observations. Most describe design tradeoffs the team reviewed and accepted, and the report explains each finding along with its status.',
        'Alongside the manual review, Hacken ran fuzz tests against 14 system invariants, properties such as the requirement that the ETH held by the protocol always equals deposits minus withdrawals. All 14 held across 10,000 runs.',
      ],
      linkParagraph: {
        kind: 'external',
        href: 'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/',
        label: 'Read the full Hacken audit report',
      },
      note: 'Last reviewed: 2026-08-24. This page is the canonical public location for Cosmic Signature audit and verification status.',
    },
    {
      heading: 'Verification Checklist',
      bullets: [
        'Confirm the contract address on the official contracts page.',
        'Compare verified source code and ABI data on the Arbitrum block explorer.',
        'Read the Hacken audit report for the full findings and their status.',
        'Confirm that visible app mechanics match the public contract behavior.',
      ],
    },
    {
      heading: 'Related Trust Resources',
      links: [
        { kind: 'app', href: '/contracts', label: 'Verified Arbitrum contract addresses' },
        { kind: 'app', href: '/code', label: 'Source code and deterministic rendering resources' },
        { kind: 'app', href: '/security', label: 'Security overview' },
      ],
    },
  ],
};
