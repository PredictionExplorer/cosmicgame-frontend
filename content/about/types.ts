import { APP_ORIGIN } from '@/lib/hostRouting';

export const ABOUT_PATH = '/about';

/**
 * The Signature that introduces the protocol, on the page and its share card:
 * a token id in components/reading/signaturePlates.
 */
export const ABOUT_PLATE_TOKEN_ID = 2;

/**
 * The official resources About lists, in order: the protocol's own and a way
 * to write in. Community and legal links live in the footer (config/siteNav),
 * the one source of those addresses.
 */
export const ABOUT_RESOURCE_HREFS = {
  app: APP_ORIGIN,
  contracts: `${APP_ORIGIN}/contracts`,
  code: `${APP_ORIGIN}/code`,
  support: 'mailto:support@cosmicsignature.com',
} as const;

export type AboutResourceId = keyof typeof ABOUT_RESOURCE_HREFS;

export const ABOUT_RESOURCE_IDS = Object.keys(ABOUT_RESOURCE_HREFS) as readonly AboutResourceId[];

/**
 * The protocol's path from launch to handover, as the white paper records it
 * (§12 Deployment History and §13 The Path to Full Decentralization).
 */
export const ABOUT_MILESTONE_IDS = ['v1', 'v2', 'v3', 'handover'] as const;

export type AboutMilestoneId = (typeof ABOUT_MILESTONE_IDS)[number];

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
  /** The one-paragraph introduction under the heading. */
  readonly lede: string;
  /** What the protocol is not, set apart as a clarification. */
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

export interface AboutMilestone {
  /** The version or step ("V2"). */
  readonly label: string;
  /** Where it stands ("Live today"). */
  readonly status: string;
  readonly text: string;
}

export interface AboutContent {
  readonly metadata: AboutMetadataContent;
  readonly jsonLd: AboutJsonLdContent;
  readonly breadcrumbLabel: string;
  /** "About Cosmic Signature": the page's name, above its heading. */
  readonly eyebrow: string;
  /** A statement of what the protocol is, not the page's name again. */
  readonly heading: string;
  readonly body: AboutBodyContent;
  /** The header's facts, label and value; `{percent}` is filled from protocol facts. */
  readonly facts: {
    readonly licenseLabel: string;
    readonly license: string;
    readonly networkLabel: string;
    readonly network: string;
    readonly publicGoodsLabel: string;
    readonly publicGoodsTemplate: string;
  };
  /** Who designed the protocol and why, from the white paper's own account. */
  readonly origin: {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  };
  readonly milestones: {
    readonly heading: string;
    readonly items: Readonly<Record<AboutMilestoneId, AboutMilestone>>;
  };
  readonly clarificationsHeading: string;
  readonly officialResources: AboutOfficialResourcesContent;
}
