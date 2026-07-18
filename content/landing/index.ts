import { landingContentEn } from './en';
import type { LandingContent } from './types';
import { landingContentZh } from './zh';

export * from './types';
export { landingContentEn, landingContentZh };

export function getLandingContent(locale: string): LandingContent {
  return locale.toLowerCase().split('-')[0] === 'zh' ? landingContentZh : landingContentEn;
}
