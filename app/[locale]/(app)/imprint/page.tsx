import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import Imprint from './Imprint';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('mint.title'), t('mint.description'), undefined, '/imprint', { locale });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, imprint] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'imprint' }),
  ]);
  const description = meta('mint.description');
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/imprint', locale);

  return (
    <PageMessages namespaces={['imprint']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: imprint('seo.heading'),
              description,
              url: pageUrl,
              inLanguage,
            }),
            breadcrumbJsonLd(
              [
                { name: imprint('breadcrumbs.home'), path: '/' },
                { name: imprint('breadcrumbs.imprint'), path: '/imprint' },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <PublicDataRouteSeoSummary route="imprint" />
        <Imprint />
      </>
    </PageMessages>
  );
}
