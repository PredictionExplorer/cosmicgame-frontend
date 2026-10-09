import type { FAQCategory, FAQContent, FAQItem } from './types';

/**
 * Lookups over one locale's FAQ content. This module imports no copy, so a
 * client component can use it without bundling every locale's text: the
 * page reads the reader's own content on the server (`getFaqContent`) and
 * hands it down as a prop. `content/faq/index.ts` re-exports these for
 * server code.
 */

/** A question together with the category it sits in. */
export interface FAQItemLocation {
  item: FAQItem;
  category: FAQCategory;
}

export function getAllFaqItems(content: FAQContent): FAQItem[] {
  return content.categories.flatMap((category) => category.items);
}

export function getTotalFaqQuestionCount(content: FAQContent): number {
  return content.categories.reduce((sum, category) => sum + category.items.length, 0);
}

export function findFaqItemById(content: FAQContent, id: string): FAQItemLocation | undefined {
  for (const category of content.categories) {
    const item = category.items.find((question) => question.id === id);
    if (item) return { item, category };
  }
  return undefined;
}

/** The question a URL fragment points at, by its legacy anchor or its id. */
export function findFaqItemByHash(content: FAQContent, hash: string): FAQItemLocation | undefined {
  const anchor = hash.replace('#', '');
  for (const category of content.categories) {
    const item = category.items.find(
      (question) => question.hashAnchor === anchor || question.id === anchor,
    );
    if (item) return { item, category };
  }
  return undefined;
}
