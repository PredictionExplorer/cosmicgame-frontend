/**
 * The site navigation taxonomy: every destination on both hosts, in seven
 * sections, with one canonical name each (`nav.routes.<id>.label`).
 *
 * One model renders every navigation surface: the app header and its
 * panels, the mobile drawer, both footers, the /site-map page, the landing
 * header, the wallet account menu, the 404 suggestions and the command
 * palette. A destination is named and grouped the same way everywhere, and a
 * new page is added in one place.
 *
 * Landing-safe: plain data and pure helpers, no React and no wallet stack.
 * Icons live in `config/siteNavIcons.ts`, which only the surfaces that draw
 * them import, so the landing bundle never carries the icon set.
 */
import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

/** The two Cosmic Signature hosts: app.cosmicsignature.com and cosmicsignature.com. */
export type SiteHost = 'app' | 'landing';

/** Section order is display order on every surface. */
export const SITE_SECTION_IDS = [
  'participate',
  'collection',
  'explore',
  'records',
  'learn',
  'trust',
  'account',
] as const;

export type SiteSectionId = (typeof SITE_SECTION_IDS)[number];

export type SiteRouteGroupId = 'publicGoods';

interface SiteRouteDefinition {
  readonly host: SiteHost;
  /** Public, locale-free path on its host. */
  readonly path: string;
  readonly section: SiteSectionId;
  /**
   * Detail pages that belong to this destination (`/detail/25` is part of
   * the Gallery). A route's own path always matches its sub-paths too.
   */
  readonly owns?: readonly string[];
  /** Listed nested under another destination in its section (a Statistics section under Statistics). */
  readonly parent?: string;
  /** Listed in the footer directories. The site map lists every route. */
  readonly footer?: boolean;
  /** Shown as one row with its siblings in compact menus (see SITE_ROUTE_GROUPS). */
  readonly group?: SiteRouteGroupId;
}

/**
 * Every destination. Keys are the route ids; the label and one-line
 * description of each live at `nav.routes.<id>` in all eight catalogs.
 */
