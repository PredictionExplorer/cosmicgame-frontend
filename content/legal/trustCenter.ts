/**
 * The Trust Center: the five trust and legal pages, which share one template
 * (components/legal/LegalDocument) — the reading header (display-md H1, the
 * Trust Center eyebrow, the document date, these pages as tabs), then the
 * sections with their contents rail.
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
 * The dates the documents state, once for every locale: when the text of the
 * terms, the privacy policy, the security page and the risk disclosures last
 * changed, and when the audit status was last reviewed. Change a date in the
 * same commit as the text it dates.
 */
export const TRUST_DOCUMENT_DATES: Record<TrustCenterPage, TrustDocumentDate> = {
  security: { date: '2026-09-24', kind: 'updated' },
  audits: { date: '2026-09-24', kind: 'updated' },
  risk: { date: '2026-09-24', kind: 'updated' },
  terms: { date: '2026-09-24', kind: 'updated' },
  privacy: { date: '2026-09-24', kind: 'updated' },
};

/** The copy module each document is written in, one file per locale. */
const TRUST_DOCUMENT_MODULES: Record<TrustCenterPage, string> = {
  security: 'SecurityContent',
  audits: 'AuditsContent',
  risk: 'RiskContent',
  terms: 'TermsContent',
  privacy: 'PrivacyContent',
};

/**
 * A document's source in the public frontend repository, in the reader's
 * language (`content/legal/TermsContent.ko.ts`); its commit history is the
 * document's revision history ("Revision history on GitHub ↗").
 */
export function trustDocumentSource(page: TrustCenterPage, locale: string): string {
  return `content/legal/${TRUST_DOCUMENT_MODULES[page]}.${locale}.ts`;
}
