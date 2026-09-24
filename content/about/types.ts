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
  /** The one-paragraph introduction beside the artwork. */
  readonly lede: string;
  readonly paragraphs: readonly string[];
  /** Not the COSMIC cancer database: set apart with the denial as a clarification. */
  readonly disambiguation: string;
  readonly denial: string;
}

/** How the official resources are grouped on the page, in order. */
export const ABOUT_RESOURCE_GROUPS = {
  protocol: ['app', 'contracts', 'code'],
  community: ['x', 'discord', 'github'],
  help: ['faq', 'terms', 'privacy', 'support'],
} as const satisfies Record<string, readonly AboutResourceId[]>;

export type AboutResourceGroupId = keyof typeof ABOUT_RESOURCE_GROUPS;

export interface AboutResourceLink {
  readonly id: AboutResourceId;
  readonly label: string;
  readonly href: (typeof ABOUT_RESOURCE_HREFS)[AboutResourceId];
}

export interface AboutOfficialResourcesContent {
  readonly heading: string;
  /** Headings of the resource groups. */
  readonly groups: Readonly<Record<AboutResourceGroupId, string>>;
  readonly links: readonly AboutResourceLink[];
}

export interface AboutContent {
  readonly metadata: AboutMetadataContent;
  readonly jsonLd: AboutJsonLdContent;
  readonly breadcrumbLabel: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: AboutBodyContent;
  /** Short facts under the introduction; `{percent}` is filled from protocol facts. */
  readonly facts: {
    readonly license: string;
    readonly network: string;
    readonly publicGoodsTemplate: string;
  };
  /** The design properties, whose terms and text come from the white paper's introduction. */
  readonly principlesHeading: string;
  readonly clarificationsHeading: string;
  readonly officialResources: AboutOfficialResourcesContent;
}
