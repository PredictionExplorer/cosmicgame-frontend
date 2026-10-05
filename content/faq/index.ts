import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import {
  FAQ_POPULAR_QUESTION_IDS,
  FAQ_STRUCTURE,
  type FAQItemText,
  type FAQText,
} from './structure';
import { faqTextEn } from './text.en';
import { faqTextJa } from './text.ja';
import { faqTextKo } from './text.ko';
import { faqTextUk } from './text.uk';
import { faqTextVi } from './text.vi';
import { faqTextZh } from './text.zh';
import { faqTextZhHk } from './text.zh-HK';
import { faqTextZhTw } from './text.zh-TW';
import type { FAQCategory, FAQContent, FAQItem } from './types';

export * from './types';
export * from './structure';
// Client components import `./lookup` directly: this module bundles every locale's copy.
export * from './lookup';

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
export const faqContentZhTw: FAQContent = buildFaqContent(faqTextZhTw);
export const faqContentZhHk: FAQContent = buildFaqContent(faqTextZhHk);
export const faqContentUk: FAQContent = buildFaqContent(faqTextUk);
export const faqContentKo: FAQContent = buildFaqContent(faqTextKo);
export const faqContentJa: FAQContent = buildFaqContent(faqTextJa);
export const faqContentVi: FAQContent = buildFaqContent(faqTextVi);

const FAQ_CONTENT: LocaleRecord<FAQContent> = {
  en: faqContentEn,
  zh: faqContentZh,
  'zh-TW': faqContentZhTw,
  'zh-HK': faqContentZhHk,
  uk: faqContentUk,
  ko: faqContentKo,
  ja: faqContentJa,
  vi: faqContentVi,
};

/** One locale's FAQ, on the server; the page passes it to the client as a prop. */
export function getFaqContent(locale: string): FAQContent {
  return pickByLocale(FAQ_CONTENT, locale);
}
