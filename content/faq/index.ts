import { faqContentEn } from './en';
import type { FAQCategory, FAQContent, FAQItem } from './types';
import { faqContentZh } from './zh';

export * from './types';
export { faqContentEn, faqContentZh };

export function getFaqContent(locale: string): FAQContent {
  return locale.toLowerCase().split('-')[0] === 'zh' ? faqContentZh : faqContentEn;
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
