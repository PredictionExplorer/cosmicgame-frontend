import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLearnArticle, getLearnContent, getLearnSlugs } from '@/content/learn';

import { getSiteRoute, resolveRouteHref, type SiteRouteId } from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
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
import { signaturePlate } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatOgCycle } from '@/lib/og/copy';
import { cn } from '@/lib/utils';
import { formatYyyymmddLabel } from '@/utils/format/dates';
import { formatId } from '@/utils/format/ids';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const TITLE_ID = 'guide-title';
const ARTICLE_ID = 'guide-body';
const PLATE_ID = 'guide-plate';

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
  const [common, nav, traits, detail] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'traits' }),
    getTranslations({ locale, namespace: 'detail' }),
  ]);

  const index = articles.findIndex((candidate) => candidate.slug === article.slug);
  const next = articles[index + 1];
  const minutes = guideMinutes(article, locale);
  const plate = signaturePlate(article.plate);
  const plateId = formatId(article.plate);

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

      <PageHeader
        variant="reading"
        breadcrumbs={[{ label: articleUi.breadcrumbs.learnLabel, href: '/learn' }]}
        title={article.h1}
        titleId={TITLE_ID}
        subtitle={article.summary}
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

      <div className="lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:gap-16">
        <div>
          <ReadingContents
            entries={entries}
            copy={articleUi.contents}
            articleId={ARTICLE_ID}
            topId={TITLE_ID}
            anchorId={PLATE_ID}
          />
        </div>

        <div className="min-w-0">
          {plate ? (
            <div id={PLATE_ID} className="max-w-[46rem]">
              <SignaturePlate
                art={plate}
                priority
                href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${plate.tokenId}`, locale)}
                sizes="(min-width: 1024px) 46rem, 100vw"
                copy={{
                  alt: traits('quickView.title', { id: plateId }),
                  title: traits('quickView.title', { id: plateId }),
                  cycle: formatOgCycle(locale, plate.cycle),
                  unavailable: detail('image.artworkUnavailable'),
                }}
              />
            </div>
          ) : null}

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
                </section>
              );
            })}
          </article>

          {next ? (
            <nav aria-label={articleUi.nextGuideLabel} className="mt-16 max-w-[46rem] lg:mt-20">
              <Link
                href={`/learn/${next.slug}`}
                className="group flex items-start gap-5 rounded-surface border border-rule bg-surface p-5 transition-colors duration-fast hover:border-input hover:bg-surface-raised sm:p-7"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-label text-subtle">
                    <span className="text-secondary">{articleUi.nextGuideLabel}</span>
                    <span aria-hidden className="type-mono">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="mt-2 block type-heading-2 text-foreground">
                    {next.cardTitle}
                  </span>
                  <span className="mt-2 block type-body-sm text-muted-foreground">
                    {next.description}
                  </span>
                </span>
                <NextGuideIcon slug={next.slug} />
              </Link>
            </nav>
          ) : null}

          <QuizPrompt
            className={cn('max-w-[46rem]', next ? 'mt-10' : 'mt-16 lg:mt-20')}
            headingId="guide-quiz"
            heading={hub.quizCta.heading}
            body={hub.quizCta.body}
            linkLabel={hub.quizCta.linkLabel}
            href={hub.quizCta.href}
          />

          <aside
            aria-label={articleUi.appendixLabel}
            className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-14"
          >
            <div className="max-w-[var(--measure-prose)] space-y-7">
              {articleUi.appendix.map((section) => (
                <div key={section.heading}>
                  <h2 className="type-title text-foreground">{section.heading}</h2>
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

            <div className="space-y-8">
              <div>
                <h2 className="type-label text-subtle">{articleUi.relatedResourcesHeading}</h2>
                <ul className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
                  {article.related.map((link) => {
                    const target = landingLink(link.href, locale);
                    return (
                      <li key={link.href}>
                        <SiteLink
                          href={target.href}
                          kind={target.kind}
                          className="group flex min-h-11 items-center justify-between gap-3 py-2.5 type-body-sm text-foreground hover:text-primary"
                          externalIconClassName="ml-auto"
                        >
                          <span className="min-w-0">{link.label}</span>
                          {target.kind === 'external' ? null : (
                            <ArrowRight
                              aria-hidden
                              className="size-3.5 shrink-0 text-subtle transition-colors group-hover:text-primary"
                            />
                          )}
                        </SiteLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h2 className="type-label text-subtle">{articleUi.verifyLinksLabel}</h2>
                <ul className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
                  {VERIFY_ROUTES.map((routeId) => {
                    const route = getSiteRoute(routeId);
                    const target = resolveRouteHref(route, 'landing', locale);
                    const Icon = SITE_ROUTE_ICONS[routeId];
                    return (
                      <li key={routeId}>
                        <SiteLink
                          href={target.href}
                          kind={target.kind}
                          className="group flex min-h-11 items-center gap-3 py-2.5 type-body-sm text-foreground hover:text-primary"
                          externalIconClassName="ml-auto"
                        >
                          <Icon
                            aria-hidden
                            className="size-4 shrink-0 text-subtle transition-colors group-hover:text-primary"
                          />
                          <span className="min-w-0">{nav(`routes.${routeId}.label`)}</span>
                          {target.kind === 'external' ? null : (
                            <ArrowRight
                              aria-hidden
                              className="ml-auto size-3.5 shrink-0 text-subtle transition-colors group-hover:text-primary"
                            />
                          )}
                        </SiteLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ReadingMain>
  );
}

function NextGuideIcon({ slug }: { slug: keyof typeof GUIDE_ICONS }) {
  const Icon = GUIDE_ICONS[slug];
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
