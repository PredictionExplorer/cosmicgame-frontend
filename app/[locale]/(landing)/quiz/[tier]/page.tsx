import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { QUIZ_PATH, QUIZ_TIER_IDS, getQuizContent, isQuizTierId } from '@/content/quiz';

import { QuizRunner } from '@/components/quiz/QuizRunner';
import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string; tier: string }>;
}

// Let unknown tiers reach the guard below and the landing not-found boundary.
// With dynamicParams=false, Next can select the app group's catch-all before
// this route renders, which gives a missing quiz the wallet-enabled app shell.
export function generateStaticParams() {
  return QUIZ_TIER_IDS.map((tier) => ({ tier }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tier } = await params;
  setRequestLocale(locale);
  if (!isQuizTierId(tier)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(
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

export default async function QuizTierPage({ params }: PageProps) {
  const { locale, tier: tierParam } = await params;
  setRequestLocale(locale);
  if (!isQuizTierId(tierParam)) notFound();

  const { hub, ui, tiers } = getQuizContent(locale);
  const tier = tiers.find((candidate) => candidate.id === tierParam);
  if (!tier) notFound();

  const t = await getTranslations({ locale, namespace: 'meta' });
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, `${QUIZ_PATH}/${tier.id}`, locale);

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
    <main
      id="main"
      tabIndex={-1}
      className="relative mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-20"
    >
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: hub.breadcrumbs.homeLabel, path: '/' },
              { name: hub.breadcrumbs.quizLabel, path: QUIZ_PATH },
              { name: tier.title, path: `${QUIZ_PATH}/${tier.id}` },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          quizJsonLd,
        ]}
      />

      <nav aria-label={hub.breadcrumbs.ariaLabel} className="mb-8 text-sm text-white/60">
        <Link href="/" className="hover:text-white">
          {hub.breadcrumbs.homeLabel}
        </Link>
        <span className="mx-2">/</span>
        <Link href={QUIZ_PATH} className="hover:text-white">
          {hub.breadcrumbs.quizLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{tier.title}</span>
      </nav>

      <header>
        <p className="type-eyebrow text-primary/80">
          {hub.eyebrow}
          {' · '}
          {hub.questionCountTemplate.replace('{count}', String(tier.questions.length))}
        </p>
        <h1 className="mt-4 type-display-lg text-balance text-foreground">{tier.title}</h1>
        <p className="mt-6 type-body-lg text-muted-foreground">{tier.description}</p>
      </header>

      <div className="mt-10">
        <QuizRunner tier={tier} ui={ui} hubHref={QUIZ_PATH} />
      </div>
    </main>
  );
}
