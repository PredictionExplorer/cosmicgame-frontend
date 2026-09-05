import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { CurrentCycleSeoSummary } from './CurrentCycleSeoSummary';
import CurrentRoundPage from './CurrentRoundPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('currentCycleFull.title'),
    t('currentCycleFull.description'),
    undefined,
    '/current-cycle',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages
      namespaces={[
        'contracts',
        'currentCycle',
        'detail',
        'home',
        'marketing',
        'statistics',
        'tables',
      ]}
    >
      <CurrentRoundPage seoSummary={<CurrentCycleSeoSummary />} />
    </PageMessages>
  );
}
