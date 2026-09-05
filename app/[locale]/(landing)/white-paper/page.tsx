import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  WHITE_PAPER_DATE_ISO,
  WHITE_PAPER_VERSION,
  getWhitePaperContent,
  type WhitePaperBlock,
  type WhitePaperSection,
  type WhitePaperSubsection,
} from '@/content/white-paper';

import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { metadata } = getWhitePaperContent(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

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

function sectionTitle(section: WhitePaperSection): string {
  return /^\d+$/.test(section.number) ? `${section.number}. ${section.heading}` : section.heading;
}

function BlockView({ block }: { block: WhitePaperBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className="text-base leading-8 text-muted-foreground">{block.text}</p>;
    case 'list':
      return (
        <ul className="list-disc space-y-3 pl-5 text-base leading-8 text-muted-foreground marker:text-white/40">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'formula':
      return (
        <figure className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <code className="block break-words font-mono text-sm text-white/85">{block.formula}</code>
          {block.caption ? (
            <figcaption className="mt-2 text-sm text-white/50">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case 'note':
      return (
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6 text-white/60">
          {block.text}
        </p>
      );
    case 'table':
      return (
        <div>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-white/[0.05]">
                  {block.table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 font-semibold tracking-tight text-white"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.table.rows.map((row) => (
                  <tr key={row.join('|')} className="border-t border-white/[0.07] align-top">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${cellIndex}-${cell}`}
                        className={
                          cellIndex === 0
                            ? 'px-4 py-3 font-medium text-white/85'
                            : /^0x[0-9a-fA-F]{40}$/.test(cell)
                              ? 'break-all px-4 py-3 font-mono text-xs leading-5 text-white/70'
                              : 'px-4 py-3 leading-6 text-white/70'
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.table.footnote ? (
            <p className="mt-2 text-sm text-white/45">{block.table.footnote}</p>
          ) : null}
        </div>
      );
  }
}

function Blocks({ blocks }: { blocks: readonly WhitePaperBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <BlockView key={`${index}-${block.kind}`} block={block} />
      ))}
    </div>
  );
}

function SubsectionView({ subsection }: { subsection: WhitePaperSubsection }) {
  return (
    <section
      id={subsection.id}
      aria-labelledby={`${subsection.id}-heading`}
      className="scroll-mt-28"
    >
      <h3
        id={`${subsection.id}-heading`}
        className="font-display text-xl font-medium tracking-tight text-foreground"
      >
        {subsection.number} {subsection.heading}
      </h3>
      <div className="mt-4">
        <Blocks blocks={subsection.blocks} />
      </div>
    </section>
  );
}

export default async function WhitePaperPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getWhitePaperContent(locale);
  const inLanguage = jsonLdInLanguage(locale);
  const pageUrl = localeHref(LANDING_ORIGIN, content.metadata.path, locale);
  const pdfUrl = `${LANDING_ORIGIN}${content.hero.downloadHref}`;

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

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative mx-auto max-w-4xl px-4 pb-16 pt-12 sm:px-6 lg:pb-20 lg:pt-20"
    >
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

      <nav aria-label={content.breadcrumbs.ariaLabel} className="mb-8 text-sm text-white/60">
        <Link href="/" className="hover:text-white">
          {content.breadcrumbs.homeLabel}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{content.breadcrumbLabel}</span>
      </nav>

      <header>
        <p className="type-eyebrow text-primary/80">{content.hero.eyebrow}</p>
        <h1 className="mt-4 type-display-lg text-balance text-foreground">{content.hero.title}</h1>
        <p className="mt-3 text-xl text-white/70">{content.hero.subtitle}</p>
        <p className="mt-6 text-sm text-white/60">
          {content.hero.authorName}
          {' · '}
          <a
            href={`mailto:${content.hero.authorEmail}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {content.hero.authorEmail}
          </a>
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
          {content.hero.versionLabel} · {content.hero.dateLabel}
        </p>
        <div className="mt-7">
          <a
            href={content.hero.downloadHref}
            download
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0D0521] transition hover:bg-white/90"
          >
            <Download className="h-4 w-4" aria-hidden />
            {content.hero.downloadLabel}
          </a>
        </div>
      </header>

      <section
        aria-labelledby="abstract-heading"
        className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <h2
          id="abstract-heading"
          className="font-display text-xl font-medium tracking-tight text-foreground"
        >
          {content.abstract.heading}
        </h2>
        <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
          {content.abstract.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <nav
        aria-labelledby="toc-heading"
        className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <h2
          id="toc-heading"
          className="font-display text-xl font-medium tracking-tight text-foreground"
        >
          {content.tocHeading}
        </h2>
        <ol className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {content.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                {sectionTitle(section)}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`#${content.references.id}`}
              className="text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              {content.references.heading}
            </a>
          </li>
        </ol>
      </nav>

      <article className="mt-14 space-y-14">
        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-28"
          >
            <h2 id={`${section.id}-heading`} className="type-display-sm text-foreground">
              {sectionTitle(section)}
            </h2>
            {section.blocks.length > 0 ? (
              <div className="mt-5">
                <Blocks blocks={section.blocks} />
              </div>
            ) : null}
            {section.subsections?.length ? (
              <div className="mt-8 space-y-10">
                {section.subsections.map((subsection) => (
                  <SubsectionView key={subsection.id} subsection={subsection} />
                ))}
              </div>
            ) : null}
          </section>
        ))}

        <section
          id={content.references.id}
          aria-labelledby="references-heading"
          className="scroll-mt-28"
        >
          <h2 id="references-heading" className="type-display-sm text-foreground">
            {content.references.heading}
          </h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-base leading-8 text-muted-foreground marker:text-white/40">
            {content.references.items.map((reference) => (
              <li key={reference.href}>
                {reference.label}
                {'. '}
                <a
                  href={reference.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary underline-offset-4 hover:underline"
                >
                  {reference.href}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </article>

      <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-white/50">
        <p>{content.citation}</p>
        <p className="mt-2">{content.licenseNote}</p>
      </footer>
    </main>
  );
}
