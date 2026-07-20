import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';

interface FAQItem {
  question: string;
  answer: string;
}

const SITE_URL = LANDING_ORIGIN;
const APP_URL = APP_ORIGIN;
const SITE_NAME = 'Cosmic Signature';
const SITE_LOGO_URL = `${SITE_URL}/images/logo.svg`;

const PROTOCOL_DESCRIPTION =
  'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild.';

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

interface LocalizedSiteJsonLdOptions {
  description?: string;
  inLanguage?: string;
  url?: string;
}

interface OrganizationJsonLdOptions {
  description?: string;
  url?: string;
}

interface ArtProtocolJsonLdOptions extends LocalizedSiteJsonLdOptions {
  creditText?: string;
  genre?: string;
  keywords?: readonly string[];
}

export function websiteJsonLd(options: LocalizedSiteJsonLdOptions = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: options.url ?? `${SITE_URL}/`,
    description: options.description ?? PROTOCOL_DESCRIPTION,
    ...(options.inLanguage ? { inLanguage: options.inLanguage } : {}),
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function organizationJsonLd(options: OrganizationJsonLdOptions = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: options.url ?? `${SITE_URL}/`,
    logo: SITE_LOGO_URL,
    sameAs: [
      'https://x.com/CosmicSignature',
      'https://discord.gg/bGnPn96Qwt',
      'https://github.com/PredictionExplorer',
    ],
    description: options.description ?? PROTOCOL_DESCRIPTION,
  };
}

interface WebApplicationJsonLdOptions extends LocalizedSiteJsonLdOptions {
  browserRequirements?: string;
}

export function webApplicationJsonLd(options: WebApplicationJsonLdOptions = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${APP_URL}/#webapp`,
    name: SITE_NAME,
    url: options.url ?? `${APP_URL}/`,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
    browserRequirements:
      options.browserRequirements ?? 'Requires a Web3-compatible browser or wallet extension',
    description:
      options.description ??
      'A procedural on-chain art protocol on Arbitrum. Participants make gestures during a Performance Cycle; the protocol distributes allocations across more than ten tracks when the cycle finalizes.',
    ...(options.inLanguage ? { inLanguage: options.inLanguage } : {}),
  };
}

export function webPageJsonLd({
  name,
  description,
  url,
  inLanguage,
}: {
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    ...(inLanguage ? { inLanguage } : {}),
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function collectionPageJsonLd({
  name,
  description,
  url,
  inLanguage,
}: {
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    ...(inLanguage ? { inLanguage } : {}),
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#art-protocol`,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function datasetJsonLd({
  name,
  description,
  url,
  dateModified,
  inLanguage,
}: {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  inLanguage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    dateModified,
    ...(inLanguage ? { inLanguage } : {}),
    creator: {
      '@id': `${SITE_URL}/#organization`,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    isAccessibleForFree: true,
  };
}

export function artProtocolJsonLd(options: ArtProtocolJsonLdOptions = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${SITE_URL}/#art-protocol`,
    name: SITE_NAME,
    url: options.url ?? `${SITE_URL}/`,
    image: SITE_LOGO_URL,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creditText: options.creditText ?? 'Cosmic Signature Protocol',
    description: options.description ?? PROTOCOL_DESCRIPTION,
    genre: options.genre ?? 'Generative Art',
    keywords: options.keywords ?? [
      'procedural art',
      'on-chain art',
      'three-body problem',
      'generative',
      'deterministic',
      'CC0',
      'Arbitrum',
      'Ethereum',
    ],
    ...(options.inLanguage ? { inLanguage: options.inLanguage } : {}),
  };
}

export function faqPageJsonLd(items: FAQItem[], inLanguage?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(inLanguage ? { inLanguage } : {}),
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

export function breadcrumbJsonLd(segments: BreadcrumbSegment[], baseUrl: string = APP_URL) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.name,
      item: segment.path.startsWith('http') ? segment.path : `${normalizedBaseUrl}${segment.path}`,
    })),
  };
}

export function nftProductJsonLd({
  tokenId,
  name,
  description,
  imageUrl,
  url,
  category,
}: {
  tokenId: number;
  name: string;
  description: string;
  imageUrl: string;
  url?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    url: url ?? `${APP_URL}/detail/${tokenId}`,
    brand: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    category: category ?? 'Digital Collectible',
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
