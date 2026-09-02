import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAboutContent } from '@/content/about';

import { LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getAboutContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(t('about.title'), t('about.description'), undefined, metadata.path, {
    canonicalHost: 'landing',
    locale,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getAboutContent(locale);
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, content.metadata.path, locale);
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: content.jsonLd.name,
    url: pageUrl,
    description: content.jsonLd.description,
    inLanguage,
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
  };

  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-4xl px-6 py-24 lg:py-32">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: content.breadcrumbLabel, path: content.metadata.path },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          aboutJsonLd,
        ]}
      />
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">
        {content.eyebrow}
      </p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {content.heading}
      </h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-white/76">
        {content.body.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>{content.body.denial}</p>
      </div>

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">{content.officialResources.heading}</h2>
        <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {content.officialResources.links.map((link) => (
            <li key={link.id}>
              <a
                href={localizeCrossHostHref(link.href, locale)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
