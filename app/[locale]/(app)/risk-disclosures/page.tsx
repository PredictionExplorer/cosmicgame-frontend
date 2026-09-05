import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getRiskCopy } from '@/content/legal';
import { TrustPageContent } from '@/content/legal/TrustPageContent';

import { PageShell } from '@/components/ui/page-shell';
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
    <PageShell variant="form">
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
      <TrustPageContent copy={getRiskCopy(locale)} locale={locale} />
    </PageShell>
  );
}
