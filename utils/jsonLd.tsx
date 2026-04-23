import type { FAQItem } from '@/app/faq/data/faq-data';

const SITE_URL = 'https://www.cosmicsignature.com';
const SITE_NAME = 'Cosmic Signature';
/** Branding from `public/images/logo.svg` — not an NFT asset on the CDN. */
const SITE_LOGO_URL = `${SITE_URL}/images/logo.svg`;

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures across Performance Cycles; the protocol distributes reserves across allocation tracks and supports Ethereum public goods.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/gallery?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    sameAs: ['https://x.com/CosmicSignature', 'https://discord.gg/bGnPn96Qwt'],
    description:
      'Cosmic Signature combines generative art with a coordination protocol on Arbitrum, forwarding part of each cycle to Ethereum public-goods infrastructure.',
  };
}

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a Web3-compatible browser or wallet extension',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'ETH',
    },
    description:
      'A procedural on-chain protocol on Arbitrum where participants make gestures, receive CST imprints and allocations across tracks, and can anchor NFTs for per-cycle distributions.',
  };
}

export function faqPageJsonLd(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(segments: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.name,
      item: `${SITE_URL}${segment.path}`,
    })),
  };
}

export function nftProductJsonLd({
  tokenId,
  name,
  description,
  imageUrl,
}: {
  tokenId: number;
  name: string;
  description: string;
  imageUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    url: `${SITE_URL}/detail/${tokenId}`,
    brand: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    category: 'Digital Collectible',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'ETH',
      price: '0',
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
