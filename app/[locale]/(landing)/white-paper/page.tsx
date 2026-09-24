import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ArrowUpRight, Download } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  WHITE_PAPER_DATE_ISO,
  WHITE_PAPER_VERSION,
  getWhitePaperContent,
  type WhitePaperBlock,
  type WhitePaperContent,
  type WhitePaperSection,
  type WhitePaperSubsection,
} from '@/content/white-paper';

import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReadingContents } from '@/components/reading/ContentsNav';
import type { ContentsEntry } from '@/components/reading/contents';
import {
  BREAKOUT_CLASS,
  Callout,
  FormulaFigure,
  NumberedFigure,
  PROSE_CLASS,
  ReadingHeading,
  RunInList,
} from '@/components/reading/prose';
import { ReadingMain } from '@/components/reading/ReadingMain';
import { readingMinutes } from '@/components/reading/readingTime';
import { SignaturePlate } from '@/components/reading/SignaturePlate';
import { SIGNATURE_PLATES } from '@/components/reading/signaturePlates';
import { fillTemplate } from '@/components/reading/template';
import { AllocationSplit } from '@/components/white-paper/AllocationSplit';
import { CycleTimeline } from '@/components/white-paper/CycleTimeline';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref, localizeCrossHostHref } from '@/lib/hostRouting';
import { formatOgCycle } from '@/lib/og/copy';
import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format/ids';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const TITLE_ID = 'white-paper-title';
const ARTICLE_ID = 'white-paper-body';
const CONTENTS_ID = 'contents';

/** Lists whose items are the stages of a sequence, numbered in the web edition. */
const ORDERED_LISTS = new Set(['art-pipeline']);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getWhitePaperContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  // The paper has its own share card (./opengraph-image.tsx).
  return createMetadata(
    t('whitePaper.title'),
    t('whitePaper.description'),
    undefined,
    metadata.path,
    {
      canonicalHost: 'landing',
      locale,
    },
  );
}

/** "5. The Cycle Reserve…" in the contents; appendices keep their own lettered titles. */
function isNumbered(section: WhitePaperSection): boolean {
  return /^\d+$/.test(section.number);
}

function contentsEntries(content: WhitePaperContent): ContentsEntry[] {
  return [
    ...content.sections.map((section) => ({
      id: section.id,
      label: section.heading,
      number: section.number,
      children: section.subsections?.map((subsection) => ({
        id: subsection.id,
        label: subsection.heading,
        number: subsection.number,
      })),
    })),
    { id: content.references.id, label: content.references.heading },
  ];
}

/** Every reader-facing string of the paper, for its reading time. */
function paperText(content: WhitePaperContent): string[] {
  const blockText = (block: WhitePaperBlock): string[] => {
    switch (block.kind) {
      case 'paragraph':
      case 'note':
        return [block.text];
      case 'list':
        return [...block.items];
      case 'formula':
        return [block.caption ?? ''];
      case 'table':
        return block.table.rows.flat();
    }
  };
  return [
    ...content.abstract.paragraphs,
    ...content.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap(blockText),
      ...(section.subsections ?? []).flatMap((subsection) => [
        subsection.heading,
        ...subsection.blocks.flatMap(blockText),
      ]),
    ]),
  ];
}

interface BlockContext {
  /** The id of the heading the block sits under, which names its tables. */
  headingId: string;
  /** The section or subsection the block belongs to. */
  sectionId: string;
  reading: WhitePaperContent['reading'];
}

