import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readRoundList } from '../publicDataReads';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { QuerySeed } from '../QuerySeed';

import AllocationFinalizedPage from './AllocationFinalizedPage';
import { readFinalizedCycleSeeds } from './finalizedReads';
import { parseFinalizedSearch, type FinalizedSearchParams } from './finalizedSearch';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<FinalizedSearchParams>;
}

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const { cycle } = parseFinalizedSearch(await searchParams);
  if (cycle !== null) {
    // A cycle's record is titled like its H1 ("Cycle 1 Signature Allocation"); every record
    // names the index as its canonical page, since the index leads to all of them.
    const t = await getTranslations({ locale, namespace: 'allocation' });
    return createPageMetadata(
      parent,
      t('finalized.result.title', { cycle }),
      t('finalized.result.lede'),
      undefined,
      '/allocation-finalized',
      { locale },
    );
  }
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('allocationRetrieved.title'),
    t('allocationRetrieved.description'),
    undefined,
    '/allocation-finalized',
    { locale },
  );
}

/**
 * The query decides the page (one cycle's record, or the index of the latest cycles), so the
 * server reads it and renders the right shell with its data. The first HTML is the page itself,
 * not a header over an empty body that the client fills, and shifts, after hydration. Reading
 * the query makes the route dynamic, so its reads are shared across requests (a minute for the
 * lists, five for a finalized record), never made again for every visit.
 */
export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { cycle, isClaimSuccess } = parseFinalizedSearch(await searchParams);

  if (cycle === null) {
    // The index: the latest cycles (the list /allocation reads), each drawn from the seed of
    // the Signature it imprinted, which its record carries.
    const rounds = await readRoundList();
    return (
      <PageMessages namespaces={['allocation', 'detail', 'tables', 'traits']}>
        <QuerySeed seeds={[{ queryKey: ['roundList'], data: rounds.data, at: rounds.at }]}>
          <AllocationFinalizedPage
            cycle={null}
            isClaimSuccess={false}
            seoSummary={<PublicDataRouteSeoSummary route="allocation-finalized" />}
          />
        </QuerySeed>
      </PageMessages>
    );
  }

  return (
    <PageMessages namespaces={['allocation', 'detail', 'tables', 'traits']}>
      <QuerySeed seeds={await readFinalizedCycleSeeds(cycle)}>
        <AllocationFinalizedPage cycle={cycle} isClaimSuccess={isClaimSuccess} />
      </QuerySeed>
    </PageMessages>
  );
}
