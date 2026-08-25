import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import MyWinnings from './MyWinnings';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('myAllocations.title'),
    t('myAllocations.description'),
    undefined,
    '/my-allocations',
    { index: false, locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['anchoring', 'detail', 'myPages', 'tables']}>
      <MyWinnings />
    </PageMessages>
  );
}