const ROUTE_DEFINITIONS = {
  // Participate: where a visitor acts.
  observatory: { host: 'app', path: '/', section: 'participate', footer: true },
  imprint: { host: 'app', path: '/imprint', section: 'participate', footer: true },

  // Collection: the art.
  gallery: {
    host: 'app',
    path: '/gallery',
    section: 'collection',
    owns: ['/detail'],
    footer: true,
  },
  namedNfts: { host: 'app', path: '/named-nfts', section: 'collection', footer: true },
  attachedNfts: { host: 'app', path: '/attached-nfts', section: 'collection', footer: true },
  usedRwlkNfts: { host: 'app', path: '/used-rwlk-nfts', section: 'collection', footer: true },

  // Explore: the live cycle in full, protocol-wide figures, and the
  // participant and gesture views. The header's Explore panel leads with
  // the Current Cycle, so every surface files it here.
  currentCycle: { host: 'app', path: '/current-cycle', section: 'explore', footer: true },
  statistics: { host: 'app', path: '/statistics', section: 'explore', footer: true },
  statisticsParticipation: {
    host: 'app',
    path: '/statistics/participation',
    section: 'explore',
    parent: 'statistics',
    footer: true,
  },
  statisticsTokens: {
    host: 'app',
    path: '/statistics/tokens',
    section: 'explore',
    parent: 'statistics',
    footer: true,
  },
  statisticsAnchoring: {
    host: 'app',
    path: '/statistics/anchoring',
    section: 'explore',
    parent: 'statistics',
    footer: true,
  },
  statisticsActivity: {
    host: 'app',
    path: '/statistics/activity',
    section: 'explore',
    parent: 'statistics',
    footer: true,
  },
  statisticsPerformance: {
    host: 'app',
    path: '/statistics/performance',
    section: 'explore',
    parent: 'statistics',
    footer: true,
  },

  // Records: where every cycle's value went.
  allocationRecipients: { host: 'app', path: '/allocation', section: 'records', footer: true },
  anchorDistributions: {
    host: 'app',
    path: '/anchoring',
    section: 'records',
    owns: ['/anchor-action'],
    footer: true,
  },
  outreachAllocations: { host: 'app', path: '/marketing', section: 'records', footer: true },
  publicGoodsProtocol: {
    host: 'app',
    path: '/public-goods-contributions-cg',
    section: 'records',
    group: 'publicGoods',
    footer: true,
  },
  publicGoodsVoluntary: {
    host: 'app',
    path: '/public-goods-contributions-voluntary',
    section: 'records',
    group: 'publicGoods',
  },
  publicGoodsRetrievals: {
    host: 'app',
    path: '/public-goods-retrievals',
    section: 'records',
    group: 'publicGoods',
  },
  ethContributions: { host: 'app', path: '/eth-contribution', section: 'records', footer: true },
  coordinationChanges: {
    host: 'app',
    path: '/coordination-changes',
    section: 'records',
    // A system event is one of these parameter changes, opened from its ledger.
    owns: ['/system-event'],
    footer: true,
  },
  retrievedAllocations: { host: 'app', path: '/allocation-finalized', section: 'records' },

  // Learn: how it works, on either host.
  howItWorks: { host: 'app', path: '/how-it-works', section: 'learn', footer: true },
  faq: { host: 'app', path: '/faq', section: 'learn', footer: true },
  learnHub: { host: 'landing', path: '/learn', section: 'learn', footer: true },
  whitePaper: { host: 'landing', path: '/white-paper', section: 'learn', footer: true },
  quiz: { host: 'landing', path: '/quiz', section: 'learn', footer: true },
  about: { host: 'landing', path: '/about', section: 'learn', footer: true },
  projectSite: { host: 'landing', path: '/', section: 'learn', footer: true },

  // Trust: verification, risks and the legal terms.
  security: { host: 'app', path: '/security', section: 'trust', footer: true },
  audits: { host: 'app', path: '/audits', section: 'trust', footer: true },
  contracts: { host: 'app', path: '/contracts', section: 'trust', footer: true },
  sourceCode: {
    host: 'app',
    path: '/code',
    section: 'trust',
    owns: ['/source-code'],
    footer: true,
  },
  // In both footers' legal row with the Terms and Privacy, not again in the Trust column.
  riskDisclosures: { host: 'app', path: '/risk-disclosures', section: 'trust' },
  terms: { host: 'app', path: '/terms', section: 'trust' },
  privacy: { host: 'app', path: '/privacy', section: 'trust' },
  siteMap: { host: 'app', path: '/site-map', section: 'trust', footer: true },

  // Account: the connected wallet's own pages.
  myStatistics: { host: 'app', path: '/my-statistics', section: 'account' },
  myAllocations: { host: 'app', path: '/my-allocations', section: 'account' },
  myNfts: { host: 'app', path: '/my-tokens', section: 'account' },
  myAnchors: { host: 'app', path: '/my-anchors', section: 'account' },
  allocationHistory: { host: 'app', path: '/recipient-history', section: 'account' },
  transferCst: { host: 'app', path: '/transfer-cst', section: 'account' },
} as const satisfies Record<string, SiteRouteDefinition>;

export type SiteRouteId = keyof typeof ROUTE_DEFINITIONS;

export interface SiteRoute extends Omit<SiteRouteDefinition, 'parent'> {
  readonly id: SiteRouteId;
  readonly parent?: SiteRouteId;
}

/** Every destination, in display order. */
export const SITE_ROUTES: readonly SiteRoute[] = (
  Object.entries(ROUTE_DEFINITIONS) as [SiteRouteId, SiteRouteDefinition][]
).map(([id, definition]) => ({ id, ...definition }) as SiteRoute);

const ROUTES_BY_ID = new Map<SiteRouteId, SiteRoute>(SITE_ROUTES.map((entry) => [entry.id, entry]));

export function getSiteRoute(id: SiteRouteId): SiteRoute {
  const found = ROUTES_BY_ID.get(id);
  if (!found) throw new Error(`Unknown site route: ${id}`);
  return found;
}

/** The routes of one section, in display order. */
export function routesInSection(section: SiteSectionId): readonly SiteRoute[] {
  return SITE_ROUTES.filter((entry) => entry.section === section);
}

