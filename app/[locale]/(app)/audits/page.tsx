import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAuditsCopy } from '@/content/legal';
import { getLegalDocumentLabels } from '@/content/legal/labels';
import { AuditsContent } from '@/content/legal/AuditsContent';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';

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
    t('audits.title'),
    t('audits.description'),
    undefined,
    '/audits',
    { locale },
  );
}

export default async function AuditsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, legal, labels] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'legal' }),
    getLegalDocumentLabels(locale),
  ]);
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/audits', locale);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: t('audits.title'),
            description: t('audits.description'),
            url: pageUrl,
            inLanguage,
          }),
          breadcrumbJsonLd(
            [
              {
                name: legal('breadcrumbs.home'),
                path: '/',
              },
              {
                name: legal('breadcrumbs.audits'),
                path: '/audits',
              },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          ),
        ]}
      />
      <AuditsContent copy={getAuditsCopy(locale)} locale={locale} labels={labels} />
    </>
  );
}
