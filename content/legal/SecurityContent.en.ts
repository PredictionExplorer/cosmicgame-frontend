import type { SecurityCopy } from './SecurityContent';

/** English copy for /security, rendered by SecurityContent. */
export const securityCopyEn: SecurityCopy = {
  title: 'Security',
  intro:
    'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Its security rests on public smart contracts, transparent protocol data, careful wallet interactions and clear information for participants.',
  official: {
    heading: 'Official addresses',
    intro:
      'Open Cosmic Signature only from these websites, and check an address character by character before you connect a wallet or approve a transaction. Any other site or account that claims to be Cosmic Signature is not.',
    websitesHeading: 'Websites',
    websites: {
      app: 'The app: gestures, allocations, anchoring and the public records',
      landing: 'The project site: the art, the white paper and the guides',
    },
    communityHeading: 'Community',
    community: {
      x: 'Announcements',
      discord: 'Community chat and support',
    },
    contractsHeading: 'Core contracts on Arbitrum One',
    contractsIntro:
      'The published source code of each contract is an exact match on Sourcify (checked {date}), so the bytecode on-chain is the code you can read. The <contracts>contracts page</contracts> lists every address.',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: 'Copy {value}',
    copiedLabel: 'Copied',
  },
  model: {
    heading: 'Security model',
    paragraph:
      'Arbitrum smart contracts record every protocol action. Before you connect a wallet or make a gesture, review the published contract addresses, the source code, the audit and the risks.',
    bullets: [
      'Open the app only from the official addresses above, and check the address bar before you connect a wallet.',
      'Confirm a contract address on the <contracts>contracts page</contracts> before you interact with it on-chain.',
      'Read every wallet prompt before you approve it: blockchain transactions cannot be reversed.',
      'Cosmic Signature will never ask for your seed phrase or private keys. Anyone who does is not Cosmic Signature.',
      'Do not treat CST, NFTs, gestures or allocations as guaranteed financial outcomes; see the <risk>risk disclosures</risk>.',
    ],
  },
  report: {
    heading: 'Report a vulnerability',
    paragraphs: [
      'If you find a vulnerability in the contracts, the app or this website, email <support>support@cosmicsignature.com</support> with “Security” in the subject. Describe what you found, how to reproduce it and what it affects.',
      'Please give the team time to reply and fix the issue before you disclose it publicly, and do not test an exploit against the live contracts or another participant’s funds. The same contact is published in the site’s <securityTxt>security.txt</securityTxt> file.',
    ],
  },
  verify: {
    heading: 'Verify it yourself',
    paragraph:
      'The strongest security signal is agreement between what the app shows, the verified contracts, the source code and live Arbitrum data. Each of these can be checked without trusting this site.',
    resources: [
      {
        link: 'contracts',
        label: 'Contract addresses',
        description:
          'Every Cosmic Signature contract on Arbitrum, with explorer and Sourcify links',
      },
      {
        link: 'audits',
        label: 'Audit',
        description:
          'The Hacken audit: findings by severity, fuzzed invariants and the full report',
      },
      {
        link: 'code',
        label: 'Source code',
        description: 'The repositories and the renderer that turns each seed into its artwork',
      },
      {
        link: 'sourcify',
        label: 'Sourcify',
        description: 'Match any contract’s bytecode against its published source',
      },
    ],
  },
};
