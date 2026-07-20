import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';

import AnchorActionDetailPage from './AnchorActionDetailPage';

interface PageProps {
  params: Promise<{ locale: string; IsRwalk: string; actionId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, IsRwalk, actionId } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('anchorAction.title'),
    t('anchorAction.description'),
    undefined,
    `/anchor-action/${IsRwalk}/${actionId}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, IsRwalk, actionId } = await params;
  setRequestLocale(locale);
  return <AnchorActionDetailPage IsRwalk={Number(IsRwalk)} actionId={Number(actionId)} />;
}
