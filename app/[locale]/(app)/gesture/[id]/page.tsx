import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import GesturePage from './GesturePage';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('gestureDetail.title'),
    t('gestureDetail.description'),
    undefined,
    `/gesture/${id}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['detail', 'gesture']}>
      <GesturePage gestureId={parseInt(id, 10)} />
    </PageMessages>
  );
}
