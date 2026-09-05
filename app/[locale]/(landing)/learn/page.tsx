import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(t('learn.title'), t('learn.description'), undefined, '/learn', {
    canonicalHost: 'landing',
    locale,
  });
}

export default async function LearnIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { hub, articles } = getLearnContent(locale);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-20"
    >
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: hub.breadcrumbs.homeLabel, path: '/' },
            { name: hub.breadcrumbs.learnLabel, path: '/learn' },
          ],
          localeHref(LANDING_ORIGIN, '/', locale),
        )}
      />
      <p className="type-eyebrow text-primary/80">{hub.eyebrow}</p>
      <h1 className="mt-4 type-display-lg text-balance text-foreground">{hub.h1}</h1>
      <p className="mt-6 max-w-3xl type-body-lg text-muted-foreground">{hub.intro}</p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/25 hover:bg-primary/[0.04] sm:p-8"
          >
            <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
              {article.h1}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{article.description}</p>
          </Link>
        ))}
      </div>

      <aside className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
          {hub.quizCta.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{hub.quizCta.body}</p>
        <Link
          href={hub.quizCta.href}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {hub.quizCta.linkLabel}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </aside>
    </main>
  );
}
