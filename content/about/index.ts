import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { aboutContentEn } from './en';
import type { AboutContent } from './types';
import { aboutContentZh } from './zh';

export * from './types';
export { aboutContentEn, aboutContentZh };

const ABOUT_CONTENT: LocaleRecord<AboutContent> = {
  en: aboutContentEn,
  zh: aboutContentZh,
};

export function getAboutContent(locale: string): AboutContent {
  return pickByLocale(ABOUT_CONTENT, locale);
}
