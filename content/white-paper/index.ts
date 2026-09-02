import { pickByLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';

import {
  WHITE_PAPER_REFERENCES_ID,
  WHITE_PAPER_SHARED,
  WHITE_PAPER_STRUCTURE,
  type WhitePaperText,
} from './structure';
import { whitePaperTextEn } from './text.en';
import { whitePaperTextUk } from './text.uk';
import { whitePaperTextZh } from './text.zh';
import {
  WHITE_PAPER_PATH,
  whitePaperPdfPath,
  type WhitePaperBlock,
  type WhitePaperContent,
  type WhitePaperSection,
  type WhitePaperSubsection,
} from './types';

export * from './types';
export * from './structure';

interface HeadedBlocksText {
  readonly heading: string;
  readonly blocks: readonly WhitePaperBlock[];
}

interface SectionTextLoose extends HeadedBlocksText {
  readonly subsections?: Readonly<Record<string, HeadedBlocksText>>;
}

/** Composes the locale-independent skeleton with one locale's copy. */
function buildWhitePaperContent(locale: AppLocale, text: WhitePaperText): WhitePaperContent {
  // Parity is enforced by WhitePaperText's literal keys and block-kind tuples;
  // the builder itself only needs plain string lookups.
  const sectionTexts = text.sections as Readonly<Record<string, SectionTextLoose>>;

  return {
    metadata: {
      title: text.metadata.title,
      description: text.metadata.description,
      path: WHITE_PAPER_PATH,
    },
    breadcrumbLabel: text.breadcrumbLabel,
    breadcrumbs: text.breadcrumbs,
    hero: {
      eyebrow: text.hero.eyebrow,
      title: WHITE_PAPER_SHARED.heroTitle,
      subtitle: text.hero.subtitle,
      authorName: WHITE_PAPER_SHARED.authorName,
      authorEmail: WHITE_PAPER_SHARED.authorEmail,
      versionLabel: text.hero.versionLabel,
      dateLabel: text.hero.dateLabel,
      downloadLabel: text.hero.downloadLabel,
      downloadHref: whitePaperPdfPath(locale),
    },
    abstract: text.abstract,
    tocHeading: text.tocHeading,
    sections: WHITE_PAPER_STRUCTURE.map((section): WhitePaperSection => {
      const sectionText = sectionTexts[section.id]!;
      return {
        id: section.id,
        number: section.number,
        heading: sectionText.heading,
        blocks: sectionText.blocks,
        ...('subsections' in section
          ? {
              subsections: section.subsections.map((subsection): WhitePaperSubsection => {
                const subsectionText = sectionText.subsections![subsection.id]!;
                return {
                  id: subsection.id,
                  number: subsection.number,
                  heading: subsectionText.heading,
                  blocks: subsectionText.blocks,
                };
              }),
            }
          : {}),
      };
    }),
    references: {
      id: WHITE_PAPER_REFERENCES_ID,
      heading: text.references.heading,
      items: text.references.items,
    },
    citation: WHITE_PAPER_SHARED.citation,
    licenseNote: text.licenseNote,
  };
}

export const whitePaperContentEn: WhitePaperContent = buildWhitePaperContent(
  'en',
  whitePaperTextEn,
);
export const whitePaperContentZh: WhitePaperContent = buildWhitePaperContent(
  'zh',
  whitePaperTextZh,
);
export const whitePaperContentUk: WhitePaperContent = buildWhitePaperContent(
  'uk',
  whitePaperTextUk,
);

const WHITE_PAPER_CONTENT: LocaleRecord<WhitePaperContent> = {
  en: whitePaperContentEn,
  zh: whitePaperContentZh,
  uk: whitePaperContentUk,
};

export function getWhitePaperContent(locale: string): WhitePaperContent {
  return pickByLocale(WHITE_PAPER_CONTENT, locale);
}
