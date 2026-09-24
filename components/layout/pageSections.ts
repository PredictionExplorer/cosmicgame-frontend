/**
 * The site's sections, for page wayfinding.
 *
 * Every app page belongs to one section. `PageHeader` names it above the H1 —
 * as the eyebrow on a top-level page, as the first crumb after Home on a
 * record page — and links it to the section's hub when the section has one,
 * so every page is one click from the place it belongs to. Labels live in
 * `common.pageHeader.sections` (loaded on every app page with the chrome
 * catalog).
 *
 * The ids, labels and page assignments match the navigation taxonomy
 * (`config/siteNav.ts` on the navigation branch: participate, collection,
 * explore, records, learn, trust, account), so the header, the menus and the
 * site map name a page's section the same way. `admin` is the operator
 * tools, which the public navigation does not list.
 */
export const PAGE_SECTIONS = {
  /** The Observatory and the pages where a participant acts: imprint. */
  participate: { hub: '/' },
  /** The artwork: gallery, named, attached and used NFTs. */
  collection: { hub: '/gallery' },
  /**
   * The current cycle, the statistics hub and its section pages, participant
   * profiles, gestures, transfers.
   */
  explore: { hub: '/statistics' },
  /**
   * Public ledgers: allocations, anchoring, outreach, contributions, Public
   * Goods, coordination, and their record pages. No page lists every ledger,
   * so the section has no hub: its eyebrow is plain text and a record trail
   * goes straight to the ledger.
   */
  records: { hub: null },
  /** How it works and the FAQ. */
  learn: { hub: '/how-it-works' },
  /** Security, audits, risk disclosures, contracts, source code, terms and privacy. */
  trust: { hub: '/security' },
  /** Pages about the connected wallet. */
  account: { hub: '/my-statistics' },
  /** Operator tools. */
  admin: { hub: '/admin' },
} as const satisfies Record<string, { readonly hub: string | null }>;

export type PageSectionId = keyof typeof PAGE_SECTIONS;
