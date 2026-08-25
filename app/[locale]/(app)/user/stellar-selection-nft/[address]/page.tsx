import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import UserStellarSelectionNFTPage from './UserStellarSelectionNFTPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('userStellarSelectionNft.title'),
    t('userStellarSelectionNft.description'),
    undefined,
    `/user/stellar-selection-nft/${address}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['statistics', 'tables']}>
      <UserStellarSelectionNFTPage address={address} />
    </PageMessages>
  );
}
