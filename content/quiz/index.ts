import { quizContentEn } from './en';
import type { QuizContent, QuizTier, QuizTierId } from './types';
import { QUIZ_TIER_IDS } from './types';
import { quizContentZh } from './zh';

const isChineseLocale = (locale: string): boolean =>
  locale.trim().toLowerCase().split(/[-_]/, 1)[0] === 'zh';

export { quizContentEn, quizContentZh };

export function getQuizContent(locale: string): QuizContent {
  return isChineseLocale(locale) ? quizContentZh : quizContentEn;
}

export function getQuizTier(tierId: string, locale: string): QuizTier | undefined {
  return getQuizContent(locale).tiers.find((tier) => tier.id === tierId);
}

export function isQuizTierId(value: string): value is QuizTierId {
  return (QUIZ_TIER_IDS as readonly string[]).includes(value);
}

export { QUIZ_PATH, QUIZ_TIER_IDS } from './types';

export type {
  QuizContent,
  QuizHubContent,
  QuizMasteryRank,
  QuizOption,
  QuizQuestion,
  QuizReference,
  QuizRunnerUi,
  QuizTier,
  QuizTierId,
} from './types';
