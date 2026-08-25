import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QUIZ_PATH, getQuizContent } from '@/content/quiz';

import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
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
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
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

      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">{hub.eyebrow}</p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {hub.h1}
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{hub.intro}</p>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <Link
            key={tier.id}
            href={`${QUIZ_PATH}/${tier.id}`}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white">{tier.title}</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
              {hub.questionCountTemplate.replace('{count}', String(tier.questions.length))}
            </p>
            <p className="mt-3 flex-1 text-sm leading-6 text-white/68">{tier.tagline}</p>
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
