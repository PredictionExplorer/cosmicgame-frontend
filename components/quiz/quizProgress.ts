import type { QuizQuestion, QuizRunnerUi, QuizTier, QuizTierId } from '@/content/quiz';

/**
 * The quiz's memory, kept in the reader's own browser.
 *
 * An attempt in progress lives in sessionStorage, so following a reference
 * (or reloading, or pressing Back) never costs the reader their run: the
 * runner offers to resume it. The best score per tier lives in localStorage,
 * a per-viewer convenience the hub shows on each tier card. Every access is
 * wrapped, so a private window or blocked site data simply means no memory.
 */

/** One answered question: the option the reader chose, and whether it was right. */
export interface QuizAnswer {
  questionId: string;
  chosenOptionId: string;
  correct: boolean;
}

/** A question with its options in this attempt's display order. */
export interface QuizAttemptQuestion {
  question: QuizQuestion;
  options: QuizQuestion['options'];
}

/** A run that can be resumed: its order, answers and position. */
export interface QuizAttempt {
  phase: 'running' | 'summary';
  questions: QuizAttemptQuestion[];
  answers: QuizAnswer[];
  currentIndex: number;
}

const ATTEMPT_VERSION = 1;

/** What sessionStorage holds for an attempt: ids only, so copy can change underneath it. */
interface StoredAttempt {
  v: typeof ATTEMPT_VERSION;
  phase: QuizAttempt['phase'];
  questionIds: string[];
  optionIdsByQuestion: Record<string, string[]>;
  answers: Array<{ questionId: string; chosenOptionId: string }>;
  currentIndex: number;
}

/** The minimal Storage surface the helpers use (sessionStorage, localStorage, a test double). */
export type QuizStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** sessionStorage key of a tier's attempt: per locale, since the copy is. */
export function attemptStorageKey(locale: string, tierId: QuizTierId): string {
  return `quiz:v${ATTEMPT_VERSION}:${locale}:${tierId}`;
}

/** localStorage key of a tier's best score: the question set is the same in every locale. */
export function bestScoreStorageKey(tierId: QuizTierId): string {
  return `quiz:best:v1:${tierId}`;
}

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith]!, result[index]!];
  }
  return result;
}

/** A fresh run: question order and each question's option order shuffled. */
export function buildAttempt(questions: readonly QuizQuestion[]): QuizAttempt {
  return {
    phase: 'running',
    questions: shuffled(questions).map((question) => ({
      question,
      options: shuffled(question.options),
    })),
    answers: [],
    currentIndex: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function restoreQuestions(
  questionIds: readonly string[],
  optionIdsByQuestion: Record<string, unknown>,
  tier: QuizTier,
): QuizAttemptQuestion[] | null {
  if (questionIds.length !== tier.questions.length) return null;
  if (new Set(questionIds).size !== questionIds.length) return null;
  const byId = new Map(tier.questions.map((question) => [question.id, question]));

  const questions: QuizAttemptQuestion[] = [];
  for (const id of questionIds) {
    const question = byId.get(id);
    const optionIds = optionIdsByQuestion[id];
    if (!question || !isStringArray(optionIds)) return null;
    if (optionIds.length !== question.options.length) return null;
    const optionsById = new Map(question.options.map((option) => [option.id, option]));
    const options: QuizQuestion['options'][number][] = [];
    for (const optionId of optionIds) {
      const option = optionsById.get(optionId);
      if (!option) return null;
      options.push(option);
    }
    questions.push({ question, options });
  }
  return questions;
}

function restoreAnswers(
  answers: readonly unknown[],
  questions: readonly QuizAttemptQuestion[],
): QuizAnswer[] | null {
  const restored: QuizAnswer[] = [];
  for (const [index, answer] of answers.entries()) {
    if (!isRecord(answer)) return null;
    const { questionId, chosenOptionId } = answer;
    if (typeof questionId !== 'string' || typeof chosenOptionId !== 'string') return null;
    // Answers follow the run's order: the nth answer belongs to the nth question.
    const entry = questions[index];
    if (!entry || entry.question.id !== questionId) return null;
    if (!entry.options.some((option) => option.id === chosenOptionId)) return null;
    restored.push({
      questionId,
      chosenOptionId,
      correct: chosenOptionId === entry.question.correctOptionId,
    });
  }
  return restored;
}

/**
 * Rebuilds a stored attempt against the tier as it is now. Anything that no
 * longer fits (a question or option that was removed, a changed question
 * count, an answer out of order) discards the whole run rather than resuming
 * something the reader never saw.
 */
export function restoreAttempt(raw: unknown, tier: QuizTier): QuizAttempt | null {
  if (!isRecord(raw) || raw.v !== ATTEMPT_VERSION) return null;
  const { phase, questionIds, optionIdsByQuestion, answers, currentIndex } = raw;
  if (phase !== 'running' && phase !== 'summary') return null;
  if (!isStringArray(questionIds) || !isRecord(optionIdsByQuestion) || !Array.isArray(answers)) {
    return null;
  }
  if (typeof currentIndex !== 'number' || !Number.isInteger(currentIndex)) return null;

  const questions = restoreQuestions(questionIds, optionIdsByQuestion, tier);
  if (!questions) return null;
  const restoredAnswers = restoreAnswers(answers, questions);
  if (!restoredAnswers) return null;

  if (currentIndex < 0 || currentIndex >= questions.length) return null;
  // The current question is the next unanswered one, or the last answered one
  // while its explanation is still showing.
  const answered = restoredAnswers.length;
  if (currentIndex !== answered && currentIndex !== answered - 1) return null;
  if (phase === 'summary' && answered !== questions.length) return null;

  return { phase, questions, answers: restoredAnswers, currentIndex };
}

function toStored(attempt: QuizAttempt): StoredAttempt {
  return {
    v: ATTEMPT_VERSION,
    phase: attempt.phase,
    questionIds: attempt.questions.map((entry) => entry.question.id),
    optionIdsByQuestion: Object.fromEntries(
      attempt.questions.map((entry) => [
        entry.question.id,
        entry.options.map((option) => option.id),
      ]),
    ),
    answers: attempt.answers.map(({ questionId, chosenOptionId }) => ({
      questionId,
      chosenOptionId,
    })),
    currentIndex: attempt.currentIndex,
  };
}

/** The saved run for this tier, or null (none, unreadable, or no longer valid). */
export function readSavedAttempt(
  storage: QuizStorage | null,
  key: string,
  tier: QuizTier,
): QuizAttempt | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const attempt = restoreAttempt(JSON.parse(raw), tier);
    if (!attempt) storage.removeItem(key);
    return attempt;
  } catch {
    return null;
  }
}

