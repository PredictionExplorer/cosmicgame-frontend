import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { aboutContentEn } from './en';
import { aboutContentJa } from './ja';
import { aboutContentKo } from './ko';
import type { AboutContent } from './types';
import { aboutContentUk } from './uk';
import { aboutContentZh } from './zh';
import { aboutContentZhHk } from './zh-HK';
import { aboutContentZhTw } from './zh-TW';

export * from './types';
export {
  aboutContentEn,
  aboutContentJa,
  aboutContentKo,
  aboutContentUk,
  aboutContentZh,
  aboutContentZhHk,
  aboutContentZhTw,
};

const ABOUT_CONTENT: LocaleRecord<AboutContent> = {
  en: aboutContentEn,
  zh: aboutContentZh,
  'zh-TW': aboutContentZhTw,
  'zh-HK': aboutContentZhHk,
  uk: aboutContentUk,
  ko: aboutContentKo,
  ja: aboutContentJa,
};

export function getAboutContent(locale: string): AboutContent {
  return pickByLocale(ABOUT_CONTENT, locale);
}
