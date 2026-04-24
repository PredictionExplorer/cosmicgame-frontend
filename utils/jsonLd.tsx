interface FAQItem {
  question: string;
  answer: string;
}

const SITE_URL = 'https://www.cosmicsignature.com';
const APP_URL = 'https://app.cosmicsignature.com';
const SITE_NAME = 'Cosmic Signature';
const SITE_LOGO_URL = `${SITE_URL}/images/logo.svg`;

const PROTOCOL_DESCRIPTION =
  'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild.';

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
    description: PROTOCOL_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/gallery?search={search_term_string}`,
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
    description: PROTOCOL_DESCRIPTION,
  };
}

export function webApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: APP_URL,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a Web3-compatible browser or wallet extension',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'ETH',
    },
    description:
      'A procedural on-chain art protocol on Arbitrum. Participants make gestures during a Performance Cycle; the protocol distributes allocations across more than ten tracks when the cycle finalizes.',
  };
}

export function artProtocolJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: SITE_NAME,
    url: SITE_URL,
    image: SITE_LOGO_URL,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creditText: 'Cosmic Signature Protocol',
    description: PROTOCOL_DESCRIPTION,
    genre: 'Generative Art',
    keywords: [
      'procedural art',
      'on-chain art',
      'three-body problem',
      'generative',
      'deterministic',
      'CC0',
      'Arbitrum',
      'Ethereum',
    ],
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
    url: `${APP_URL}/detail/${tokenId}`,
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
