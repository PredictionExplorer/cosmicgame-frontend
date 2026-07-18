import { aboutContentEn } from './en';
import type { AboutContent } from './types';
import { aboutContentZh } from './zh';

export * from './types';
export { aboutContentEn, aboutContentZh };

export function getAboutContent(locale: string): AboutContent {
  return locale.toLowerCase().split('-')[0] === 'zh' ? aboutContentZh : aboutContentEn;
}
