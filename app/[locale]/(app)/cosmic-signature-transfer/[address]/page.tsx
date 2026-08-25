import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import CosmicSignatureTransfersPage from './CosmicSignatureTransfersPage';

interface PageProps {
  params: Promise<{ locale: string; address: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, address } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('cosmicSignatureTransfers.title'),
    t('cosmicSignatureTransfers.description'),
    undefined,
    `/cosmic-signature-transfer/${address}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, address } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['marketing', 'myPages', 'tables']}>
      <CosmicSignatureTransfersPage address={address} />
    </PageMessages>
  );
}