function BlockView({ block, context }: { block: WhitePaperBlock; context: BlockContext }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className={PROSE_CLASS}>{block.text}</p>;
    case 'list':
      return <RunInList items={block.items} ordered={ORDERED_LISTS.has(context.sectionId)} />;
    case 'formula':
      return (
        <FormulaFigure
          label={context.reading.formulaLabel}
          formula={block.formula}
          notation={block.notation}
          legend={block.legend}
          expressionLabel={context.reading.contractExpressionLabel}
          caption={block.caption}
        />
      );
    case 'note':
      return <Callout label={context.reading.noteLabel}>{block.text}</Callout>;
    case 'table':
      return (
        <div className={BREAKOUT_CLASS}>
          {/*
           * The shared static ledger: on a phone each row becomes a labelled
           * record instead of a table cropped mid-word, and anything still too
           * wide scrolls in a keyboard-reachable region with a fading edge
           * (styles/tables.css). The section heading names the table.
           */}
          <Table labelledBy={context.headingId}>
            <TableHeader>
              <TableRow>
                {block.table.columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.table.rows.map((row) => (
                <TableRow key={row.join('|')}>
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={`${cellIndex}-${cell}`}
                      label={block.table.columns[cellIndex]}
                      stack={cellIndex > 0}
                      className={
                        cellIndex === 0
                          ? 'font-medium text-foreground'
                          : /^0x[0-9a-fA-F]{40}$/.test(cell)
                            ? 'type-hash'
                            : undefined
                      }
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {block.table.footnote ? (
            <p className="mt-3 max-w-[var(--measure-prose)] type-caption text-subtle">
              {block.table.footnote}
            </p>
          ) : null}
        </div>
      );
  }
}

function Blocks({
  blocks,
  context,
  figure,
}: {
  blocks: readonly WhitePaperBlock[];
  context: BlockContext;
  /** A figure for this section, placed after its opening paragraphs. */
  figure?: ReactNode;
}) {
  const leading = blocks.findIndex((block) => block.kind !== 'paragraph');
  const split = figure ? (leading === -1 ? blocks.length : leading) : blocks.length;
  return (
    <div className="space-y-6">
      {blocks.slice(0, split).map((block, index) => (
        <BlockView key={`${index}-${block.kind}`} block={block} context={context} />
      ))}
      {figure ? <div className="py-4">{figure}</div> : null}
      {blocks.slice(split).map((block, index) => (
        <BlockView key={`${split + index}-${block.kind}`} block={block} context={context} />
      ))}
    </div>
  );
}

function SubsectionView({
  subsection,
  reading,
  figure,
}: {
  subsection: WhitePaperSubsection;
  reading: WhitePaperContent['reading'];
  figure?: ReactNode;
}) {
  const headingId = `${subsection.id}-heading`;
  return (
    <section
      id={subsection.id}
      aria-labelledby={headingId}
      className="scroll-mt-[var(--sticky-offset)]"
    >
      <ReadingHeading
        as="h3"
        sectionId={subsection.id}
        headingId={headingId}
        number={subsection.number}
        anchorLabel={fillTemplate(reading.headingLinkTemplate, {
          title: [subsection.number, subsection.heading].join(' '),
        })}
      >
        {subsection.heading}
      </ReadingHeading>
      <div className="mt-4">
        <Blocks
          blocks={subsection.blocks}
          context={{ headingId, sectionId: subsection.id, reading }}
          figure={figure}
        />
      </div>
    </section>
  );
}

export default async function WhitePaperPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getWhitePaperContent(locale);
  const { reading, figures } = content;
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, content.metadata.path, locale);
  const pdfUrl = `${LANDING_ORIGIN}${content.hero.downloadHref}`;
  const detail = await getTranslations({ locale, namespace: 'detail' });
  const traits = await getTranslations({ locale, namespace: 'traits' });
  const minutes = readingMinutes(paperText(content), locale);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: `${content.hero.title}: ${content.hero.subtitle}`,
    description: content.metadata.description,
    url: pageUrl,
    inLanguage,
    datePublished: WHITE_PAPER_DATE_ISO,
    version: WHITE_PAPER_VERSION,
    author: {
      '@type': 'Person',
      name: content.hero.authorName,
      email: content.hero.authorEmail,
    },
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
    encoding: {
      '@type': 'MediaObject',
      contentUrl: pdfUrl,
      encodingFormat: 'application/pdf',
    },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    mainEntityOfPage: pageUrl,
  };

  const allocationTable = content.sections
    .flatMap((section) => section.subsections ?? [])
    .find((subsection) => subsection.id === 'distribution-at-finalization')
    ?.blocks.find((block) => block.kind === 'table');
  const allocationLabels =
    allocationTable?.kind === 'table' ? allocationTable.table.rows.map((row) => row[0] ?? '') : [];

  // Figures in the reading order of the sections they illustrate, numbered in that order.
  const figureList: ReadonlyArray<{
    sectionId: string;
    title: string;
    caption: string;
    body: ReactNode;
  }> = [
    {
      sectionId: 'performance-cycle',
      title: figures.cycle.title,
      caption: figures.cycle.caption,
      body: <CycleTimeline steps={figures.cycle.steps} />,
    },
    {
      sectionId: 'distribution-at-finalization',
      title: figures.allocation.title,
      caption: figures.allocation.caption,
      body: <AllocationSplit labels={allocationLabels} locale={locale} />,
    },
    {
      sectionId: 'the-art',
      title: figures.art.title,
      caption: figures.art.caption,
      body: (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {[SIGNATURE_PLATES[23], SIGNATURE_PLATES[24]].map((art) => {
            const id = formatId(art.tokenId);
            return (
              <SignaturePlate
                key={art.tokenId}
                art={art}
                href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${art.tokenId}`, locale)}
                sizes="(min-width: 1024px) 30rem, (min-width: 640px) 45vw, 100vw"
                copy={{
                  alt: traits('quickView.title', { id }),
                  title: traits('quickView.title', { id }),
                  cycle: formatOgCycle(locale, art.cycle),
                  seedLabel: figures.art.seedLabel,
                  unavailable: detail('image.artworkUnavailable'),
                }}
              />
            );
          })}
        </div>
      ),
    },
  ];
  const sectionFigures: Record<string, ReactNode> = Object.fromEntries(
    figureList.map((figure, index) => [
      figure.sectionId,
      <NumberedFigure
        key={figure.sectionId}
        titleId={`figure-${figure.sectionId}-title`}
        label={fillTemplate(reading.figureTemplate, { number: index + 1 })}
        title={figure.title}
        caption={figure.caption}
      >
        {figure.body}
      </NumberedFigure>,
    ]),
  );

  const contentsCopy = {
    heading: content.tocHeading,
    railLabel: reading.railLabel,
    openLabel: reading.openContentsLabel,
    backToTopLabel: reading.backToTopLabel,
  };
  const entries = contentsEntries(content);

  return (
    <ReadingMain>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: content.breadcrumbLabel, path: content.metadata.path },
            ],
            localeHref(LANDING_ORIGIN, '/', locale),
          ),
          articleJsonLd,
        ]}
      />

      <PageHeader
        variant="reading"
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        titleId={TITLE_ID}
        subtitle={content.hero.subtitle}
        meta={
          <>
            <span>
              {content.hero.authorName}
              {' · '}
              <a href={`mailto:${content.hero.authorEmail}`} className="link-quiet">
                {content.hero.authorEmail}
              </a>
            </span>
            <span className="tabular-nums">
              {content.hero.versionLabel} · {content.hero.dateLabel}
            </span>
            <span className="tabular-nums">
              {fillTemplate(reading.readingTimeTemplate, { minutes })}
            </span>
          </>
        }
        actions={
          <a
            href={content.hero.downloadHref}
            download
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            <Download aria-hidden />
            {content.hero.downloadLabel}
          </a>
        }
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:gap-16">
        <div className="lg:row-span-4">
          <ReadingContents
            entries={entries}
            copy={contentsCopy}
            articleId={ARTICLE_ID}
            topId={TITLE_ID}
            anchorId={CONTENTS_ID}
            railFooter={
              <a
                href={content.hero.downloadHref}
                download
                className="link-quiet inline-flex min-h-6 items-center gap-1.5 type-label text-muted-foreground hover:text-foreground"
              >
                <Download aria-hidden className="size-3.5" />
                {content.hero.downloadLabel}
              </a>
            }
          />
        </div>

        <section aria-labelledby="abstract-heading" className="min-w-0">
          <h2 id="abstract-heading" className="type-eyebrow text-subtle">
            {content.abstract.heading}
          </h2>
          <div className="mt-4 max-w-[var(--measure-prose)] space-y-4 type-body-lg text-foreground">
            {content.abstract.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <nav
          id={CONTENTS_ID}
          aria-labelledby="toc-heading"
          className="mt-12 border-y border-rule py-6 lg:hidden"
        >
          <h2 id="toc-heading" className="type-eyebrow text-subtle">
            {content.tocHeading}
          </h2>
          {/* Columns fill top to bottom, so both read 1, 2, 3 … down the page. */}
          <ol className="mt-4 gap-x-10 type-body-sm sm:columns-2">
            {entries.map((entry) => (
              <li key={entry.id} className="break-inside-avoid">
                <a
                  href={`#${entry.id}`}
                  className="link-quiet flex min-h-8 items-baseline gap-2.5 py-1 text-muted-foreground hover:text-foreground"
                >
                  <span aria-hidden className="w-5 shrink-0 tabular-nums text-subtle">
                    {entry.number}
                  </span>
                  <span>{entry.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article id={ARTICLE_ID} aria-labelledby={TITLE_ID} className="min-w-0">
          {content.sections.map((section, index) => {
            const headingId = `${section.id}-heading`;
            return (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={headingId}
                className={cn(
                  'scroll-mt-[var(--sticky-offset)]',
                  index === 0
                    ? 'mt-14 lg:mt-16'
                    : 'mt-14 border-t border-rule-faint pt-12 lg:mt-16 lg:pt-14',
                )}
              >
                <ReadingHeading
                  as="h2"
                  sectionId={section.id}
                  headingId={headingId}
                  number={isNumbered(section) ? section.number : undefined}
                  anchorLabel={fillTemplate(reading.headingLinkTemplate, {
                    title: section.heading,
                  })}
                >
                  {section.heading}
                </ReadingHeading>
                {section.blocks.length > 0 ? (
                  <div className="mt-5">
                    <Blocks
                      blocks={section.blocks}
                      context={{ headingId, sectionId: section.id, reading }}
                      figure={sectionFigures[section.id]}
                    />
                  </div>
                ) : null}
                {section.subsections?.length ? (
                  <div className="mt-10 space-y-10">
                    {section.subsections.map((subsection) => (
                      <SubsectionView
                        key={subsection.id}
                        subsection={subsection}
                        reading={reading}
                        figure={sectionFigures[subsection.id]}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}

          <section
            id={content.references.id}
            aria-labelledby="references-heading"
            className="mt-14 scroll-mt-[var(--sticky-offset)] border-t border-rule-faint pt-12 lg:mt-16 lg:pt-14"
          >
            <ReadingHeading
              as="h2"
              sectionId={content.references.id}
              headingId="references-heading"
              anchorLabel={fillTemplate(reading.headingLinkTemplate, {
                title: content.references.heading,
              })}
            >
              {content.references.heading}
            </ReadingHeading>
            <ol className="mt-5 max-w-[var(--measure-prose)] list-decimal space-y-3 pl-5 type-body-md text-muted-foreground marker:tabular-nums marker:text-subtle">
              {content.references.items.map((reference) => (
                <li key={reference.href} className="pl-1">
                  {reference.label}
                  {'. '}
                  <a
                    href={reference.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link inline break-all"
                  >
                    {reference.href}
                    <span className="sr-only"> {reading.newTabNote}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="ml-0.5 inline size-3.5 -translate-y-px text-subtle"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </section>

          <footer className="mt-16 max-w-[var(--measure-prose)] space-y-2 border-t border-rule pt-6 type-caption text-subtle">
            <p>{content.citation}</p>
            <p>{content.licenseNote}</p>
          </footer>
        </article>
      </div>
    </ReadingMain>
  );
}
