import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import EmbedEnduranceChart from './EmbedEnduranceChart';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}): Promise<Metadata> {
  const { locale, round } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const metadata = createMetadata(
    t('embedEndurance.title'),
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
    <PageMessages namespaces={['statistics']}>
      <EmbedEnduranceChart roundNum={parseInt(round, 10)} />
    </PageMessages>
  );
}
