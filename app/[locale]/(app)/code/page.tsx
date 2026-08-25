import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { CodeSeoSummary } from './CodeSeoSummary';
import CodeViewer from './CodeViewer';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('code.title'), t('code.description'), undefined, '/code', { locale });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, code] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'code' }),
  ]);
  const description = meta('code.description');
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
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
                {
                  name: locale === 'zh' ? '首页' : 'Home',
                  path: '/',
                },
                { name: locale === 'zh' ? '源代码' : 'Source Code', path: '/code' },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <CodeSeoSummary />
        <CodeViewer />
      </>
    </PageMessages>
  );
}
