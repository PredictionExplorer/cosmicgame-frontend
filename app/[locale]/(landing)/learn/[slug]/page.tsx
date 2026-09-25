import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, FileText, type LucideIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';
import {
  getLearnArticle,
  getLearnContent,
  getLearnSlugs,
  type LearnFigure,
  type LearnSection,
} from '@/content/learn';
import { LEGAL_LINKS } from '@/content/legal/links';
import { protocolFacts } from '@/content/protocol-facts';
import { WHITE_PAPER_PATH, getWhitePaperContent } from '@/content/white-paper';

import { getSiteRoute, type SiteRouteId } from '@/config/siteNav';
import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';
import { ContractLedger } from '@/components/learn/ContractLedger';
import { GUIDE_ICONS } from '@/components/learn/GuideCard';
import { GuideText } from '@/components/learn/GuideText';
import { guideReadingTime, guideResourceTarget, landingLink } from '@/components/learn/guides';
import { QuizPrompt } from '@/components/learn/QuizPrompt';
import { AllocationBar, AllocationKey } from '@/components/reading/AllocationBar';
import { ReadingContents } from '@/components/reading/ContentsNav';
import { MetaItems } from '@/components/reading/MetaItems';
import {
  NumberedFigure,
  PROSE_CLASS,
  READING_TEXT_EDGE_CLASS,
  ReadingHeading,
} from '@/components/reading/prose';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { SIGNATURE_PLATES, signaturePlate } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { CycleTimeline } from '@/components/white-paper/CycleTimeline';
import { referenceTargets, withReferences } from '@/components/white-paper/crossReferences';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { formatYyyymmddLabel } from '@/utils/format/dates';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const TITLE_ID = 'guide-title';
const ARTICLE_ID = 'guide-body';

/**
 * The text measure inside the guide, the prose's own edge (the column sets
 * it in rem, READING_TEXT_EDGE_CLASS); figures break out to the white
 * paper's 60rem.
 */
const TEXT_COLUMN = 'max-w-[var(--measure-prose)]';

/** The app pages every guide is read against: common questions, and the risks before taking part. */
const VERIFY_ROUTES: readonly SiteRouteId[] = ['faq', 'riskDisclosures'];

/**
 * The core contracts the contracts guide lists, in the contracts page's
 * order: each `contracts.entries` name with its verified address
 * (content/protocol-facts.ts).
 */
const CORE_CONTRACTS = [
  { entry: 'protocol', address: protocolFacts.contractAddresses.proxy },
  { entry: 'implementation', address: protocolFacts.contractAddresses.implementation },
  { entry: 'cst', address: protocolFacts.contractAddresses.cstToken },
  { entry: 'nft', address: protocolFacts.contractAddresses.cosmicSignatureNft },
  { entry: 'randomWalk', address: protocolFacts.contractAddresses.randomWalkNft },
  { entry: 'council', address: protocolFacts.contractAddresses.cosmicCouncil },
] as const;

function sectionId(index: number): string {
  return `section-${index + 1}`;
}

