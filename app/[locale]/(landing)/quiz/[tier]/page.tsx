import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  QUIZ_PATH,
  QUIZ_TIER_IDS,
  getQuizContent,
  isQuizTierId,
  type QuizRunnerUi,
} from '@/content/quiz';
import { getLearnContent } from '@/content/learn';

import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { PageHeader } from '@/components/layout/PageHeader';
import { DifficultyMeter } from '@/components/quiz/DifficultyMeter';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import {
  RANK_BANDS,
  estimatedMinutes,
  fillTemplate,
  type QuizRankKey,
} from '@/components/quiz/quizProgress';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { formatCount, formatPercent } from '@/utils/format/numbers';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string; tier: string }>;
}

// Let unknown tiers reach the guard below and the landing not-found boundary.
// With dynamicParams=false, Next can select the app group's catch-all before
// this route renders, which gives a missing quiz the wallet-enabled app shell.
export function generateStaticParams() {
  return QUIZ_TIER_IDS.map((tier) => ({ tier }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, tier } = await params;
  setRequestLocale(locale);
  if (!isQuizTierId(tier)) return notFoundMetadata(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createPageMetadata(
    parent,
    t(`quiz.tiers.${tier}.title`),
    t(`quiz.tiers.${tier}.description`),
    undefined,
    `${QUIZ_PATH}/${tier}`,
    {
      canonicalHost: 'landing',
      locale,
    },
  );
}

/**
 * Where each rank starts, for the ladder ("From 50%"), and where the first
 * one ends ("Below 50%"), so every step of the ladder carries its range.
 */
function rankFloors(ui: QuizRunnerUi, locale: string): Record<QuizRankKey, string> {
  const lowestFloor = Math.min(
    ...RANK_BANDS.filter(({ threshold }) => threshold > 0).map(({ threshold }) => threshold),
  );
  return Object.fromEntries(
    RANK_BANDS.map(({ rank, threshold }) => [
      rank,
      threshold === 0
        ? fillTemplate(ui.intro.rankBelowTemplate, {
            percent: formatPercent(lowestFloor * 100, locale),
          })
        : fillTemplate(ui.intro.rankFromTemplate, {
            percent: formatPercent(threshold * 100, locale),
          }),
    ]),
  ) as Record<QuizRankKey, string>;
}

export default async function QuizTierPage({ params }: PageProps) {
  const { locale, tier: tierParam } = await params;
  setRequestLocale(locale);
  if (!isQuizTierId(tierParam)) notFound();

  const { hub, ui, tiers } = getQuizContent(locale);
  const learnLabel = getLearnContent(locale).hub.breadcrumbs.learnLabel;
  const tierIndex = tiers.findIndex((candidate) => candidate.id === tierParam);
  const tier = tiers[tierIndex];
  if (!tier) notFound();
  const nextTier = tiers[tierIndex + 1];

  const t = await getTranslations({ locale, namespace: 'meta' });
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, `${QUIZ_PATH}/${tier.id}`, locale);
  const questionCount = tier.questions.length;

  const quizJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: t(`quiz.tiers.${tier.id}.title`),
    description: t(`quiz.tiers.${tier.id}.description`),
    url: pageUrl,
    inLanguage,
    isAccessibleForFree: true,
    educationalLevel: tier.title,
    about: { '@id': `${LANDING_ORIGIN}/#art-protocol` },
    publisher: { '@id': `${LANDING_ORIGIN}/#organization` },
  };

  return (
    <ReadingMain>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: hub.breadcrumbs.homeLabel, path: '/' },
              { name: learnLabel, path: '/learn' },
              { name: hub.breadcrumbs.quizLabel, path: QUIZ_PATH },
              { name: tier.title, path: `${QUIZ_PATH}/${tier.id}` },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          quizJsonLd,
        ]}
      />

      {/* The header keeps the site's content edge, like every reading page;
          only the runner holds to the reading measure. */}
      <PageHeader
        variant="reading"
        breadcrumbs={[
          { label: learnLabel, href: '/learn' },
          { label: hub.breadcrumbs.quizLabel, href: QUIZ_PATH },
        ]}
        eyebrow={hub.eyebrow}
        title={tier.title}
        subtitle={tier.description}
        meta={
          <>
            <span className="tabular-nums">
              {fillTemplate(hub.questionCountTemplate, {
                count: formatCount(questionCount, locale),
              })}
            </span>
            <span className="tabular-nums">
              {fillTemplate(hub.durationTemplate, {
                minutes: estimatedMinutes(questionCount),
              })}
            </span>
            <span className="inline-flex items-center gap-2">
              <DifficultyMeter
                level={tierIndex + 1}
                max={tiers.length}
                label={fillTemplate(hub.difficultyTemplate, {
                  level: tierIndex + 1,
                  max: tiers.length,
                })}
              />
            </span>
          </>
        }
      />

      <div className="max-w-[46rem]">
        <QuizRunner
          tier={tier}
          ui={ui}
          locale={locale}
          hubHref={QUIZ_PATH}
          rankFloors={rankFloors(ui, locale)}
          bestTemplate={hub.bestTemplate}
          nextTier={
            nextTier ? { title: nextTier.title, href: `${QUIZ_PATH}/${nextTier.id}` } : undefined
          }
        />
      </div>
    </ReadingMain>
  );
}
