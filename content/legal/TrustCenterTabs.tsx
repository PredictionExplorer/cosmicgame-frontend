import { useTranslations } from 'next-intl';

import { PageHeaderTabs } from '@/components/layout/PageHeader';

import { TRUST_CENTER_PAGES, type TrustCenterPage } from './trustCenter';

/**
 * The Trust Center pages as `PageHeader` tabs. The labels come from the
 * page's server read of the `legal` catalog (`getLegalDocumentLabels`).
 */
export function TrustCenterTabs({
  current,
  labels,
}: {
  current: TrustCenterPage;
  labels: Readonly<Record<TrustCenterPage, string>>;
}) {
  const common = useTranslations('common');
  return (
    <PageHeaderTabs
      label={common('pageHeader.sections.trust')}
      items={TRUST_CENTER_PAGES.map(({ id, href }) => ({
        href,
        label: labels[id],
        current: id === current,
      }))}
    />
  );
}
