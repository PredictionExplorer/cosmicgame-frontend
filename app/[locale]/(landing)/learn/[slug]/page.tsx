import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { learnArticles, getLearnArticle } from '@/content/learn';

import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function sectionId(articleSlug: string, heading: string): string {
  return `${articleSlug}-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function generateStaticParams() {
  return learnArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) return {};

  return createMetadata(article.title, article.description, undefined, `/learn/${article.slug}`, {
    canonicalHost: 'landing',
  });
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const article = getLearnArticle(slug);
  if (!article) notFound();

  const url = `${LANDING_ORIGIN}/learn/${article.slug}`;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': article.schemaType,
    headline: article.h1,
    description: article.description,
    url,
    datePublished: article.updated,
    dateModified: article.updated,
    author: {
      '@type': 'Organization',
      name: 'Cosmic Signature',
      url: `${LANDING_ORIGIN}/`,
    },
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
    mainEntityOfPage: url,
  };

  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-4xl px-6 py-24 lg:py-32">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: 'Learn', path: '/learn' },
              { name: article.h1, path: `/learn/${article.slug}` },
            ],
            LANDING_ORIGIN,
          ),
          articleJsonLd,
        ]}
      />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/60">
        <Link href="/" className="hover:text-white">
          Cosmic Signature
        </Link>
        <span className="mx-2">/</span>
        <Link href="/learn" className="hover:text-white">
          Learn
        </Link>
      </nav>

      <article>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">
          Cosmic Signature Learn
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {article.h1}
        </h1>
        <p className="mt-6 text-lg leading-8 text-white/78">{article.summary}</p>
        <p className="mt-4 text-sm text-white/50">
          Last updated: <time dateTime={article.updated}>{article.updated}</time> · Published by
          Cosmic Signature
        </p>

        <div className="mt-12 space-y-10">
          {article.sections.map((section) => (
            <section
              key={section.heading}
              aria-labelledby={sectionId(article.slug, section.heading)}
            >
              <h2
                id={sectionId(article.slug, section.heading)}
                className="text-2xl font-semibold tracking-tight text-white"
              >
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-white/72">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <aside className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Related Cosmic Signature resources</h2>
        <ul className="mt-4 space-y-3">
          {article.related.map((link) => (
            <li key={link.href}>
              <a
                href={localizeCrossHostHref(link.href, locale)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
