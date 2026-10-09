import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../QuerySeed';

import { ContributionNotFound } from './ContributionNotFound';
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

/**
 * No record renders at build time: each renders on its first visit and is
 * then served from the cache. A contribution never changes once indexed, so
 * its render keeps a day (`CACHE_WINDOW.final`); a record not indexed yet, or
 * a render whose read failed, keeps a minute.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const recordId = Number(id);
  // The record's server read: a found record is in the HTML, and a failed read leaves the
  // record to the client. A missing record is the record's not-found state, rendered here on
  // the server and kept a minute, since the record may be indexed a moment from now.
  const read = await readContribution(recordId);
  if (read.status === 'missing') {
    await capCacheWindow('pending');
    return <ContributionNotFound locale={locale} id={recordId} />;
  }
  if (read.status === 'unknown') await capCacheWindow('pending');
  return (
    <PageMessages namespaces={['ethContribution', 'tables']}>
      <QuerySeed seeds={contributionSeeds(recordId, read)}>
        <EthDonationDetailPage id={recordId} />
      </QuerySeed>
    </PageMessages>
  );
}
