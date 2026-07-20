import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';

import EthDonationByRoundPage from './EthDonationByRoundPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string }>;
}): Promise<Metadata> {
  const { locale, round } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
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
  return <EthDonationByRoundPage round={Number(round)} />;
}