/**
 * The page that stands for each section: where a page header's section
 * eyebrow and crumb lead (components/layout/pageSections). Records has no
 * single ledger page, so its hub is its part of the site map, which lists
 * every ledger.
 */
export const SITE_SECTION_HUBS: Readonly<Record<SiteSectionId, string>> = {
  participate: ROUTE_DEFINITIONS.observatory.path,
  collection: ROUTE_DEFINITIONS.gallery.path,
  explore: ROUTE_DEFINITIONS.statistics.path,
  records: `${ROUTE_DEFINITIONS.siteMap.path}#records`,
  learn: ROUTE_DEFINITIONS.howItWorks.path,
  trust: ROUTE_DEFINITIONS.security.path,
  account: ROUTE_DEFINITIONS.myStatistics.path,
};

/**
 * Sibling destinations that compact menus show as one row linking to the
 * first. Their copy lives at `nav.groups.<id>`.
 */
export const SITE_ROUTE_GROUPS: Record<SiteRouteGroupId, readonly SiteRouteId[]> = {
  publicGoods: ['publicGoodsProtocol', 'publicGoodsVoluntary', 'publicGoodsRetrievals'],
};

/**
 * Paths with no menu entry of their own (a participant, a gesture, a
 * transfer history) that still belong to a section, so the header can say
 * where the visitor is.
 */
const SECTION_PATH_PREFIXES: Partial<Record<SiteSectionId, readonly string[]>> = {
  explore: [
    '/user',
    '/gesture',
    '/cosmic-token-transfer',
    '/cosmic-signature-transfer',
    '/distributions-by-token',
  ],
};

