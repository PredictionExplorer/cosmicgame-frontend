import { APP_ORIGIN } from '@/lib/hostRouting';

export const ABOUT_PATH = '/about';

export const ABOUT_RESOURCE_HREFS = {
  app: APP_ORIGIN,
  contracts: `${APP_ORIGIN}/contracts`,
  code: `${APP_ORIGIN}/code`,
  x: 'https://x.com/CosmicSignature',
  discord: 'https://discord.gg/bGnPn96Qwt',
  github: 'https://github.com/PredictionExplorer',
  faq: `${APP_ORIGIN}/faq`,
  terms: `${APP_ORIGIN}/terms`,
  privacy: `${APP_ORIGIN}/privacy`,
  support: 'mailto:support@cosmicsignature.com',
} as const;

export type AboutResourceId = keyof typeof ABOUT_RESOURCE_HREFS;

export interface AboutMetadataContent {
  readonly title: string;
  readonly description: string;
  readonly path: typeof ABOUT_PATH;
}

export interface AboutJsonLdContent {
  readonly name: string;
  readonly description: string;
}

export interface AboutBodyContent {
  readonly paragraphs: readonly string[];
  readonly denial: string;
}

export interface AboutResourceLink {
  readonly id: AboutResourceId;
  readonly label: string;
  readonly href: (typeof ABOUT_RESOURCE_HREFS)[AboutResourceId];
}

export interface AboutOfficialResourcesContent {
  readonly heading: string;
  readonly links: readonly AboutResourceLink[];
}

export interface AboutContent {
  readonly metadata: AboutMetadataContent;
  readonly jsonLd: AboutJsonLdContent;
  readonly breadcrumbLabel: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: AboutBodyContent;
  readonly officialResources: AboutOfficialResourcesContent;
}
