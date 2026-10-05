import { ABOUT_PLATE_TOKEN_ID, getAboutContent } from '@/content/about';
import { getLearnArticle, getLearnContent, getLearnSlugs } from '@/content/learn';
import { getQuizContent } from '@/content/quiz';
import { getWhitePaperContent } from '@/content/white-paper';

import { fillTemplate } from '@/components/reading/template';

/**
 * What each reading page's share card draws, in one place: the card routes
 * render it (./readingCard.tsx), and the share-card font subsets are cut
 * from it (scripts/build-og-fonts-core.ts `ogRenderedText`), so every glyph
 * a card draws is in the faces that draw it. Server-safe, with no image or
 * font code, so the subset build can import it.
 */

export interface ReadingCardCopy {
  eyebrow: string;
  title: string;
  subhead?: string;
  fact?: string;
}

export interface ReadingCard {
  copy: ReadingCardCopy;
  /** The Signature beside the copy (a token in components/reading/signaturePlates). */
  plate: number;
  /** The image's alt text when the card draws this copy. */
  alt: string;
}

/** The quiz card's Signature, shared by the hub and its tiers. */
const QUIZ_PLATE = 40;
/** The white paper's card Signature (the paper's §6 figure shows #23 and #24). */
const WHITE_PAPER_PLATE = 24;

export function aboutReadingCard(locale: string): ReadingCard {
  // The card's wordmark already names Cosmic Signature: the eyebrow is the page's short name.
  const { breadcrumbLabel, heading } = getAboutContent(locale);
  return {
    copy: { eyebrow: breadcrumbLabel, title: heading },
    plate: ABOUT_PLATE_TOKEN_ID,
    alt: heading,
  };
}

export function quizReadingCard(locale: string): ReadingCard {
  const { hub } = getQuizContent(locale);
  return { copy: { eyebrow: hub.eyebrow, title: hub.h1 }, plate: QUIZ_PLATE, alt: hub.h1 };
}

export function whitePaperReadingCard(locale: string): ReadingCard {
  const { hero } = getWhitePaperContent(locale);
  return {
    copy: {
      eyebrow: hero.eyebrow,
      title: hero.title,
      subhead: hero.subtitle,
      fact: `${hero.versionLabel} · ${hero.dateLabel}`,
    },
    plate: WHITE_PAPER_PLATE,
    alt: `${hero.title}: ${hero.subtitle}`,
  };
}

/** One guide's card: its title and its place on the reading path; `null` for an unknown slug. */
export function learnArticleReadingCard(locale: string, slug: string): ReadingCard | null {
  const article = getLearnArticle(slug, locale);
  if (!article) return null;
  const { articles, articleUi } = getLearnContent(locale);
  return {
    copy: {
      eyebrow: articleUi.breadcrumbs.learnLabel,
      title: article.h1,
      fact: fillTemplate(articleUi.guideTemplate, {
        number: articles.findIndex((candidate) => candidate.slug === article.slug) + 1,
        total: articles.length,
      }),
    },
    plate: article.plate,
    alt: article.h1,
  };
}

/** Every reading card a locale publishes: About, the quiz, the white paper and each guide. */
export function readingCards(locale: string): ReadingCard[] {
  return [
    aboutReadingCard(locale),
    quizReadingCard(locale),
    whitePaperReadingCard(locale),
    ...getLearnSlugs().flatMap((slug) => learnArticleReadingCard(locale, slug) ?? []),
  ];
}

/** Every string a locale's reading cards draw, as written (the card cases eyebrows itself). */
export function readingCardTexts(locale: string): string[] {
  return readingCards(locale).flatMap(({ copy }) =>
    [copy.eyebrow, copy.title, copy.subhead, copy.fact].filter(
      (text): text is string => text !== undefined,
    ),
  );
}
