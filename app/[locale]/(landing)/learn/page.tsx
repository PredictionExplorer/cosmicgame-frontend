import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { getLearnContent } from '@/content/learn';

import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { hub } = getLearnContent(locale);

  return createMetadata(hub.meta.title, hub.meta.description, undefined, '/learn', {
    canonicalHost: 'landing',
    locale,
  });
}

export default async function LearnIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { hub, articles } = getLearnContent(locale);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: hub.breadcrumbs.homeLabel, path: '/' },
            { name: hub.breadcrumbs.learnLabel, path: '/learn' },
          ],
          localeHref(LANDING_ORIGIN, '/', locale),
          inLanguage,
        )}
      />
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">{hub.eyebrow}</p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {hub.h1}
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{hub.intro}</p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white">{article.h1}</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">{article.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
