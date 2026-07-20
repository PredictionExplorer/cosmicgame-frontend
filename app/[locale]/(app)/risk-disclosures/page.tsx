import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { RiskContentEn } from '@/content/legal/RiskContent.en';
import { RiskContentZh } from '@/content/legal/RiskContent.zh';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('riskDisclosures.title'),
    t('riskDisclosures.description'),
    undefined,
    '/risk-disclosures',
    {
      locale,
    },
  );
}

export default async function RiskDisclosuresPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const legal = await getTranslations({ locale, namespace: 'legal' });

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            {
              name: legal('breadcrumbs.home'),
              path: '/',
            },
            {
              name: legal('breadcrumbs.risk'),
              path: '/risk-disclosures',
            },
          ],
          localeHref(APP_ORIGIN, '/', locale),
        )}
      />
      {locale === 'zh' ? <RiskContentZh locale={locale} /> : <RiskContentEn locale={locale} />}
    </main>
  );
}
