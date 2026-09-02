import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import {
  QUIZ_OPTION_IDS,
  QUIZ_STRUCTURE,
  type QuizQuestionTextBase,
  type QuizText,
} from './structure';
import { quizTextEn } from './text.en';
import { quizTextZh } from './text.zh';
import type { QuizContent, QuizOption, QuizQuestion, QuizTier, QuizTierId } from './types';
import { QUIZ_TIER_IDS } from './types';

/** Composes the locale-independent skeleton with one locale's copy. */
function buildQuizContent(text: QuizText): QuizContent {
  return {
    hub: text.hub,
    ui: text.ui,
    tiers: QUIZ_STRUCTURE.map((tier): QuizTier => {
      const tierText = text.tiers[tier.id];
      // Parity is enforced by QuizText's literal keys; the builder itself
      // only needs plain string lookups.
      const questionTexts = tierText.questions as Readonly<
        Record<string, QuizQuestionTextBase & { readonly funFact?: string }>
      >;
      return {
        id: tier.id,
        title: tierText.title,
        tagline: tierText.tagline,
        description: tierText.description,
        questions: tier.questions.map((question): QuizQuestion => {
          const questionText = questionTexts[question.id]!;
          return {
            id: question.id,
            prompt: questionText.prompt,
            options: QUIZ_OPTION_IDS.map(
              (optionId): QuizOption => ({ id: optionId, text: questionText.options[optionId] }),
            ),
            correctOptionId: question.correctOptionId,
            explanation: questionText.explanation,
            ...(questionText.funFact !== undefined ? { funFact: questionText.funFact } : {}),
            reference: { label: questionText.referenceLabel, href: question.referenceHref },
          };
        }),
      };
    }),
  };
}

export const quizContentEn: QuizContent = buildQuizContent(quizTextEn);
export const quizContentZh: QuizContent = buildQuizContent(quizTextZh);

const QUIZ_CONTENT: LocaleRecord<QuizContent> = {
  en: quizContentEn,
  zh: quizContentZh,
};

export function getQuizContent(locale: string): QuizContent {
  return pickByLocale(QUIZ_CONTENT, locale);
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
