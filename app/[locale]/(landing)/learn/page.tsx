import { Fragment } from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Download } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LEARN_GROUP_IDS, getLearnContent } from '@/content/learn';
import { WHITE_PAPER_PATH, getWhitePaperContent } from '@/content/white-paper';

import { PageHeader } from '@/components/layout/PageHeader';
import { GuideCard } from '@/components/learn/GuideCard';
import { guideReadingTime } from '@/components/learn/guides';
import { QuizPrompt } from '@/components/learn/QuizPrompt';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
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

/** The Signature beside the hub's header: art opens the reading room, as on every guide. */
const HUB_PLATE = SIGNATURE_PLATES[24];

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

      {/*
       * The hub opens like its guides: the header, with a Signature beside it
       * from lg (where the header leaves its right side empty) and none on
       * narrower screens, where the reading path comes first.
       */}
      <div className="border-b border-rule lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-12 xl:gap-16">
        <PageHeader
          variant="reading"
          host="landing"
          title={hub.h1}
          subtitle={hub.intro}
          className="mb-0 border-b-0 sm:mb-0"
        />
        <div className="hidden pb-10 lg:block">
          <SignaturePlate
            art={HUB_PLATE}
            href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${HUB_PLATE.tokenId}`, locale)}
            sizes="(min-width: 1024px) 26rem, 100vw"
            copy={plateCopy(HUB_PLATE)}
          />
        </div>
      </div>

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
              className={cn('mt-12 sm:mt-20', groupIndex === 0 && 'mt-10 sm:mt-14')}
            >
              {/* The guides carry the only sequence (01–11); the stages are named, not numbered. */}
              <SectionHeader
                headingId={headingId}
                title={group.title}
                description={group.description}
              />
              <ol
                className={cn(
                  'mt-4 grid border-t border-rule-faint sm:mt-6 sm:grid-cols-2 sm:gap-5 sm:border-t-0',
                  STAGE_COLUMNS[guides.length] ?? 'lg:grid-cols-4',
                )}
              >
                {guides.map(({ article, number }) => (
                  <li key={article.slug} className="min-w-0">
                    <GuideCard
                      slug={article.slug}
                      number={number}
                      title={article.cardTitle}
                      description={article.cardDescription}
                      readingTime={guideReadingTime(article, locale, articleUi.readingTimeTemplate)}
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
