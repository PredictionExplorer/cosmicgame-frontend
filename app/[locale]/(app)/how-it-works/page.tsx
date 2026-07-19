import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { getHowItWorksContent } from '@/content/how-it-works';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import HowToPlayPage from './HowToPlayPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getHowItWorksContent(locale);

  return createMetadata(metadata.title, metadata.description, undefined, metadata.path, {
    locale,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getHowItWorksContent(locale);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: content.jsonLd.name,
            description: content.jsonLd.description,
            url: localeHref(APP_ORIGIN, content.metadata.path, locale),
            inLanguage,
          }),
          breadcrumbJsonLd(
            [
              { name: content.breadcrumbs.homeLabel, path: '/' },
              { name: content.breadcrumbs.pageLabel, path: content.metadata.path },
            ],
            localeHref(APP_ORIGIN, '/', locale),
            inLanguage,
          ),
        ]}
      />
      <HowToPlayPage content={content} />
    </>
  );
}
