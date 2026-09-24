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
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { SectionHeader } from '@/components/ui/section-header';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatOgCycle } from '@/lib/og/copy';
import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format/ids';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** The Signature beside the white paper card. */
const WHITE_PAPER_PLATE = SIGNATURE_PLATES[23];

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
  const traits = await getTranslations({ locale, namespace: 'traits' });
  const detail = await getTranslations({ locale, namespace: 'detail' });
  const plateId = formatId(WHITE_PAPER_PLATE.tokenId);

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

      <PageHeader variant="reading" eyebrow={hub.eyebrow} title={hub.h1} subtitle={hub.intro} />

      <section
        aria-labelledby="learn-white-paper"
        className="grid items-center gap-8 rounded-surface border border-rule bg-surface p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-12"
      >
        <div className="min-w-0">
          <p className="type-eyebrow text-secondary">{hub.whitePaper.eyebrow}</p>
          <h2 id="learn-white-paper" className="mt-3 type-heading-1 text-foreground">
            {whitePaper.breadcrumbLabel}
          </h2>
          <p className="mt-3 max-w-[var(--measure-lede)] type-body-lg text-muted-foreground">
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
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'max-sm:w-full')}
            >
              <Download aria-hidden />
              {whitePaper.hero.downloadLabel}
            </a>
          </div>
        </div>
        <SignaturePlate
          art={WHITE_PAPER_PLATE}
          href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${WHITE_PAPER_PLATE.tokenId}`, locale)}
          sizes="(min-width: 1024px) 28rem, (min-width: 768px) 17rem, 100vw"
          copy={{
            alt: traits('quickView.title', { id: plateId }),
            title: traits('quickView.title', { id: plateId }),
            cycle: formatOgCycle(locale, WHITE_PAPER_PLATE.cycle),
            unavailable: detail('image.artworkUnavailable'),
          }}
        />
      </section>

      {LEARN_GROUP_IDS.map((groupId, groupIndex) => {
        const guides = articles
          .map((article, index) => ({ article, number: index + 1 }))
          .filter(({ article }) => article.group === groupId);
        const group = hub.groups[groupId];
        const headingId = `learn-stage-${groupId}`;
        return (
          <section
            key={groupId}
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
                    readingTime={fillTemplate(articleUi.readingTimeTemplate, {
                      minutes: guideMinutes(article, locale),
                    })}
                  />
                </li>
              ))}
            </ol>
          </section>
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
