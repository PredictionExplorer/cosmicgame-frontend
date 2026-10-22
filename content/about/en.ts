import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentEn = {
  metadata: {
    title: 'About Cosmic Signature | On-Chain Art on Arbitrum',
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum that turns Performance Cycle gestures into deterministic three-body NFT art.',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'About Cosmic Signature',
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum that generates deterministic three-body NFT art from Performance Cycle gestures.',
  },
  breadcrumbLabel: 'About',
  eyebrow: 'About Cosmic Signature',
  heading: 'Art anyone can reproduce, from seed to Signature',
  body: {
    lede: 'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. During each Performance Cycle, participants make gestures with ETH or CST, and every gesture helps shape the final Signature: deterministic NFT artwork generated from on-chain data and rendered through a three-body physics simulation.',
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature is not offered as an investment product. The protocol describes participation, gestures, allocations, anchoring, and public-goods forwarding; it does not promise token price behavior or financial outcomes.',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: 'License',
    license: 'CC0, art and code',
    networkLabel: 'Network',
    network: 'Arbitrum One',
    publicGoodsLabel: 'Public Goods',
    publicGoodsTemplate: '{percent} of every Cycle Reserve',
  },
  origin: {
    heading: 'Origin',
    paragraphs: [
      `Cosmic Signature was designed by ${WHITE_PAPER_SHARED.authorName}, who also wrote its white paper. It began with two convictions: that generative art is most interesting when nothing about it is arbitrary, each image the output of a physical process anyone can rerun from its seed; and that a protocol holding ETH for its participants owes them a readable answer to where every wei goes.`,
      'The artwork comes from an on-chain seed and an open-source physics renderer. Reproduction uses the matching renderer revision and configuration. The contracts execute configured allocation rules, while substantial owner powers remain. Those powers have no automatic expiry, and V3 does not transfer them to the Cosmic Council.',
    ],
  },
  milestones: {
    heading: 'From launch to handover',
    items: {
      v1: {
        label: 'V1',
        status: 'Launched',
        text: 'The protocol goes live on Arbitrum One behind an upgradeable proxy: cycles, gestures, the allocation tracks, anchoring, the Cosmic Council and the art pipeline.',
      },
      v2: {
        label: 'V2',
        status: 'Historical',
        text: 'The June 2026 implementation introduced elapsed-time Participation CST for the submitting participant and revised timing protections. V3 has since replaced it.',
      },
      v3: {
        label: 'V3',
        status: 'Live today',
        text: 'Installed on October 21, 2026. V3 credits linear Participation CST to the previous participant, weights both participant selection tracks, adapts CST price decline, changes allocations, and adds a late cost premium.',
      },
      handover: {
        label: 'Then',
        status: 'Not executed',
        text: 'Owner control remains observable on-chain. Transferring it to the Cosmic Council and renouncing it have different consequences. Neither is scheduled or required automatically by V3.',
      },
    },
  },
  clarificationsHeading: 'Clarifications',
  officialResources: {
    heading: 'Official resources',
    links: [
      { id: 'app', label: 'Cosmic Signature app', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Arbitrum contract addresses',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'Source code resources', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
