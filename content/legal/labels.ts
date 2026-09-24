import { getTranslations } from 'next-intl/server';

import { TRUST_CENTER_TABS, type TrustCenterTab } from './trustCenter';

/**
 * The Trust Center's own chrome strings (`legal` catalog), read on the server
 * by each page and passed down, so the pages ship no `legal` messages to the
 * client: the documents render on the server and their one client island
 * (the contents rail) takes plain strings.
 */
export interface LegalDocumentLabels {
  /** "On this page". */
  readonly contents: string;
  readonly backToTop: string;
  readonly backToContents: string;
  /** The heading anchor's name; `{section}` is the heading. */
  readonly sectionLink: string;
  readonly revisionHistory: string;
  /** The Trust Center tab labels; a document's is also its title. */
  readonly tabs: Readonly<Record<TrustCenterTab, string>>;
}

/** The Trust Center tab labels, for a Trust page that is not a document (contracts, code). */
export async function getTrustCenterTabLabels(
  locale: string,
): Promise<Readonly<Record<TrustCenterTab, string>>> {
  const t = await getTranslations({ locale, namespace: 'legal' });
  return Object.fromEntries(
    TRUST_CENTER_TABS.map(({ id }) => [id, t(`breadcrumbs.${id}`)]),
  ) as Record<TrustCenterTab, string>;
}

export async function getLegalDocumentLabels(locale: string): Promise<LegalDocumentLabels> {
  const t = await getTranslations({ locale, namespace: 'legal' });
  return {
    contents: t('document.contents'),
    backToTop: t('document.backToTop'),
    backToContents: t('document.backToContents'),
    sectionLink: t('document.sectionLink', { section: '{section}' }),
    revisionHistory: t('document.revisionHistory'),
    tabs: await getTrustCenterTabLabels(locale),
  };
}
