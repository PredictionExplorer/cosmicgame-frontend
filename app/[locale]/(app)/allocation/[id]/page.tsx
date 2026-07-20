import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { parseCanonicalNonNegativeSafeInteger } from '@/utils';

import { createMetadata } from '@/utils/seo';

import AllocationInfoPage from './AllocationInfoPage';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const cycleId = parseCanonicalNonNegativeSafeInteger(id);
  if (cycleId === null) notFound();

  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('allocationInfo.titleFor', { id: cycleId }),
    t('allocationInfo.descriptionFor', { id: cycleId }),
    undefined,
    `/allocation/${id}`,
    { locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  const cycleId = parseCanonicalNonNegativeSafeInteger(id);
  if (cycleId === null) notFound();

  setRequestLocale(locale);
  return <AllocationInfoPage roundNum={cycleId} />;
}
