import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { CodeSeoSummary } from './CodeSeoSummary';
import CodeViewer from './CodeViewer';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(parent, t('code.title'), t('code.description'), undefined, '/code', {
    locale,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, code] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'code' }),
  ]);
  const description = meta('code.description');
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(APP_ORIGIN, '/code', locale);

  return (
    <PageMessages namespaces={['code']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: code('seo.heading'),
              description,
              url: pageUrl,
              inLanguage,
            }),
            breadcrumbJsonLd(
              [
                { name: code('breadcrumbs.home'), path: '/' },
                { name: code('breadcrumbs.code'), path: '/code' },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <CodeViewer seoSummary={<CodeSeoSummary />} />
      </>
    </PageMessages>
  );
}
