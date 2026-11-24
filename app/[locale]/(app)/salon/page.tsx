import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import SalonPage from './SalonPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // Noindex while the salon ships with the V4 contracts: the page reads a
  // contract production does not have yet.
  return createPageMetadata(parent, t('salon.title'), t('salon.description'), undefined, '/salon', {
    index: false,
    locale,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageMessages namespaces={['salon', 'tables', 'traits', 'detail']}>
      <SalonPage />
    </PageMessages>
  );
}
