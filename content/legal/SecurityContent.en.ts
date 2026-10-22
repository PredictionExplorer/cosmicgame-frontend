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
      'The companion contracts and historical V2 implementation have published source matches checked {date}. The current V3 implementation is listed separately and is not yet verified on Sourcify. A local runtime comparison is not public source verification or a security audit. Inspect the <contracts>contracts page</contracts> and each lookup.',
    explorerLink: 'Arbiscan',
    sourcifyLink: 'Sourcify',
    copyLabel: 'Copy {value}',
    copiedLabel: 'Copied',
  },
  controls: {
    heading: 'Owner controls and upgrades',
    paragraph:
      'The Cosmic Signature Protocol contract has an owner: one account that can change some of its parameters and upgrade its code, within the limits below. Every change is recorded on-chain and listed under <coordination>coordination changes</coordination>.',
    ownerLabel: 'Owner',
    ownerUnavailable:
      'The owner could not be read just now. The contract’s owner() function on Arbiscan returns it.',
    account: {
      singleKey: 'A single-key wallet (an externally owned account), not a multisig or a timelock.',
      contract: 'A smart-contract account, such as a multisig or a timelock.',
      renounced:
        'Ownership has been renounced: no account can change the parameters or upgrade the code.',
    },
    rows: [
      {
        term: 'Between cycles',
        detail:
          'The owner can change protocol parameters, such as the time each gesture adds or the allocation-track percentages.',
      },
      {
        term: 'During a cycle',
        detail:
          'Core settings and upgrades require the time before cycle activation. While no first gesture exists, the owner can postpone activation and reopen that maintenance interval. After the first gesture, core settings remain locked until finalization.',
      },
      {
        term: 'At any time',
        detail:
          'The owner can postpone a cycle’s activation until its first gesture arrives, change the delay before the next cycle, and manage the peripheral contracts: the Public Goods Beneficiary, the NFT metadata links and the Allocations Wallet retrieval timeout.',
      },
      {
        term: 'Upgrades',
        detail:
          'The UUPS proxy currently points to V3. The owner may upgrade before activation under the contract’s authorization rules. Inspect the current implementation address and verification status; an old implementation’s verification does not cover its replacement.',
      },
      {
        term: 'Cosmic Council',
        detail:
          'The Council does not currently own the core protocol. V3 contains no automatic transfer or removal of owner powers. A future transfer preserves those powers for the Council; renunciation disables that owner role. Each contract has its own controls.',
      },
    ],
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
    lead: 'If you find a vulnerability in the Cosmic Signature contracts, the app or this website, email <support>support@cosmicsignature.com</support> with “Security” in the subject. A useful report says:',
    include: [
      'What you found, and which contract, page or address it affects.',
      'How to reproduce it, step by step.',
      'What it would let someone do, and to whose funds.',
      'How the team can reach you.',
    ],
    scopeHeading: 'Scope',
    scope: [
      {
        term: 'In scope',
        detail:
          'The contracts under <securityOfficial>Official addresses</securityOfficial>, app.cosmicsignature.com and cosmicsignature.com.',
      },
      {
        term: 'Not in scope',
        detail:
          'Services Cosmic Signature does not run, such as wallets, marketplaces, bridges and the Arbitrum network itself. Report those to their own teams.',
      },
    ],
    closing:
      'Please give the team time to reply and fix the issue before you disclose it publicly, and do not test an exploit against the live contracts or another participant’s funds. The same contact is published in the site’s <securityTxt>security.txt</securityTxt> file.',
  },
  verify: {
    heading: 'Verify it yourself',
    paragraph:
      'Compare the app with live Arbitrum state, the implementation currently installed, its source and the scope of available verification. Published verification and audits have distinct meanings and must match the revision being inspected.',
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
