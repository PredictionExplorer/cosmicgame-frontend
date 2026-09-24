import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import EthDonationDetailPage from './EthDonationDetailPage';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tRecord = await getTranslations({ locale, namespace: 'ethContribution' });
  // The tab names the record, as its H1 does ("Contribution #7").
  const recordId = Number(id);
  const title =
    Number.isInteger(recordId) && recordId >= 0
      ? tRecord('detail.title', { id: recordId })
      : tRecord('detail.invalidId');
  return createPageMetadata(
    parent,
    title,
    t('ethContributionDetail.description'),
    undefined,
    `/eth-contribution/detail/${id}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['ethContribution', 'tables']}>
      <EthDonationDetailPage id={Number(id)} />
    </PageMessages>
  );
}
