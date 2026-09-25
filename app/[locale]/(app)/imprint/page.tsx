import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { readRandomWalkImprinted } from '../publicDataReads';

import { IMPRINT_HEADER_CLASS } from './heroClasses';
import Imprint from './Imprint';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(parent, t('mint.title'), t('mint.description'), undefined, '/imprint', {
    locale,
  });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The header reads the same count (React cache), and the hero's plate shows its newest token.
  const [meta, imprint, imprinted] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'imprint' }),
    readRandomWalkImprinted(),
  ]);
  const description = meta('mint.description');
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/imprint', locale);

  return (
    <PageMessages namespaces={['imprint', 'detail', 'tables']}>
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
        <Imprint
          seoSummary={
            <PublicDataRouteSeoSummary route="imprint" className={IMPRINT_HEADER_CLASS} />
          }
          latestSeed={imprinted.data}
        />
      </>
    </PageMessages>
  );
}
