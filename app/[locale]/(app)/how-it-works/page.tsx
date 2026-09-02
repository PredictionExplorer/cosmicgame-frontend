import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getHowItWorksContent } from '@/content/how-it-works';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import HowToPlayPage from './HowToPlayPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getHowItWorksContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(
    t('howItWorks.title'),
    t('howItWorks.description'),
    undefined,
    metadata.path,
    {
      locale,
    },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getHowItWorksContent(locale);
  const inLanguage = jsonLdInLanguage(locale);

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
          ),
        ]}
      />
      <HowToPlayPage content={content} />
    </>
  );
}
