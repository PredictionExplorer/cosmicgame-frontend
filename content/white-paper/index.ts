import { whitePaperContentEn } from './en';
import type { WhitePaperContent } from './types';
import { whitePaperContentZh } from './zh';

export * from './types';
export { whitePaperContentEn, whitePaperContentZh };

export function getWhitePaperContent(locale: string): WhitePaperContent {
  return locale.toLowerCase().split('-')[0] === 'zh' ? whitePaperContentZh : whitePaperContentEn;
}
