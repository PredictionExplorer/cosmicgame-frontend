import { getLearnSlugs } from '@/content/learn';
import { QUIZ_TIER_IDS, getQuizContent, quizContentEn } from '@/content/quiz';
import type { QuizContent, QuizTierId } from '@/content/quiz';
import { whitePaperContentEn, type WhitePaperContent } from '@/content/white-paper';

import { routing, TRANSLATED_LOCALES } from '@/i18n/routing';

/**
 * Structural guard for the knowledge quiz.
 *
 * The quiz is an educational surface: every question must resolve to exactly
 * one correct option and point at the white-paper section or learn article
 * that settles it, and every translated set must mirror the en set question
 * for question (same ids, same order, same correct answers) so the locales
 * never drift apart.
 */

const EXPECTED_TIER_SIZES: Record<QuizTierId, number> = {
  basic: 25,
  medium: 25,
  hard: 50,
};

// Widen the `as const` literal to the interface so optional fields
// (`subsections`) are visible on every section.
const whitePaper: WhitePaperContent = whitePaperContentEn;

const whitePaperAnchors = new Set<string>();
for (const section of whitePaper.sections) {
  whitePaperAnchors.add(section.id);
  for (const subsection of section.subsections ?? []) {
    whitePaperAnchors.add(subsection.id);
  }
}

const learnSlugs = new Set(getLearnSlugs());

function referenceResolves(href: string): boolean {
  if (href.startsWith('/white-paper#')) {
    return whitePaperAnchors.has(href.slice('/white-paper#'.length));
  }
  if (href.startsWith('/learn/')) {
    return learnSlugs.has(href.slice('/learn/'.length));
  }
  return false;
}

const locales: Array<[string, QuizContent]> = routing.locales.map((locale) => [
  locale,
  getQuizContent(locale),
]);

describe.each(locales)('quiz content (%s)', (_locale, content) => {
  it('has the three tiers in canonical order with pinned sizes', () => {
    expect(content.tiers.map((tier) => tier.id)).toEqual([...QUIZ_TIER_IDS]);
    for (const tier of content.tiers) {
      expect(tier.questions).toHaveLength(EXPECTED_TIER_SIZES[tier.id]);
    }
  });

  it('every question has exactly four options and one resolvable correct answer', () => {
    for (const tier of content.tiers) {
      for (const question of tier.questions) {
        const optionIds = question.options.map((option) => option.id);
        expect(question.options).toHaveLength(4);
        expect(new Set(optionIds).size).toBe(4);
        expect(optionIds).toContain(question.correctOptionId);
      }
    }
  });

  it('every question teaches: non-empty prompt, options, explanation, and fun fact when present', () => {
    for (const tier of content.tiers) {
      for (const question of tier.questions) {
        expect(question.prompt.trim()).not.toBe('');
        expect(question.explanation.trim()).not.toBe('');
        for (const option of question.options) {
          expect(option.text.trim()).not.toBe('');
        }
        if (question.funFact !== undefined) {
          expect(question.funFact.trim()).not.toBe('');
        }
      }
    }
  });

  it('question ids are unique across the whole quiz', () => {
    const ids = content.tiers.flatMap((tier) => tier.questions.map((question) => question.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every reference resolves to a white-paper section or a learn article', () => {
    for (const tier of content.tiers) {
      for (const question of tier.questions) {
        expect(question.reference.label.trim()).not.toBe('');
        if (!referenceResolves(question.reference.href)) {
          throw new Error(
            `${tier.id}/${question.id}: reference "${question.reference.href}" does not ` +
              'resolve to a known white-paper anchor or learn slug.',
          );
        }
      }
    }
  });
});

describe.each(TRANSLATED_LOCALES)('quiz en/%s parity', (locale) => {
  const translated = getQuizContent(locale);

  it('agrees with en on tier order, question order, correct answers, and references', () => {
    expect(translated.tiers.map((tier) => tier.id)).toEqual(
      quizContentEn.tiers.map((tier) => tier.id),
    );

    for (const [tierIndex, tierEn] of quizContentEn.tiers.entries()) {
      const tier = translated.tiers[tierIndex]!;
      expect(tier.questions.map((question) => question.id)).toEqual(
        tierEn.questions.map((question) => question.id),
      );

      for (const [questionIndex, questionEn] of tierEn.questions.entries()) {
        const question = tier.questions[questionIndex]!;
        expect(question.correctOptionId).toBe(questionEn.correctOptionId);
        expect(question.options.map((option) => option.id)).toEqual(
          questionEn.options.map((option) => option.id),
        );
        expect(question.reference.href).toBe(questionEn.reference.href);
        expect(question.funFact !== undefined).toBe(questionEn.funFact !== undefined);
      }
    }
  });

  it('runner ui exposes the same feedback variant counts as en', () => {
    expect(translated.ui.correctFeedback.length).toBe(quizContentEn.ui.correctFeedback.length);
    expect(translated.ui.incorrectFeedback.length).toBe(quizContentEn.ui.incorrectFeedback.length);
    expect(quizContentEn.ui.correctFeedback.length).toBeGreaterThanOrEqual(2);
    expect(quizContentEn.ui.incorrectFeedback.length).toBeGreaterThanOrEqual(2);
  });
});
