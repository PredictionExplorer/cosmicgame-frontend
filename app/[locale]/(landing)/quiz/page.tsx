import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLearnContent } from '@/content/learn';
import { QUIZ_PATH, getQuizContent } from '@/content/quiz';
import { WHITE_PAPER_PATH } from '@/content/white-paper';

import { PageHeader } from '@/components/layout/PageHeader';
import { DifficultyMeter } from '@/components/quiz/DifficultyMeter';
import { QuizTierStatus } from '@/components/quiz/QuizTierStatus';
import { RANK_BANDS, estimatedMinutes, fillTemplate } from '@/components/quiz/quizProgress';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { formatCount } from '@/utils/format/numbers';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  // The quiz has its own share card (./opengraph-image.tsx), which its tiers inherit.
  return createMetadata(t('quiz.title'), t('quiz.description'), undefined, QUIZ_PATH, {
    canonicalHost: 'landing',
    locale,
  });
}

export default async function QuizHubPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { hub, ui, tiers } = getQuizContent(locale);
  const learn = getLearnContent(locale);
  const firstGuide = learn.articles[0];
  const t = await getTranslations({ locale, namespace: 'meta' });
  const inLanguage = jsonLdInLanguage(locale);
  const rankNames = Object.fromEntries(
    RANK_BANDS.map(({ rank }) => [rank, ui.summary.ranks[rank].name]),
  ) as Record<(typeof RANK_BANDS)[number]['rank'], string>;

  return (
    <ReadingMain>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: hub.breadcrumbs.homeLabel, path: '/' },
              { name: learn.hub.breadcrumbs.learnLabel, path: '/learn' },
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

      <PageHeader
        variant="reading"
        breadcrumbs={[{ label: learn.hub.breadcrumbs.learnLabel, href: '/learn' }]}
        eyebrow={hub.eyebrow}
        title={hub.h1}
        subtitle={hub.intro}
      />

      <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
        {tiers.map((tier, index) => {
          const count = tier.questions.length;
          return (
            <li key={tier.id} className="min-w-0">
              <Link
                href={`${QUIZ_PATH}/${tier.id}`}
                className="group flex h-full flex-col rounded-surface border border-rule bg-surface p-6 transition-colors duration-fast hover:border-input hover:bg-surface-raised sm:p-7"
              >
                <span className="flex items-center justify-between gap-4">
                  <span aria-hidden className="type-label tabular-nums text-subtle">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <DifficultyMeter
                    level={index + 1}
                    max={tiers.length}
                    label={fillTemplate(hub.difficultyTemplate, {
                      level: index + 1,
                      max: tiers.length,
                    })}
                  />
                </span>
                <h2 className="mt-6 type-heading-2 text-foreground">{tier.title}</h2>
                <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 type-label tabular-nums text-subtle">
                  <span>
                    {fillTemplate(hub.questionCountTemplate, {
                      count: formatCount(count, locale),
                    })}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    {fillTemplate(hub.durationTemplate, { minutes: estimatedMinutes(count) })}
                  </span>
                </span>
                <span className="mt-4 flex-1 type-body-sm text-muted-foreground">
                  {tier.tagline}
                </span>
                <QuizTierStatus
                  tierId={tier.id}
                  total={count}
                  locale={locale}
                  bestTemplate={hub.bestTemplate}
                  inProgressTemplate={hub.inProgressTemplate}
                  startLabel={hub.startLabel}
                  resumeLabel={hub.resumeLabel}
                  rankNames={rankNames}
                />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Not ready for the questions yet: the way back into the reading path. */}
      <section
        aria-labelledby="quiz-start-here"
        className="mt-16 border-t border-rule pt-10 lg:mt-20"
      >
        <h2 id="quiz-start-here" className="type-heading-2 text-foreground">
          {learn.hub.groups.start.title}
        </h2>
        <p className="mt-3 max-w-[var(--measure-lede)] type-body-md text-muted-foreground">
          {learn.hub.groups.start.description}
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          {firstGuide ? (
            <li>
              <Link
                href={`/learn/${firstGuide.slug}`}
                className="link-quiet inline-flex min-h-11 items-center gap-1.5 type-body-md text-foreground"
              >
                {firstGuide.cardTitle}
                <ArrowRight aria-hidden className="size-4 text-subtle" />
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href={WHITE_PAPER_PATH}
              className="link-quiet inline-flex min-h-11 items-center gap-1.5 type-body-md text-foreground"
            >
              {learn.hub.whitePaper.readLabel}
              <ArrowRight aria-hidden className="size-4 text-subtle" />
            </Link>
          </li>
        </ul>
      </section>
    </ReadingMain>
  );
}
