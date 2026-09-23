import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import RewardsByTokenPage from './RewardsByTokenPage';

interface PageProps {
  params: Promise<{ locale: string; address: string; tokenId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, address, tokenId } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
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
  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <RewardsByTokenPage address={address} tokenId={Number(tokenId)} />
    </PageMessages>
  );
}