export function generateStaticParams() {
  return getLearnSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getLearnArticle(slug, locale);
  if (!article) return notFoundMetadata(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });
  const metaKey = `learnArticles.${article.slug}`;

  // Each guide has its own share card (./opengraph-image.tsx).
  return createMetadata(
    t(`${metaKey}.title`),
    t(`${metaKey}.description`),
    undefined,
    `/learn/${article.slug}`,
    { canonicalHost: 'landing', locale, ogType: 'article' },
  );
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getLearnArticle(slug, locale);
  if (!article) notFound();
  const { hub, articleUi, articles } = getLearnContent(locale);
  const whitePaper = getWhitePaperContent(locale);
  const inLanguage = jsonLdInLanguage(locale);
  const [common, nav, contracts, plateCopy] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'contracts' }),
    getSignaturePlateCopy(locale),
  ]);

  const index = articles.findIndex((candidate) => candidate.slug === article.slug);
  const nextGuide = articles[index + 1];
  // The path goes on: each guide leads to the next, and the last to the white paper.
  const next: NextReading = nextGuide
    ? {
        label: articleUi.nextGuideLabel,
        number: String(index + 2).padStart(2, '0'),
        title: nextGuide.cardTitle,
        description: nextGuide.cardDescription,
        href: `/learn/${nextGuide.slug}`,
        icon: GUIDE_ICONS[nextGuide.slug],
      }
    : {
        label: hub.whitePaper.eyebrow,
        title: whitePaper.breadcrumbLabel,
        description: whitePaper.hero.subtitle,
        href: WHITE_PAPER_PATH,
        icon: FileText,
      };
  // The quiz closes a stage of the reading path, not every guide in it.
  const endsStage = !nextGuide || nextGuide.group !== article.group;
  const readingTime = guideReadingTime(article, locale, articleUi.readingTimeTemplate);
  const plate = signaturePlate(article.plate);

  const url = localeHref(LANDING_ORIGIN, `/learn/${article.slug}`, locale);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': article.schemaType,
    headline: article.h1,
    description: article.description,
    url,
    inLanguage,
    datePublished: article.updated,
    dateModified: article.updated,
    author: {
      '@type': 'Organization',
      name: 'Cosmic Signature',
      url: localeHref(LANDING_ORIGIN, '/', locale),
    },
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
    mainEntityOfPage: url,
  };

  // The guide's Signature, rendered beside the header from lg and after the
  // first section below it (only one of the two is displayed).
  const plateView = plate
    ? (width: string) => (
        <SignaturePlate
          art={plate}
          href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${plate.tokenId}`, locale)}
          sizes={width === '100vw' ? '100vw' : `(min-width: 1024px) ${width}, 100vw`}
          copy={plateCopy(plate)}
        />
      )
    : null;

  // One list of the pages to read or check this guide against: the guide's
  // own related links, then the questions and risks pages it does not
  // already name, each destination once and each named after itself.
  const resources: { href: string; kind: ReturnType<typeof landingLink>['kind']; label: string }[] =
    [];
  const seen = new Set<string>();
  const addResource = (href: string) => {
    const target = guideResourceTarget(href);
    if (!target) return;
    const link = landingLink(href, locale);
    const key = link.href.replace(/\/+$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    const label =
      target.kind === 'route'
        ? nav(`routes.${target.id}.label`)
        : target.kind === 'guide'
          ? (articles.find((guide) => guide.slug === target.slug)?.cardTitle ?? '')
          : // A venue goes by its own name; the footer's "Trade CST on Uniswap" is an action.
            target.id === 'uniswap'
            ? 'Uniswap'
            : nav(`outbound.${target.id}.label`);
    if (label) resources.push({ href: link.href, kind: link.kind, label });
  };
  for (const href of article.related) addResource(href);
  for (const routeId of VERIFY_ROUTES) addResource(`${APP_ORIGIN}${getSiteRoute(routeId).path}`);

  // The figures, numbered in reading order and set in their sections.
  const whitePaperTargets = referenceTargets(whitePaper);
  const figureBody = (
    figure: LearnFigure,
  ): { title: string; caption: ReactNode; body: ReactNode } => {
    // Every figure kind is handled; the compiler checks the switch is exhaustive.
    switch (figure.kind) {
      case 'cycleTimeline':
        return {
          title: whitePaper.figures.cycle.title,
          caption: withReferences(
            whitePaper.figures.cycle.caption,
            locale,
            whitePaperTargets,
            WHITE_PAPER_PATH,
          ),
          body: <CycleTimeline steps={whitePaper.figures.cycle.steps} />,
        };
      case 'allocation': {
        const tracks = getLandingContent(locale).tracks.eth;
        return {
          title: whitePaper.figures.allocation.title,
          caption: whitePaper.figures.allocation.caption,
          body: (
            <>
              <AllocationBar tracks={tracks} density="inline" />
              <AllocationKey tracks={tracks} />
            </>
          ),
        };
      }
      case 'seedPlates':
        return {
          title: whitePaper.figures.art.title,
          caption: whitePaper.figures.art.caption,
          body: (
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {[SIGNATURE_PLATES[23], SIGNATURE_PLATES[24]].map((art) => (
                <SignaturePlate
                  key={art.tokenId}
                  art={art}
                  href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${art.tokenId}`, locale)}
                  sizes="(min-width: 1024px) 30rem, (min-width: 640px) 45vw, 100vw"
                  copy={{ ...plateCopy(art), seedLabel: whitePaper.figures.art.seedLabel }}
                />
              ))}
            </div>
          ),
        };
      case 'contracts':
        return {
          title: articleUi.contractsFigure.title,
          caption: articleUi.contractsFigure.caption,
          body: (
            <ContractLedger
              rows={CORE_CONTRACTS.map(({ entry, address }) => ({
                name: contracts(`entries.${entry}.name`),
                address,
                href: `${LEGAL_LINKS.explorer.href}/address/${address}`,
              }))}
            />
          ),
        };
    }
  };
  const figuresBySection = new Map<number, ReactNode[]>();
  article.figures.forEach((figure, figureIndex) => {
    const { title, caption, body } = figureBody(figure);
    const view = (
      <NumberedFigure
        key={`${figure.kind}-${figure.section}`}
        titleId={`figure-${figureIndex + 1}-title`}
        label={fillTemplate(whitePaper.reading.figureTemplate, { number: figureIndex + 1 })}
        title={title}
        caption={caption}
      >
        {body}
      </NumberedFigure>
    );
    figuresBySection.set(figure.section, [...(figuresBySection.get(figure.section) ?? []), view]);
  });

  const entries = article.sections.map((section, sectionIndex) => ({
    id: sectionId(sectionIndex),
    label: section.heading,
  }));

  return (
    <ReadingMain>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: articleUi.breadcrumbs.homeLabel, path: '/' },
              { name: articleUi.breadcrumbs.learnLabel, path: '/learn' },
              { name: article.h1, path: `/learn/${article.slug}` },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          articleJsonLd,
        ]}
      />

      {/*
       * From lg the guide's Signature hangs beside the header, where the
       * header left its right side empty, so the contents rail and the first
       * section start in the first screen. On phones and tablets it follows
       * the first section instead of pushing the text below the fold.
       */}
      <div className="mb-8 border-b border-rule sm:mb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-12 xl:gap-16">
        <PageHeader
          variant="reading"
          host="landing"
          breadcrumbs={[{ label: articleUi.breadcrumbs.learnLabel, href: '/learn' }]}
          title={article.h1}
          titleId={TITLE_ID}
          subtitle={article.summary}
          className="mb-0 border-b-0 sm:mb-0"
          meta={
            <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <MetaItems
                items={[
                  <span key="guide" className="tabular-nums">
                    {fillTemplate(articleUi.guideTemplate, {
                      number: index + 1,
                      total: articles.length,
                    })}
                  </span>,
                  readingTime ? (
                    <span key="time" className="tabular-nums">
                      {readingTime}
                    </span>
                  ) : null,
                  <time key="updated" dateTime={article.updated}>
                    {common('pageHeader.lastUpdated', {
                      date: formatYyyymmddLabel(article.updated.replaceAll('-', ''), locale),
                    })}
                  </time>,
                ]}
              />
            </span>
          }
        />
        {plateView ? <div className="hidden pb-10 lg:block">{plateView('26rem')}</div> : null}
      </div>

      <div
        className={cn(
          READING_TEXT_EDGE_CLASS,
          'lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:gap-16',
        )}
      >
        <div>
          <ReadingContents
            entries={entries}
            copy={articleUi.contents}
            articleId={ARTICLE_ID}
            topId={TITLE_ID}
            anchorId={TITLE_ID}
          />
        </div>

        <div className="min-w-0">
          <article id={ARTICLE_ID} aria-labelledby={TITLE_ID} className="min-w-0 max-w-[60rem]">
            {article.sections.map((section, sectionIndex) => (
              <GuideSection
                key={section.heading}
                section={section}
                sectionIndex={sectionIndex}
                locale={locale}
                anchorLabel={fillTemplate(articleUi.headingLinkTemplate, {
                  title: section.heading,
                })}
                figures={figuresBySection.get(sectionIndex)}
                after={
                  sectionIndex === 0 && plateView ? (
                    <div className={cn('mt-10 lg:hidden', TEXT_COLUMN)}>{plateView('100vw')}</div>
                  ) : null
                }
              />
            ))}
          </article>

          {/* The pages to read or check the guide against, then the path onward. */}
          <nav
            aria-labelledby="guide-resources"
            className={cn('mt-16 border-t border-rule pt-8 lg:mt-20', TEXT_COLUMN)}
          >
            <h2 id="guide-resources" className="type-label text-subtle">
              {articleUi.relatedResourcesHeading}
            </h2>
            <ul className="mt-3 grid border-t border-rule-faint sm:grid-cols-2 sm:gap-x-8">
              {resources.map((resource) => (
                <li key={resource.href} className="border-b border-rule-faint">
                  <SiteLink
                    href={resource.href}
                    kind={resource.kind}
                    className="group flex min-h-11 items-center justify-between gap-3 py-2.5 type-body-sm text-foreground hover:text-primary"
                    externalIconClassName="ml-auto"
                  >
                    <span className="min-w-0">{resource.label}</span>
                    {resource.kind === 'external' ? null : (
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 shrink-0 text-subtle transition-colors group-hover:text-primary"
                      />
                    )}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={next.label} className={cn('mt-12 lg:mt-14', TEXT_COLUMN)}>
            <Link
              href={next.href}
              className="group flex items-start gap-5 rounded-surface border border-rule bg-surface p-5 transition-colors duration-fast hover:border-input hover:bg-surface-raised sm:p-7"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-label text-subtle">
                  <span>{next.label}</span>
                  {next.number ? (
                    <span aria-hidden className="tabular-nums">
                      {next.number}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block type-heading-2 text-foreground">{next.title}</span>
                <span className="mt-2 block type-body-sm text-muted-foreground">
                  {next.description}
                </span>
              </span>
              <NextReadingIcon icon={next.icon} />
            </Link>
          </nav>

          {endsStage ? (
            <QuizPrompt
              className={cn('mt-10', TEXT_COLUMN)}
              headingId="guide-quiz"
              heading={hub.quizCta.heading}
              body={hub.quizCta.body}
              linkLabel={hub.quizCta.linkLabel}
              href={hub.quizCta.href}
            />
          ) : null}
        </div>
      </div>
    </ReadingMain>
  );
}

interface GuideSectionProps {
  section: LearnSection;
  sectionIndex: number;
  locale: string;
  anchorLabel: string;
  /** Figures that illustrate the section, set after its first paragraph. */
  figures?: readonly ReactNode[];
  /** Content after the section (the guide's Signature on narrow screens). */
  after?: ReactNode;
}

/** One section of a guide: its heading, paragraphs and steps, with its figures after the opening paragraph. */
function GuideSection({
  section,
  sectionIndex,
  locale,
  anchorLabel,
  figures,
  after,
}: GuideSectionProps) {
  const id = sectionId(sectionIndex);
  const [opening, ...rest] = section.body;
  const paragraph = (text: string) => (
    <p key={text} className={cn(PROSE_CLASS, '[overflow-wrap:anywhere]')}>
      <GuideText text={text} locale={locale} />
    </p>
  );
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        'scroll-mt-[var(--sticky-offset)]',
        sectionIndex === 0
          ? 'mt-12 lg:mt-14'
          : 'mt-12 border-t border-rule-faint pt-10 lg:mt-14 lg:pt-12',
      )}
    >
      <div className={TEXT_COLUMN}>
        <ReadingHeading
          as="h2"
          sectionId={id}
          headingId={`${id}-heading`}
          anchorLabel={anchorLabel}
        >
          {section.heading}
        </ReadingHeading>
        <div className="mt-5 space-y-5">{opening ? paragraph(opening) : null}</div>
      </div>
      {figures?.length ? <div className="mt-10 space-y-10 mb-10">{figures}</div> : null}
      {rest.length > 0 || section.steps?.length ? (
        <div className={cn('mt-5 space-y-5', TEXT_COLUMN)}>
          {rest.map(paragraph)}
          {section.steps?.length ? <GuideSteps steps={section.steps} locale={locale} /> : null}
        </div>
      ) : null}
      {after}
    </section>
  );
}

/** A procedure as numbered rows between hairlines, the numbers in tabular figures. */
function GuideSteps({ steps, locale }: { steps: readonly string[]; locale: string }) {
  return (
    <ol className="divide-y divide-rule-faint border-y border-rule-faint">
      {steps.map((step, stepIndex) => (
        <li key={step} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-4">
          <span aria-hidden className="pt-0.5 type-label tabular-nums text-subtle">
            {String(stepIndex + 1).padStart(2, '0')}
          </span>
          <p className="type-body-md text-muted-foreground [overflow-wrap:anywhere]">
            <GuideText text={step} locale={locale} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Where a guide leads: the next guide on the reading path, or the white paper after the last. */
interface NextReading {
  /** "Next guide", or the white paper's "The full reference". */
  label: string;
  /** The next guide's place on the path ("04"); the white paper has none. */
  number?: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

function NextReadingIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="mt-1 flex shrink-0 flex-col items-end gap-6">
      <Icon aria-hidden className="size-5 text-subtle" />
      <ArrowRight
        aria-hidden
        className="size-5 text-subtle transition-[color,transform] duration-fast group-hover:text-primary motion-safe:group-hover:translate-x-0.5"
      />
    </span>
  );
}
