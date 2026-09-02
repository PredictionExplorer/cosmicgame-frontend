import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import {
  FAQ_POPULAR_QUESTION_IDS,
  FAQ_STRUCTURE,
  type FAQItemText,
  type FAQText,
} from './structure';
import { faqTextEn } from './text.en';
import { faqTextZh } from './text.zh';
import type { FAQCategory, FAQContent, FAQItem } from './types';

export * from './types';
export * from './structure';

/** Composes the locale-independent skeleton with one locale's copy. */
function buildFaqContent(text: FAQText): FAQContent {
  return {
    categories: FAQ_STRUCTURE.map((category): FAQCategory => {
      const categoryText = text[category.id];
      // Parity is enforced by FAQText's literal keys; the builder itself only
      // needs plain string lookups.
      const itemTexts = categoryText.items as Readonly<Record<string, FAQItemText>>;
      return {
        id: category.id,
        icon: category.icon,
        title: categoryText.title,
        description: categoryText.description,
        items: category.items.map(
          (item): FAQItem => ({
            id: item.id,
            ...itemTexts[item.id]!,
            ...('hashAnchor' in item ? { hashAnchor: item.hashAnchor } : {}),
          }),
        ),
      };
    }),
    popularQuestionIds: FAQ_POPULAR_QUESTION_IDS,
  };
}

export const faqContentEn: FAQContent = buildFaqContent(faqTextEn);
export const faqContentZh: FAQContent = buildFaqContent(faqTextZh);

const FAQ_CONTENT: LocaleRecord<FAQContent> = {
  en: faqContentEn,
  zh: faqContentZh,
};

export function getFaqContent(locale: string): FAQContent {
  return pickByLocale(FAQ_CONTENT, locale);
}

export function getAllFaqItems(content: FAQContent): FAQItem[] {
  return content.categories.flatMap((category) => category.items);
}

export function getTotalFaqQuestionCount(content: FAQContent): number {
  return content.categories.reduce((sum, category) => sum + category.items.length, 0);
}

export function findFaqItemById(
  content: FAQContent,
  id: string,
): { item: FAQItem; category: FAQCategory } | undefined {
  for (const category of content.categories) {
    const item = category.items.find((question) => question.id === id);
    if (item) return { item, category };
  }
  return undefined;
}

export function findFaqItemByHash(
  content: FAQContent,
  hash: string,
): { item: FAQItem; category: FAQCategory } | undefined {
  const anchor = hash.replace('#', '');
  for (const category of content.categories) {
    const item = category.items.find(
      (question) => question.hashAnchor === anchor || question.id === anchor,
    );
    if (item) return { item, category };
  }
  return undefined;
}
