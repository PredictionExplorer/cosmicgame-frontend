import type { ImageResponse } from 'next/og';

import { getLearnArticle, getLearnContent } from '@/content/learn';

import { fillTemplate } from '@/components/reading/template';
import { latestArtworkCard } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

import { readingShareCard } from '../readingCard';

/** The card's alt text: the guide's title. */
export function learnArticleCardAlt(locale: string, slug: string): string {
  return getLearnArticle(slug, locale)?.h1 ?? getOgCopy(locale, 'default').alt;
}

/** One guide's card: its Signature, its title and its place on the reading path. */
export async function learnArticleCard(locale: string, slug: string): Promise<ImageResponse> {
  const article = getLearnArticle(slug, locale);
  if (!article) return latestArtworkCard(locale, 'default', 'landing');
  const { articles, articleUi } = getLearnContent(locale);
  return readingShareCard(
    locale,
    {
      eyebrow: articleUi.breadcrumbs.learnLabel,
      title: article.h1,
      fact: fillTemplate(articleUi.guideTemplate, {
        number: articles.findIndex((candidate) => candidate.slug === article.slug) + 1,
        total: articles.length,
      }),
    },
    article.plate,
  );
}