/**
 * Where a saved run stands, without the question copy: enough for the hub's
 * "In progress" line. The runner still validates the run in full on resume.
 */
export function peekSavedProgress(
  storage: QuizStorage | null,
  key: string,
  total: number,
): { current: number } | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.v !== ATTEMPT_VERSION || parsed.phase !== 'running') {
      return null;
    }
    const { currentIndex, questionIds } = parsed;
    if (!isStringArray(questionIds) || questionIds.length !== total) return null;
    if (typeof currentIndex !== 'number' || !Number.isInteger(currentIndex)) return null;
    if (currentIndex < 0 || currentIndex >= total) return null;
    return { current: currentIndex + 1 };
  } catch {
    return null;
  }
}

export function saveAttempt(storage: QuizStorage | null, key: string, attempt: QuizAttempt): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(toStored(attempt)));
  } catch {
    // Storage full or blocked: the run is simply not remembered.
  }
}

export function clearSavedAttempt(storage: QuizStorage | null, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Nothing to clear.
  }
}

/** A tier's best result: correct answers out of the tier's size. */
export interface QuizBestScore {
  correct: number;
  total: number;
}

export function readBestScore(
  storage: QuizStorage | null,
  tierId: QuizTierId,
  total: number,
): QuizBestScore | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(bestScoreStorageKey(tierId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const { correct } = parsed;
    // A score from a differently sized tier no longer means anything.
    if (parsed.total !== total || typeof correct !== 'number') return null;
    if (!Number.isInteger(correct) || correct < 0 || correct > total) return null;
    return { correct, total };
  } catch {
    return null;
  }
}

/** Keeps the higher of the stored and the new score, and returns the best after the update. */
export function recordBestScore(
  storage: QuizStorage | null,
  tierId: QuizTierId,
  score: QuizBestScore,
): QuizBestScore {
  const previous = readBestScore(storage, tierId, score.total);
  if (previous && previous.correct >= score.correct) return previous;
  if (storage) {
    try {
      storage.setItem(bestScoreStorageKey(tierId), JSON.stringify(score));
    } catch {
      // Not remembered; the summary still shows this run's score.
    }
  }
  return score;
}

/** The browser's storage of one kind, or null where it is unavailable or blocked. */
export function browserStorage(kind: 'session' | 'local'): QuizStorage | null {
  try {
    if (typeof window === 'undefined') return null;
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export type QuizRankKey = keyof QuizRunnerUi['summary']['ranks'];

/** The mastery ranks, highest first, each with its minimum share of correct answers. */
export const RANK_BANDS = [
  { threshold: 0.95, rank: 'cartographer' },
  { threshold: 0.75, rank: 'scholar' },
  { threshold: 0.5, rank: 'student' },
  { threshold: 0, rank: 'reader' },
] as const satisfies ReadonlyArray<{ threshold: number; rank: QuizRankKey }>;

export function rankFor(correct: number, total: number): QuizRankKey {
  const ratio = total === 0 ? 0 : correct / total;
  return RANK_BANDS.find((band) => ratio >= band.threshold)?.rank ?? 'reader';
}

/** The share of correct answers from which the runner suggests the next tier. */
export const NEXT_TIER_THRESHOLD = 0.5;

/** Reading a question, choosing and reading the explanation: about 20 seconds each. */
const SECONDS_PER_QUESTION = 20;

/** The estimated minutes a tier takes, never less than two. */
export function estimatedMinutes(questionCount: number): number {
  return Math.max(2, Math.round((questionCount * SECONDS_PER_QUESTION) / 60));
}

export { fillTemplate } from '@/components/reading/template';
