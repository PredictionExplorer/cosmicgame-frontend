import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { aboutContentEn } from './en';
import type { AboutContent } from './types';
import { aboutContentUk } from './uk';
import { aboutContentZh } from './zh';

export * from './types';
export { aboutContentEn, aboutContentUk, aboutContentZh };

const ABOUT_CONTENT: LocaleRecord<AboutContent> = {
  en: aboutContentEn,
  zh: aboutContentZh,
  uk: aboutContentUk,
};

export function getAboutContent(locale: string): AboutContent {
  return pickByLocale(ABOUT_CONTENT, locale);
}
