import { Fragment } from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Download } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LEARN_GROUP_IDS, getLearnContent } from '@/content/learn';
import { WHITE_PAPER_PATH, getWhitePaperContent } from '@/content/white-paper';

import { PageHeader } from '@/components/layout/PageHeader';
import { GuideCard } from '@/components/learn/GuideCard';
import { guideMinutes } from '@/components/learn/guides';
import { QuizPrompt } from '@/components/learn/QuizPrompt';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { SectionHeader } from '@/components/ui/section-header';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** The Signature beside the white paper card. */
const WHITE_PAPER_PLATE = SIGNATURE_PLATES[23];

/** A card names its reading time only when it tells a reader something (not "1 min read"). */
const MIN_MINUTES_SHOWN = 3;

/** Grid columns by the number of guides in a stage, so a stage never leaves a hole. */
const STAGE_COLUMNS: Record<number, string> = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

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
  const { hub, articleUi, articles } = getLearnContent(locale);
  const whitePaper = getWhitePaperContent(locale);
  const plateCopy = await getSignaturePlateCopy(locale);

  return (
    <ReadingMain>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: hub.breadcrumbs.homeLabel, path: '/' },
            { name: hub.breadcrumbs.learnLabel, path: '/learn' },
          ],
          localeHref(LANDING_ORIGIN, '/', locale),
        )}
      />

      <PageHeader variant="reading" title={hub.h1} subtitle={hub.intro} />

      {LEARN_GROUP_IDS.map((groupId, groupIndex) => {
        const guides = articles
          .map((article, index) => ({ article, number: index + 1 }))
          .filter(({ article }) => article.group === groupId);
        const group = hub.groups[groupId];
        const headingId = `learn-stage-${groupId}`;
        return (
          <Fragment key={groupId}>
            <section
              aria-labelledby={headingId}
              className={cn('mt-16 sm:mt-20', groupIndex === 0 && 'mt-14 sm:mt-16')}
            >
              <SectionHeader
                headingId={headingId}
                eyebrow={String(groupIndex + 1).padStart(2, '0')}
                title={group.title}
                description={group.description}
              />
              <ol
                className={cn(
                  'mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5',
                  STAGE_COLUMNS[guides.length] ?? 'lg:grid-cols-4',
                )}
              >
                {guides.map(({ article, number }) => (
                  <li key={article.slug} className="min-w-0">
                    <GuideCard
                      slug={article.slug}
                      number={number}
                      title={article.cardTitle}
                      description={article.description}
                      readingTime={
                        guideMinutes(article, locale) >= MIN_MINUTES_SHOWN
                          ? fillTemplate(articleUi.readingTimeTemplate, {
                              minutes: guideMinutes(article, locale),
                            })
                          : null
                      }
                    />
                  </li>
                ))}
              </ol>
            </section>
            {/* The full reference follows the first guides, so a guide leads the page. */}
            {groupIndex === 0 ? (
              <section
                aria-labelledby="learn-white-paper"
                className="mt-14 grid items-center gap-6 rounded-surface border border-rule bg-surface p-5 sm:mt-16 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12"
              >
                <div className="min-w-0">
                  <p className="type-eyebrow text-subtle">{hub.whitePaper.eyebrow}</p>
                  <h2 id="learn-white-paper" className="mt-3 type-heading-2 text-foreground">
                    {whitePaper.breadcrumbLabel}
                  </h2>
                  <p className="mt-3 max-w-[var(--measure-lede)] type-body-md text-muted-foreground">
                    {whitePaper.hero.subtitle}
                  </p>
                  <p className="mt-3 type-label tabular-nums text-subtle">
                    {whitePaper.hero.versionLabel} · {whitePaper.hero.dateLabel} · PDF
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={WHITE_PAPER_PATH}
                      className={cn(buttonVariants({ size: 'lg' }), 'max-sm:w-full')}
                    >
                      {hub.whitePaper.readLabel}
                      <ArrowRight aria-hidden />
                    </Link>
                    <a
                      href={whitePaper.hero.downloadHref}
                      download
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'lg' }),
                        'max-sm:w-full',
                      )}
                    >
                      <Download aria-hidden />
                      {whitePaper.hero.downloadLabel}
                    </a>
                  </div>
                </div>
                <SignaturePlate
                  className="max-md:max-w-[22rem]"
                  art={WHITE_PAPER_PLATE}
                  href={localizeCrossHostHref(
                    `${APP_ORIGIN}/detail/${WHITE_PAPER_PLATE.tokenId}`,
                    locale,
                  )}
                  sizes="(min-width: 1024px) 22rem, (min-width: 768px) 15rem, 100vw"
                  copy={plateCopy(WHITE_PAPER_PLATE)}
                />
              </section>
            ) : null}
          </Fragment>
        );
      })}

      <QuizPrompt
        className="mt-20 sm:mt-24"
        headingId="learn-quiz"
        heading={hub.quizCta.heading}
        body={hub.quizCta.body}
        linkLabel={hub.quizCta.linkLabel}
        href={hub.quizCta.href}
      />
    </ReadingMain>
  );
}
