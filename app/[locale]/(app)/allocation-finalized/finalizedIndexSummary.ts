/*
 * The finalized index's header, as data: its figures and its related pages,
 * each named by its key in the `seo` catalog (`publicData.routes.
 * allocation-finalized`). The server summary fills the figures in
 * (PublicDataRouteSeoSummary); the loading state draws the same header with
 * the figures still on their way (`FinalizedIndexLoadingHeader`).
 */

/** The header's figures, in order; `tooltip` when the label carries an explanation. */
export const FINALIZED_INDEX_FIGURES = [
  { key: 'records', tooltip: true },
  { key: 'eth', tooltip: true },
  { key: 'recipients', tooltip: false },
] as const;

/** The pages the index leads to. Every cycle is one click away in its own list ("All cycles"). */
export const FINALIZED_INDEX_LINKS = [
  { href: '/my-allocations', key: 'myAllocations' },
  { href: '/statistics', key: 'statistics' },
  { href: '/contracts', key: 'contracts' },
] as const;