function pathMatches(pathname: string, prefix: string): boolean {
  if (prefix === '/') return pathname === '/';
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export interface SiteLocation {
  /** The destination the page belongs to, if any. */
  readonly route: SiteRoute | null;
  /** True when the page IS the destination, not one of its detail pages. */
  readonly exact: boolean;
  readonly section: SiteSectionId | null;
}

/**
 * Where a locale-free pathname sits in the taxonomy: the longest matching
 * destination (by path, or by a detail path it owns) and its section.
 * `/detail/25` resolves to the Gallery (not exact), `/allocation-finalized`
 * to its own route rather than `/allocation`, and a participant page to the
 * Explore section without a route.
 */
export function locateSitePath(pathname: string, host: SiteHost = 'app'): SiteLocation {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  let best: { entry: SiteRoute; length: number; exact: boolean } | null = null;
  for (const entry of SITE_ROUTES) {
    if (entry.host !== host) continue;
    for (const prefix of [entry.path, ...(entry.owns ?? [])]) {
      if (!pathMatches(path, prefix)) continue;
      if (!best || prefix.length > best.length) {
        best = { entry, length: prefix.length, exact: path === entry.path };
      }
    }
  }
  if (best) return { route: best.entry, exact: best.exact, section: best.entry.section };
  if (host === 'app') {
    for (const [section, prefixes] of Object.entries(SECTION_PATH_PREFIXES)) {
      if (prefixes?.some((prefix) => pathMatches(path, prefix))) {
        return { route: null, exact: false, section: section as SiteSectionId };
      }
    }
  }
  return { route: null, exact: false, section: null };
}

// ---------------------------------------------------------------------------
// Outbound links: third-party destinations, always opened in a new tab.

export type OutboundGroupId = 'ecosystem' | 'community';

export type OutboundLinkId =
  | 'uniswap'
  | 'axiomZero'
  | 'chaosZero'
  | 'geckoTerminal'
  | 'x'
  | 'discord'
  | 'github'
  | 'protocolGuild';

export interface OutboundLink {
  /** Copy lives at `nav.outbound.<id>`. */
  readonly id: OutboundLinkId;
  readonly href: string;
  readonly group: OutboundGroupId;
}

export const OUTBOUND_LINKS: readonly OutboundLink[] = [
  { id: 'uniswap', href: CST_UNISWAP_SWAP_URL, group: 'ecosystem' },
  { id: 'axiomZero', href: COSMIC_SIGNATURE_MARKETPLACE_URL, group: 'ecosystem' },
  { id: 'chaosZero', href: CHAOS_ZERO_PREDICTIONS_URL, group: 'ecosystem' },
  { id: 'geckoTerminal', href: CST_GECKOTERMINAL_POOL_URL, group: 'ecosystem' },
  { id: 'x', href: 'https://x.com/CosmicSignature', group: 'community' },
  { id: 'discord', href: 'https://discord.gg/bGnPn96Qwt', group: 'community' },
  { id: 'github', href: 'https://github.com/PredictionExplorer', group: 'community' },
  { id: 'protocolGuild', href: 'https://protocol-guild.readthedocs.io', group: 'community' },
];

export function outboundLinks(group: OutboundGroupId): readonly OutboundLink[] {
  return OUTBOUND_LINKS.filter((link) => link.group === group);
}

// ---------------------------------------------------------------------------
// Link resolution across the two hosts.

/**
 * How a link behaves: `internal` links stay in the current host's router,
 * `crossHost` links go to the other Cosmic Signature host in the same tab,
 * and `external` links open third-party sites in a new tab with an arrow.
 */
export type SiteLinkKind = 'internal' | 'crossHost' | 'external';

export interface ResolvedSiteHref {
  readonly href: string;
  readonly kind: SiteLinkKind;
  /** The destination host of a cross-host link ("cosmicsignature.com"). */
  readonly hostLabel?: string;
}

export const SITE_ORIGINS: Record<SiteHost, string> = {
  app: APP_ORIGIN,
  landing: LANDING_ORIGIN,
};

/** The display name of a host, read from its origin ("app.cosmicsignature.com"). */
export function siteHostLabel(host: SiteHost): string {
  return new URL(SITE_ORIGINS[host]).hostname;
}

/**
 * Resolves a destination for a page on `currentHost`. Same-host routes
 * return the locale-free path for the locale-aware `Link`; routes on the
 * other host return an absolute, locale-prefixed URL.
 */
export function resolveRouteHref(
  target: SiteRoute,
  currentHost: SiteHost,
  locale: string,
  hash?: string,
): ResolvedSiteHref {
  const suffix = hash ? `#${hash}` : '';
  if (target.host === currentHost) {
    return { href: `${target.path}${suffix}`, kind: 'internal' };
  }
  return {
    href: `${localeHref(SITE_ORIGINS[target.host], target.path, locale)}${suffix}`,
    kind: 'crossHost',
    hostLabel: siteHostLabel(target.host),
  };
}

/**
 * Classifies an arbitrary href: root-relative and in-page links are
 * internal, links to either Cosmic Signature origin are cross-host (or
 * internal on their own host), and everything else is external.
 */
export function classifyHref(href: string, currentHost: SiteHost): SiteLinkKind {
  if (!/^https?:\/\//i.test(href)) return 'internal';
  for (const host of ['app', 'landing'] as const) {
    const origin = SITE_ORIGINS[host];
    if (href === origin || href.startsWith(`${origin}/`) || href.startsWith(`${origin}#`)) {
      return host === currentHost ? 'internal' : 'crossHost';
    }
  }
  return 'external';
}

// ---------------------------------------------------------------------------
// Surfaces.

/** Sections the footers render as columns, in order. */
export const FOOTER_SECTIONS: readonly SiteSectionId[] = [
  'participate',
  'collection',
  'explore',
  'records',
  'learn',
  'trust',
];

/** The routes a footer column lists. */
export function footerRoutes(section: SiteSectionId): readonly SiteRoute[] {
  return routesInSection(section).filter((entry) => entry.footer);
}

/** The bottom legal row of both footers. */
export const LEGAL_ROUTE_IDS: readonly SiteRouteId[] = ['terms', 'privacy', 'riskDisclosures'];

/**
 * One entry of a header panel: a destination, or a sibling group shown as
 * one row that links to its first route.
 */
export type HeaderPanelEntry =
  | { readonly kind: 'route'; readonly id: SiteRouteId }
  | { readonly kind: 'group'; readonly id: SiteRouteGroupId };

export interface HeaderLinkItem {
  readonly kind: 'link';
  readonly route: SiteRouteId;
  /** Sections this item stands for: it is marked current inside any of them. */
  readonly sections: readonly SiteSectionId[];
}

export interface HeaderPanelItem {
  readonly kind: 'panel';
  /** Label key: `nav.menus.<id>`. */
  readonly id: 'explore' | 'learn';
  readonly sections: readonly SiteSectionId[];
  /** The panel's lead column: large rows with descriptions. */
  readonly primary: readonly HeaderPanelEntry[];
  /** The second column, headed by its section's title. */
  readonly secondary: {
    readonly section: SiteSectionId;
    readonly entries: readonly HeaderPanelEntry[];
  };
}

export type HeaderNavItem = HeaderLinkItem | HeaderPanelItem;

const entry = (id: SiteRouteId): HeaderPanelEntry => ({ kind: 'route', id });

/**
 * The app header. The Observatory comes first; the Explore and Learn panels
 * cover the remaining sections; the account section lives in the wallet menu.
 */
export const APP_HEADER_NAV: readonly HeaderNavItem[] = [
  { kind: 'link', route: 'observatory', sections: ['participate'] },
  { kind: 'link', route: 'gallery', sections: ['collection'] },
  {
    kind: 'panel',
    id: 'explore',
    sections: ['explore', 'records'],
    primary: [entry('currentCycle'), entry('statistics')],
    secondary: {
      section: 'records',
      entries: [
        entry('allocationRecipients'),
        entry('anchorDistributions'),
        entry('outreachAllocations'),
        { kind: 'group', id: 'publicGoods' },
        entry('ethContributions'),
        entry('coordinationChanges'),
      ],
    },
  },
  {
    kind: 'panel',
    id: 'learn',
    sections: ['learn', 'trust'],
    primary: [
      entry('howItWorks'),
      entry('faq'),
      entry('learnHub'),
      entry('whitePaper'),
      entry('quiz'),
      entry('about'),
    ],
    secondary: {
      section: 'trust',
      entries: [
        entry('security'),
        entry('audits'),
        entry('contracts'),
        entry('sourceCode'),
        entry('riskDisclosures'),
      ],
    },
  },
];

/** The Statistics sections, linked as chips under Statistics in the Explore panel. */
export const STATISTICS_SECTION_ROUTE_IDS: readonly SiteRouteId[] = SITE_ROUTES.filter(
  (candidate) => candidate.parent === 'statistics',
).map((candidate) => candidate.id);

/** Every route the app header links to, for the crawl-path guard. */
export function appHeaderRouteIds(): readonly SiteRouteId[] {
  const ids = new Set<SiteRouteId>();
  const add = (panelEntry: HeaderPanelEntry) => {
    if (panelEntry.kind === 'route') ids.add(panelEntry.id);
    else SITE_ROUTE_GROUPS[panelEntry.id].forEach((id) => ids.add(id));
  };
  for (const item of APP_HEADER_NAV) {
    if (item.kind === 'link') ids.add(item.route);
    else {
      item.primary.forEach(add);
      item.secondary.entries.forEach(add);
    }
  }
  STATISTICS_SECTION_ROUTE_IDS.forEach((id) => ids.add(id));
  return [...ids];
}

/** The account pages, in the order the wallet menu and drawer list them. */
export const ACCOUNT_ROUTE_IDS: readonly SiteRouteId[] = routesInSection('account').map(
  (candidate) => candidate.id,
);

export interface LandingHeaderLink {
  readonly id: SiteRouteId;
  /**
   * Use the compact name (`nav.routes.<id>.short`): next to the wordmark,
   * "About" says what "About Cosmic Signature" says, in a third of the room.
   */
  readonly short?: true;
}

/** The landing header's page links, after the home page's section anchors. */
export const LANDING_HEADER_LINKS: readonly LandingHeaderLink[] = [
  { id: 'learnHub' },
  { id: 'whitePaper' },
  { id: 'about', short: true },
];

/** The landing home's in-page sections, linked from the landing header in page order. */
export const LANDING_SECTION_ANCHORS = ['art', 'cycle', 'tracks'] as const;
export type LandingSectionAnchor = (typeof LANDING_SECTION_ANCHORS)[number];

/** Suggestions on both 404 pages, after its Observatory and Gallery buttons. */
export const NOT_FOUND_ROUTE_IDS: readonly SiteRouteId[] = [
  'currentCycle',
  'statistics',
  'allocationRecipients',
  'howItWorks',
  'faq',
  'siteMap',
];
