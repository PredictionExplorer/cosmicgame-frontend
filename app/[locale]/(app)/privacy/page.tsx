import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import PrivacyPage from './PrivacyPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('pagePrivacy.title'),
    t('pagePrivacy.description'),
    undefined,
    '/privacy',
    { locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const legal = await getTranslations({ locale, namespace: 'legal' });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            {
              name: legal('breadcrumbs.home'),
              path: '/',
            },
            {
              name: legal('breadcrumbs.privacy'),
              path: '/privacy',
            },
          ],
          localeHref(APP_ORIGIN, '/', locale),
        )}
      />
      <PrivacyPage locale={locale} />
    </>
  );
}
