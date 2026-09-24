/**
 * The site's sections, for page wayfinding.
 *
 * Every app page belongs to one section. `PageHeader` names it above the H1 —
 * as the eyebrow on a top-level page, as the first crumb after Home on a
 * record page — and links it to the section's hub, so every page is one click
 * from the place it belongs to. Labels live in `common.pageHeader.sections`
 * (loaded on every app page with the chrome catalog).
 *
 * The groups follow the audit's taxonomy (Participate, Collection, Records,
 * Insights, Trust Center, Help, account); the header menus and the site map
 * can adopt the same ids.
 */
export const PAGE_SECTIONS = {
  /** The Observatory and the pages where a participant acts: current cycle, imprint, contributions. */
  participate: { hub: '/' },
  /** The artwork: gallery, named, attached and used NFTs. */
  collection: { hub: '/gallery' },
  /** Public ledgers: allocations, anchoring, outreach, Public Goods, coordination, record detail pages. */
  records: { hub: '/site-map' },
  /** The statistics hub and its section pages, participant profiles. */
  insights: { hub: '/statistics' },
  /** Security, audits, risk disclosures, contracts, source code, terms and privacy. */
  trust: { hub: '/security' },
  /** How it works and the FAQ. */
  help: { hub: '/how-it-works' },
  /** Pages about the connected wallet. */
  account: { hub: '/my-statistics' },
  /** Operator tools. */
  admin: { hub: '/admin' },
} as const satisfies Record<string, { readonly hub: string }>;

export type PageSectionId = keyof typeof PAGE_SECTIONS;

/** The hub route of a section. */
export function sectionHub(section: PageSectionId): string {
  return PAGE_SECTIONS[section].hub;
}
