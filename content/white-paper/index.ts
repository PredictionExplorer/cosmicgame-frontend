import { whitePaperContentEn } from './en';
import type { WhitePaperContent } from './types';

export * from './types';
export { whitePaperContentEn };

/**
 * The white paper ships in English only for v1.0. A Chinese translation can
 * land in a later i18n sprint (docs/i18n/progress.md); until then every
 * locale receives the English paper and the page canonicalizes to the
 * English URL (see the progressive-activation note in utils/seo.ts).
 */
export function getWhitePaperContent(_locale: string): WhitePaperContent {
  return whitePaperContentEn;
}
