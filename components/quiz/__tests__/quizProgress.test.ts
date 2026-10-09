import { quizContentEn } from '@/content/quiz';

import {
  attemptStorageKey,
  buildAttempt,
  estimatedMinutes,
  peekSavedProgress,
  rankFor,
  readBestScore,
  readSavedAttempt,
  recordBestScore,
  restoreAttempt,
  saveAttempt,
  type QuizStorage,
} from '@/components/quiz/quizProgress';

const tier = quizContentEn.tiers[0]!;

function memoryStorage(): QuizStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function answered(count: number) {
  const attempt = buildAttempt(tier.questions);
  attempt.answers = attempt.questions.slice(0, count).map((entry) => ({
    questionId: entry.question.id,
    chosenOptionId: entry.options[0]!.id,
    correct: entry.options[0]!.id === entry.question.correctOptionId,
  }));
  attempt.currentIndex = Math.min(count, attempt.questions.length - 1);
  return attempt;
}

describe('quiz progress', () => {
  it('round-trips a run through storage, including its shuffled order', () => {
    const storage = memoryStorage();
    const key = attemptStorageKey('en', tier.id);
    const attempt = answered(3);
    saveAttempt(storage, key, attempt);

    const restored = readSavedAttempt(storage, key, tier);
    expect(restored).not.toBeNull();
    expect(restored!.questions.map((entry) => entry.question.id)).toEqual(
      attempt.questions.map((entry) => entry.question.id),
    );
    expect(restored!.questions[0]!.options.map((option) => option.id)).toEqual(
      attempt.questions[0]!.options.map((option) => option.id),
    );
    expect(restored!.answers).toEqual(attempt.answers);
    expect(restored!.currentIndex).toBe(3);
  });

  it('keys runs per locale and tier', () => {
    expect(attemptStorageKey('en', 'basic')).toBe('quiz:v1:en:basic');
    expect(attemptStorageKey('zh-TW', 'hard')).toBe('quiz:v1:zh-TW:hard');
  });

  it('recomputes correctness from the tier rather than trusting storage', () => {
    const attempt = answered(1);
    const stored = {
      v: 1,
      phase: 'running',
      questionIds: attempt.questions.map((entry) => entry.question.id),
      optionIdsByQuestion: Object.fromEntries(
        attempt.questions.map((entry) => [entry.question.id, entry.options.map((o) => o.id)]),
      ),
      answers: [
        {
          questionId: attempt.questions[0]!.question.id,
          chosenOptionId: attempt.questions[0]!.question.correctOptionId,
          correct: false,
        },
      ],
      currentIndex: 1,
    };
    expect(restoreAttempt(stored, tier)!.answers[0]!.correct).toBe(true);
  });

  it.each([
    ['another version', { v: 2 }],
    ['a missing question', { questionIds: ['nope'] }],
    ['an answer out of order', { answersFrom: 1 }],
    ['a position past the answers', { currentIndex: 5 }],
    ['a summary with questions left', { phase: 'summary' }],
  ])('discards a run with %s', (_name, change) => {
    const attempt = answered(2);
    const base: Record<string, unknown> = {
      v: 1,
      phase: 'running',
      questionIds: attempt.questions.map((entry) => entry.question.id),
      optionIdsByQuestion: Object.fromEntries(
        attempt.questions.map((entry) => [entry.question.id, entry.options.map((o) => o.id)]),
      ),
      answers: attempt.answers.map(({ questionId, chosenOptionId }) => ({
        questionId,
        chosenOptionId,
      })),
      currentIndex: 2,
    };
    const { answersFrom, ...rest } = change as { answersFrom?: number } & Record<string, unknown>;
    const stored = { ...base, ...rest };
    if (answersFrom !== undefined) {
      stored.answers = (base.answers as unknown[]).slice(answersFrom);
    }
    expect(restoreAttempt(stored, tier)).toBeNull();
  });

  it('removes an unusable saved run and survives unreadable storage', () => {
    const storage = memoryStorage();
    const key = attemptStorageKey('en', tier.id);
    storage.setItem(key, '{not json');
    expect(readSavedAttempt(storage, key, tier)).toBeNull();

    storage.setItem(key, JSON.stringify({ v: 1, phase: 'running' }));
    expect(readSavedAttempt(storage, key, tier)).toBeNull();
    expect(storage.data.has(key)).toBe(false);

    const throwing: QuizStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readSavedAttempt(throwing, key, tier)).toBeNull();
    expect(() => saveAttempt(throwing, key, answered(1))).not.toThrow();
    expect(readSavedAttempt(null, key, tier)).toBeNull();
  });

  it('peeks at a run in progress for the hub without the copy', () => {
    const storage = memoryStorage();
    const key = attemptStorageKey('en', tier.id);
    saveAttempt(storage, key, answered(4));
    expect(peekSavedProgress(storage, key, tier.questions.length)).toEqual({ current: 5 });
    expect(peekSavedProgress(storage, key, tier.questions.length + 1)).toBeNull();

    saveAttempt(storage, key, { ...answered(tier.questions.length), phase: 'summary' });
    expect(peekSavedProgress(storage, key, tier.questions.length)).toBeNull();
  });

  it('keeps the best score per tier and ignores scores from a resized tier', () => {
    const storage = memoryStorage();
    expect(recordBestScore(storage, 'basic', { correct: 12, total: 25 })).toEqual({
      correct: 12,
      total: 25,
    });
    expect(recordBestScore(storage, 'basic', { correct: 9, total: 25 })).toEqual({
      correct: 12,
      total: 25,
    });
    expect(recordBestScore(storage, 'basic', { correct: 20, total: 25 })).toEqual({
      correct: 20,
      total: 25,
    });
    expect(readBestScore(storage, 'basic', 25)).toEqual({ correct: 20, total: 25 });
    expect(readBestScore(storage, 'basic', 30)).toBeNull();
    expect(readBestScore(storage, 'medium', 25)).toBeNull();
  });

  it('ranks by the share of correct answers', () => {
    expect(rankFor(0, 25)).toBe('reader');
    expect(rankFor(12, 25)).toBe('reader');
    expect(rankFor(13, 25)).toBe('student');
    expect(rankFor(19, 25)).toBe('scholar');
    expect(rankFor(24, 25)).toBe('cartographer');
    expect(rankFor(0, 0)).toBe('reader');
  });

  it('estimates the time a tier takes', () => {
    expect(estimatedMinutes(25)).toBe(8);
    expect(estimatedMinutes(50)).toBe(17);
    expect(estimatedMinutes(1)).toBe(2);
  });
});
