import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import EmbedEnduranceChart from './EmbedEnduranceChart';

/** The cycle in the URL, or -1 when it is not a cycle number. */
function parseCycle(round: string): number {
  return /^\d+$/.test(round) ? Number(round) : -1;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}): Promise<Metadata> {
  const { locale, round } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tStatistics = await getTranslations({ locale, namespace: 'statistics' });
  const cycle = parseCycle(round);
  // The tab names the chart and its cycle, as the page's H1 does.
  const title = cycle >= 0 ? tStatistics('embed.title', { cycle }) : t('embedEndurance.title');
  const metadata = createMetadata(
    title,
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
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['statistics', 'tables']}>
      <EmbedEnduranceChart roundNum={parseCycle(round)} />
    </PageMessages>
  );
}
