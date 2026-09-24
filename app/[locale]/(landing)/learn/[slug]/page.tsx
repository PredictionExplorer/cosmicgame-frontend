import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, FileText, type LucideIcon } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLearnArticle, getLearnContent, getLearnSlugs } from '@/content/learn';
import { WHITE_PAPER_PATH, getWhitePaperContent } from '@/content/white-paper';

import { getSiteRoute, resolveRouteHref, type SiteRouteId } from '@/config/siteNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';
import { GUIDE_ICONS } from '@/components/learn/GuideCard';
import { GuideText } from '@/components/learn/GuideText';
import { guideMinutes, landingLink } from '@/components/learn/guides';
import { QuizPrompt } from '@/components/learn/QuizPrompt';
import { ReadingContents } from '@/components/reading/ContentsNav';
import { PROSE_CLASS, ReadingHeading } from '@/components/reading/prose';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { getSignaturePlateCopy } from '@/components/reading/signaturePlateCopy';
import { signaturePlate } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
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

/** The app pages where a reader checks what a guide says. */
const VERIFY_ROUTES: readonly SiteRouteId[] = ['faq', 'contracts', 'statistics', 'riskDisclosures'];

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
  if (!article) return {};
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
  const inLanguage = jsonLdInLanguage(locale);
  const [common, nav, plateCopy] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
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
    : (() => {
        const whitePaper = getWhitePaperContent(locale);
        return {
          label: hub.whitePaper.eyebrow,
          title: whitePaper.breadcrumbLabel,
          description: whitePaper.hero.subtitle,
          href: WHITE_PAPER_PATH,
          icon: FileText,
        };
      })();
  const minutes = guideMinutes(article, locale);
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
  // own related links, then the app's reference pages it does not already
  // name, each destination once. The app's front door takes the shared
  // "Open the app" name.
  const resources: { href: string; kind: ReturnType<typeof landingLink>['kind']; label: string }[] =
    [];
  const seen = new Set<string>();
  const addResource = (target: ReturnType<typeof landingLink>, label: string) => {
    const key = target.href.replace(/\/+$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    resources.push({ href: target.href, kind: target.kind, label });
  };
  for (const link of article.related) {
    addResource(
      landingLink(link.href, locale),
      link.href === APP_ORIGIN ? nav('cta.openApp') : link.label,
    );
  }
  for (const routeId of VERIFY_ROUTES) {
    addResource(
      resolveRouteHref(getSiteRoute(routeId), 'landing', locale),
      nav(`routes.${routeId}.label`),
    );
  }

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
          breadcrumbs={[{ label: articleUi.breadcrumbs.learnLabel, href: '/learn' }]}
          title={article.h1}
          titleId={TITLE_ID}
          subtitle={article.summary}
          className="mb-0 border-b-0 sm:mb-0"
          meta={
            <>
              <span className="tabular-nums">
                {fillTemplate(articleUi.guideTemplate, {
                  number: index + 1,
                  total: articles.length,
                })}
              </span>
              <span className="tabular-nums">
                {fillTemplate(articleUi.readingTimeTemplate, { minutes })}
              </span>
              <time dateTime={article.updated}>
                {common('pageHeader.lastUpdated', {
                  date: formatYyyymmddLabel(article.updated.replaceAll('-', ''), locale),
                })}
              </time>
            </>
          }
        />
        {plateView ? <div className="hidden pb-10 lg:block">{plateView('26rem')}</div> : null}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:gap-16">
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
          <article id={ARTICLE_ID} aria-labelledby={TITLE_ID} className="min-w-0 max-w-[46rem]">
            {article.sections.map((section, sectionIndex) => {
              const id = sectionId(sectionIndex);
              return (
                <section
                  key={section.heading}
                  id={id}
                  aria-labelledby={`${id}-heading`}
                  className={cn(
                    'scroll-mt-[var(--sticky-offset)]',
                    sectionIndex === 0
                      ? 'mt-12 lg:mt-14'
                      : 'mt-12 border-t border-rule-faint pt-10 lg:mt-14 lg:pt-12',
                  )}
                >
                  <ReadingHeading
                    as="h2"
                    sectionId={id}
                    headingId={`${id}-heading`}
                    anchorLabel={fillTemplate(articleUi.headingLinkTemplate, {
                      title: section.heading,
                    })}
                  >
                    {section.heading}
                  </ReadingHeading>
                  <div className="mt-5 space-y-5">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className={cn(PROSE_CLASS, '[overflow-wrap:anywhere]')}>
                        <GuideText text={paragraph} locale={locale} />
                      </p>
                    ))}
                  </div>
                  {sectionIndex === 0 && plateView ? (
                    <div className="mt-10 lg:hidden">{plateView('100vw')}</div>
                  ) : null}
                </section>
              );
            })}
          </article>

          {/*
           * The guide's own appendix comes right after the text, under one
           * heading, with one list of the pages to check it against; the path
           * onward (the next guide, then the quiz) closes the page.
           */}
          <aside
            aria-labelledby="guide-appendix"
            className="mt-16 max-w-[46rem] border-t border-rule pt-10 lg:mt-20"
          >
            <h2 id="guide-appendix" className="sr-only">
              {articleUi.appendixLabel}
            </h2>
            <div className="space-y-7">
              {articleUi.appendix.map((section) => (
                <div key={section.heading}>
                  <h3 className="type-title text-foreground">{section.heading}</h3>
                  <div className="mt-2 space-y-2">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="type-body-sm text-muted-foreground">
                        <GuideText text={paragraph} locale={locale} />
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <nav aria-labelledby="guide-resources" className="mt-10">
              <p id="guide-resources" className="type-label text-subtle">
                {articleUi.relatedResourcesHeading}
              </p>
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
          </aside>

          <nav aria-label={next.label} className="mt-16 max-w-[46rem] lg:mt-20">
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

          <QuizPrompt
            className="mt-10 max-w-[46rem]"
            headingId="guide-quiz"
            heading={hub.quizCta.heading}
            body={hub.quizCta.body}
            linkLabel={hub.quizCta.linkLabel}
            href={hub.quizCta.href}
          />
        </div>
      </div>
    </ReadingMain>
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
