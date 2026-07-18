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
  eyebrow: 'Entity home',
  heading: 'About Cosmic Signature',
  body: {
    paragraphs: [
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. During each Performance Cycle, participants make gestures with ETH or CST, and every gesture helps shape the final Signature: deterministic NFT artwork generated from on-chain data and rendered through a three-body physics simulation.',
      'The protocol is designed around public, verifiable mechanics. Arbitrum smart contracts record gestures, cycles, allocation tracks, CST, anchoring, and NFT imprints. The artwork is reproducible from its seed, and the project emphasizes open source code, CC0 art, and public-goods support.',
      'Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC mutational signatures in biology. It is an on-chain art protocol and app.',
    ],
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature is not offered as an investment product. The protocol describes participation, gestures, allocations, anchoring, and public-goods forwarding; it does not promise token price behavior or financial outcomes.',
    // lexicon-allow-end
  },
  officialResources: {
    heading: 'Official Resources',
    links: [
      { id: 'app', label: 'Cosmic Signature app', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Verified Arbitrum contracts',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'Source code resources', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: 'FAQ', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: 'Terms of Service', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: 'Privacy Policy', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
