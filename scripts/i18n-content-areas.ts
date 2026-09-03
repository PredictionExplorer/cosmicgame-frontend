/**
 * The long-form content areas a locale ships (docs/i18n/README.md §3.2), as
 * the public getters that resolve a locale's copy. Shared by the parity CLI
 * and its jest twin so both measure the same modules; the scaffold command
 * mirrors the same areas by walking `content/**` for `*.en.ts` modules.
 */

import { getAboutContent } from '../content/about';
import { getFaqContent } from '../content/faq';
import { getHowItWorksContent } from '../content/how-it-works';
import { getLandingContent } from '../content/landing';
import { getLearnContent } from '../content/learn';
import {
  getAuditsCopy,
  getPrivacyCopy,
  getRiskCopy,
  getSecurityCopy,
  getTermsCopy,
} from '../content/legal';
import { getQuizContent } from '../content/quiz';
import { getWhitePaperContent } from '../content/white-paper';

export interface ContentArea {
  /** Name used in reports (`legal/terms`). */
  readonly area: string;
  /** Resolves the area's copy for a locale; JSON-like data (strings, arrays, objects). */
  readonly read: (locale: string) => unknown;
}

export const CONTENT_AREAS: readonly ContentArea[] = [
  { area: 'about', read: getAboutContent },
  { area: 'landing', read: getLandingContent },
  { area: 'how-it-works', read: getHowItWorksContent },
  { area: 'faq', read: getFaqContent },
  { area: 'learn', read: getLearnContent },
  { area: 'quiz', read: getQuizContent },
  { area: 'white-paper', read: getWhitePaperContent },
  { area: 'legal/terms', read: getTermsCopy },
  { area: 'legal/privacy', read: getPrivacyCopy },
  { area: 'legal/audits', read: getAuditsCopy },
  { area: 'legal/security', read: getSecurityCopy },
  { area: 'legal/risk', read: getRiskCopy },
];
