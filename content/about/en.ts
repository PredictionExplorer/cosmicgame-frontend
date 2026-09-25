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
      'So the art is physics, not a model: three bodies under Newtonian gravity, rendered from a seed recorded on-chain by an open-source pipeline and released under CC0. The distribution is mechanical: the contracts execute every allocation, and no team wallet receives ETH from gestures. And the team’s role is finite: its owner powers are locked while a cycle runs and are set to end once the remaining upgrades land.',
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
        status: 'Live today',
        text: 'Five changes drawn from how the protocol is used, among them Participation CST that grows with the time between gestures and a longer window for the Final Gesture participant to finalize.',
      },
      v3: {
        label: 'V3',
        status: 'Planned',
        text: 'A premium on gestures in the last minutes before the deadline, so sustained participation counts for more than last-second timing. It is in development in the public repository.',
      },
      handover: {
        label: 'Then',
        status: 'Committed',
        text: 'Once the design is final, owner control leaves the deploying address for good: transferred to the Cosmic Council or renounced, with the mechanism announced in advance.',
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
        label: 'Verified Arbitrum contracts',
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
