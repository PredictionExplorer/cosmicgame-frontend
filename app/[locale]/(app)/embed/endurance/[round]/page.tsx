import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import EmbedEnduranceChart from './EmbedEnduranceChart';

/**
 * The cycle in the URL; anything but a canonical cycle number ("abc", "-1",
 * "01") is not a page. A cycle that has not opened yet is not one either,
 * which only the live dashboard knows: the chart decides that in the browser
 * rather than caching a 404 for a cycle that opens a minute later.
 */
function cycleOrNotFound(round: string): number {
  const cycle = parseCanonicalNonNegativeSafeInteger(round);
  if (cycle === null) notFound();
  return cycle;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}): Promise<Metadata> {
  const { locale, round } = await params;
  const cycle = cycleOrNotFound(round);
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tStatistics = await getTranslations({ locale, namespace: 'statistics' });
  const metadata = createMetadata(
    // The tab names the chart and its cycle, as the page's H1 does.
    tStatistics('embed.title', { cycle }),
    t('embedEndurance.description'),
    undefined,
    `/embed/endurance/${round}`,
    { index: false, locale },
  );

  return {
    ...metadata,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}) {
  const { locale, round } = await params;
  const cycle = cycleOrNotFound(round);
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['statistics', 'tables']}>
      <EmbedEnduranceChart roundNum={cycle} />
    </PageMessages>
  );
}
