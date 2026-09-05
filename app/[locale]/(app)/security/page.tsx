import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSecurityCopy } from '@/content/legal';
import { TrustPageContent } from '@/content/legal/TrustPageContent';

import { PageShell } from '@/components/ui/page-shell';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('security.title'), t('security.description'), undefined, '/security', {
    locale,
  });
}

export default async function SecurityPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, legal] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'legal' }),
  ]);
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/security', locale);
  const copy = getSecurityCopy(locale);

  return (
    <PageShell variant="form">
      <JsonLd
        data={[
          webPageJsonLd({
            name: copy.title,
            description: t('security.description'),
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
                name: legal('breadcrumbs.security'),
                path: '/security',
              },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          ),
        ]}
      />
      <TrustPageContent copy={copy} locale={locale} />
    </PageShell>
  );
}
