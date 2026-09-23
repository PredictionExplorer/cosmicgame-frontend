import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import Contracts from './Contracts';
import { ContractsSeoSummary } from './ContractsSeoSummary';

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
    t('contracts.title'),
    t('contracts.description'),
    undefined,
    '/contracts',
    { locale },
  );
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
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/contracts', locale);

  return (
    <PageMessages namespaces={['contracts', 'tables']}>
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
                { name: t('breadcrumbs.home'), path: '/' },
                { name: t('breadcrumbs.contracts'), path: '/contracts' },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <Contracts seoSummary={<ContractsSeoSummary />} />
      </>
    </PageMessages>
  );
}
