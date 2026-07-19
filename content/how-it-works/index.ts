import { howItWorksContentEn } from './en';
import type { HowItWorksContent } from './types';
import { howItWorksContentZh } from './zh';

export * from './types';
export { howItWorksContentEn, howItWorksContentZh };

export function getHowItWorksContent(locale: string): HowItWorksContent {
  return locale.toLowerCase().split('-')[0] === 'zh' ? howItWorksContentZh : howItWorksContentEn;
}
