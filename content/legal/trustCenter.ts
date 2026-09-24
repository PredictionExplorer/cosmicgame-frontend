/**
 * The Trust Center: the five trust and legal pages, which share one template —
 * the reading header (display-md H1, the Trust Center eyebrow, the document
 * date, these pages as tabs), then sections under `LegalSectionHeading`.
 */
export const TRUST_CENTER_PAGES = [
  { id: 'security', href: '/security' },
  { id: 'audits', href: '/audits' },
  { id: 'risk', href: '/risk-disclosures' },
  { id: 'terms', href: '/terms' },
  { id: 'privacy', href: '/privacy' },
] as const;

export type TrustCenterPage = (typeof TRUST_CENTER_PAGES)[number]['id'];

export interface TrustDocumentDate {
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  /** `updated`: the text changed that day. `reviewed`: someone checked it that day. */
  kind: 'reviewed' | 'updated';
}

/**
 * The dates the documents themselves state: when the terms and the privacy
 * policy last changed, and when the audit status was last reviewed. Security
 * and the risk disclosures state no date, so their headers show none rather
 * than an invented one.
 */
export const TRUST_DOCUMENT_DATES: Partial<Record<TrustCenterPage, TrustDocumentDate>> = {
  audits: { date: '2026-08-24', kind: 'reviewed' },
  terms: { date: '2026-07-20', kind: 'updated' },
  privacy: { date: '2026-07-20', kind: 'updated' },
};
