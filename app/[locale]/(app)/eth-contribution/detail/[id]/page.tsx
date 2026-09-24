import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../QuerySeed';

import EthDonationDetailPage from './EthDonationDetailPage';
import { contributionSeeds, readContribution } from './contributionRecord';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, id } = await params;
  const [t, tRecord, read] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'ethContribution' }),
    readContribution(Number(id)),
  ]);
  // The tab names the record, as its H1 does ("Contribution #7"), and says
  // so when the record does not exist, as the H1 then does.
  return createPageMetadata(
    parent,
    read.status === 'missing'
      ? tRecord('detail.notFoundHeading')
      : t('ethContributionDetail.title', { id }),
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
  const recordId = Number(id);
  // The record's server read: a found record is in the HTML, a missing one
  // opens on its not-found state, and a failed read leaves both to the client.
  const read = await readContribution(recordId);
  return (
    <PageMessages namespaces={['ethContribution', 'tables']}>
      <QuerySeed seeds={contributionSeeds(recordId, read)}>
        <EthDonationDetailPage id={recordId} knownMissing={read.status === 'missing'} />
      </QuerySeed>
    </PageMessages>
  );
}
