import { getTranslations } from 'next-intl/server';

import { PageHeaderTabs } from '@/components/layout/PageHeader';

import { TRUST_CENTER_PAGES, type TrustCenterPage } from './trustCenter';

/**
 * The Trust Center pages as `PageHeader` tabs, labelled from the `legal`
 * catalog on the server (the client legal pages do not load that catalog).
 */
export async function TrustCenterTabs({
  current,
  locale,
}: {
  current: TrustCenterPage;
  locale: string;
}) {
  const [legal, common] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  return (
    <PageHeaderTabs
      label={common('pageHeader.sections.trust')}
      items={TRUST_CENTER_PAGES.map(({ id, href }) => ({
        href,
        label: legal(`breadcrumbs.${id}`),
        current: id === current,
      }))}
    />
  );
}
