import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import EthDonationByRoundPage from './EthDonationByRoundPage';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; round: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, round } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('ethContributionByCycle.title'),
    t('ethContributionByCycle.description'),
    undefined,
    `/eth-contribution/round/${round}`,
    { index: false, locale },
  );
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
    <PageMessages namespaces={['ethContribution', 'tables']}>
      <EthDonationByRoundPage round={Number(round)} />
    </PageMessages>
  );
}
