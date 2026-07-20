import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';

import RewardsByTokenPage from './RewardsByTokenPage';

interface PageProps {
  params: Promise<{ locale: string; address: string; tokenId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, address, tokenId } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('distributionsByToken.title'),
    t('distributionsByToken.description'),
    undefined,
    `/distributions-by-token/${address}/${tokenId}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, address, tokenId } = await params;
  setRequestLocale(locale);
  return <RewardsByTokenPage address={address} tokenId={Number(tokenId)} />;
}
