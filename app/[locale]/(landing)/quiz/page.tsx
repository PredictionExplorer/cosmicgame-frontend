import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QUIZ_PATH, getQuizContent } from '@/content/quiz';

import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(t('quiz.title'), t('quiz.description'), undefined, QUIZ_PATH, {
    canonicalHost: 'landing',
    locale,
  });
}

export default async function QuizHubPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { hub, tiers } = getQuizContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });
  const inLanguage = jsonLdInLanguage(locale);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-20"
    >
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: hub.breadcrumbs.homeLabel, path: '/' },
              { name: hub.breadcrumbs.quizLabel, path: QUIZ_PATH },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          webPageJsonLd({
            name: t('quiz.title'),
            description: t('quiz.description'),
            url: localeHref(LANDING_ORIGIN, QUIZ_PATH, locale),
            inLanguage,
          }),
        ]}
      />

      <p className="type-eyebrow text-primary/80">{hub.eyebrow}</p>
      <h1 className="mt-4 type-display-lg text-balance text-foreground">{hub.h1}</h1>
      <p className="mt-6 max-w-3xl type-body-lg text-muted-foreground">{hub.intro}</p>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <Link
            key={tier.id}
            href={`${QUIZ_PATH}/${tier.id}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/25 hover:bg-primary/[0.04] sm:p-8"
          >
            <h2 className="font-display text-xl font-medium tracking-tight text-foreground">
              {tier.title}
            </h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
              {hub.questionCountTemplate.replace('{count}', String(tier.questions.length))}
            </p>
            <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{tier.tagline}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {hub.startLabel}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
