import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAllFaqItems, getFaqContent } from '@/content/faq';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { createMetadata } from '@/utils/seo';
import { JsonLd, faqPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { PageMessages } from '@/components/i18n/PageMessages';

import FAQPage from './FAQPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('faq.title'), t('faq.description'), undefined, '/faq', { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getFaqContent(locale);
  const allItems = getAllFaqItems(content);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
  const [common, faq] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'faq' }),
  ]);

  return (
    <PageMessages namespaces={['faq']}>
      <>
        <JsonLd data={faqPageJsonLd(allItems, inLanguage)} />
        <JsonLd
          data={breadcrumbJsonLd(
            [
              { name: common('breadcrumbs.home'), path: '/' },
              { name: faq('hero.titleHighlight'), path: '/faq' },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          )}
        />
        <FAQPage content={content} />
      </>
    </PageMessages>
  );
}
