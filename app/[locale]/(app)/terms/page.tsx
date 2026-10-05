import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLegalDocumentLabels } from '@/content/legal/labels';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';

import TermsPage from './TermsPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('pageTerms.title'),
    t('pageTerms.description'),
    undefined,
    '/terms',
    { locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [legal, labels] = await Promise.all([
    getTranslations({ locale, namespace: 'legal' }),
    getLegalDocumentLabels(locale),
  ]);

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
              name: legal('breadcrumbs.terms'),
              path: '/terms',
            },
          ],
          localeHref(APP_ORIGIN, '/', locale),
        )}
      />
      <TermsPage locale={locale} labels={labels} />
    </>
  );
}
