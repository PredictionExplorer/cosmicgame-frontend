import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AuditsContentEn } from '@/content/legal/AuditsContent.en';
import { AuditsContentZh } from '@/content/legal/AuditsContent.zh';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('audits.title'), t('audits.description'), undefined, '/audits', {
    locale,
  });
}

export default async function AuditsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, legal] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'legal' }),
  ]);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
  const pageUrl = localeHref(APP_ORIGIN, '/audits', locale);

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <JsonLd
        data={[
          webPageJsonLd({
            name: locale === 'zh' ? 'Cosmic Signature 审计' : 'Cosmic Signature Audits',
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
      {locale === 'zh' ? <AuditsContentZh /> : <AuditsContentEn />}
    </main>
  );
}
