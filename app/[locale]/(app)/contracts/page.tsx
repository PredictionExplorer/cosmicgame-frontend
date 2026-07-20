import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import Contracts from './Contracts';
import { ContractsSeoSummary } from './ContractsSeoSummary';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('contracts.title'), t('contracts.description'), undefined, '/contracts', {
    locale,
  });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, t] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'contracts' }),
  ]);
  const description = meta('contracts.description');
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
  const pageUrl = localeHref(APP_ORIGIN, '/contracts', locale);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: t('seo.heading'),
            description,
            url: pageUrl,
            inLanguage,
          }),
          breadcrumbJsonLd(
            [
              {
                name: locale === 'zh' ? '首页' : 'Home',
                path: '/',
              },
              { name: locale === 'zh' ? '合约' : 'Contracts', path: '/contracts' },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          ),
        ]}
      />
      <ContractsSeoSummary />
      <Contracts />
    </>
  );
}
