import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../QuerySeed';

import AllocationInfoPage from './AllocationInfoPage';
import { readCycleRecord } from './cycleRecordReads';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const cycleId = parseCanonicalNonNegativeSafeInteger(id);
  if (cycleId === null) notFound();

  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('allocationInfo.titleFor', { id: cycleId }),
    t('allocationInfo.descriptionFor', { id: cycleId }),
    undefined,
    `/allocation/${id}`,
    { locale },
  );
}

/**
 * No cycle renders at build time: each record renders on its first visit and
 * is then served from the cache. A finalized cycle's record never changes,
 * so its render keeps a day (`CACHE_WINDOW.final`); the newest one keeps
 * five minutes (its pager gains the next cycle when that finalizes), and a
 * cycle with no record yet, or a failed read, a minute (`readCycleRecord`).
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

/**
 * A finalized cycle's record. The server reads the record, the cycle list and
 * the recipients' Signature seeds, so the page's first HTML is the record
 * itself (the most linked page of the product: every ledger row, Signature
 * card and finalized page leads here), not a header over skeletons.
 */
export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  const cycleId = parseCanonicalNonNegativeSafeInteger(id);
  if (cycleId === null) notFound();

  setRequestLocale(locale);
  const { seeds, roleSeeds, cacheWindow } = await readCycleRecord(cycleId);
  await capCacheWindow(cacheWindow);
  return (
    <PageMessages
      namespaces={[
        'allocation',
        'contracts',
        'detail',
        'glossary',
        'marketing',
        'tables',
        'traits',
      ]}
    >
      <QuerySeed seeds={seeds}>
        <AllocationInfoPage roundNum={cycleId} roleSeeds={roleSeeds} />
      </QuerySeed>
    </PageMessages>
  );
}
