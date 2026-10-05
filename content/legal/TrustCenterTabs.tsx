import { useTranslations } from 'next-intl';

import { PageHeaderTabs } from '@/components/layout/PageHeader';

import { TRUST_CENTER_TABS, type TrustCenterTab } from './trustCenter';

/**
 * The Trust Center pages as `PageHeader` tabs: the documents, the contracts
 * and the source code. The labels come from the page's server read of the
 * `legal` catalog (`getLegalDocumentLabels`, or `getTrustCenterTabLabels`).
 */
export function TrustCenterTabs({
  current,
  labels,
}: {
  current: TrustCenterTab;
  labels: Readonly<Record<TrustCenterTab, string>>;
}) {
  const nav = useTranslations('nav');
  return (
    <PageHeaderTabs
      label={nav('sections.trust')}
      items={TRUST_CENTER_TABS.map(({ id, href }) => ({
        href,
        label: labels[id],
        current: id === current,
      }))}
    />
  );
}
