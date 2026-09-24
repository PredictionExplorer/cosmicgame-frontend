'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BookOpen, Check, RotateCcw, Sparkles, X } from 'lucide-react';

import type { QuizRunnerUi, QuizTier } from '@/content/quiz';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { fadeRise, slideInRight, useMotionVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { revealElement, revealTop } from '@/components/reading/scrolling';

import { RankLadder } from './RankLadder';
import {
  NEXT_TIER_THRESHOLD,
  attemptStorageKey,
  browserStorage,
  buildAttempt,
  clearSavedAttempt,
  fillTemplate,
  rankFor,
  readSavedAttempt,
  recordBestScore,
  saveAttempt,
  type QuizAttempt,
  type QuizAttemptQuestion,
  type QuizBestScore,
  type QuizRankKey,
} from './quizProgress';

export interface QuizNextTier {
  title: string;
  href: string;
}

export interface QuizRunnerProps {
  tier: QuizTier;
  ui: QuizRunnerUi;
  /** The active locale: it keys the saved run, whose copy is per locale. */
  locale: string;
  hubHref: string;
  /** Where each rank starts, formatted for the locale ("From 50%"). */
  rankFloors: Readonly<Record<QuizRankKey, string | null>>;
  /** The next tier, suggested from half the answers right. */
  nextTier?: QuizNextTier;
  /** `{correct}` and `{total}`: the reader's best result, shown under the score. */
  bestTemplate: string;
}

type Phase = 'intro' | 'running' | 'summary';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

/** Elements that keep their own Enter and digit behaviour. */
const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, summary, [role="button"], [contenteditable]:not([contenteditable="false"])';

function trailingStreak(attempt: QuizAttempt): number {
  let streak = 0;
  for (let index = attempt.answers.length - 1; index >= 0; index -= 1) {
    if (!attempt.answers[index]!.correct) break;
    streak += 1;
  }
  return streak;
}

function answerFor(attempt: QuizAttempt, questionId: string) {
  return attempt.answers.find((answer) => answer.questionId === questionId);
}

/** The icon, the word for screen readers and the colours of an answered option. */
function optionState(entry: QuizAttemptQuestion, optionId: string, chosenOptionId?: string) {
  if (chosenOptionId === undefined) return 'open' as const;
  if (optionId === entry.question.correctOptionId) return 'correct' as const;
  if (optionId === chosenOptionId) return 'chosen' as const;
  return 'other' as const;
}

/** A link that opens in a new tab, so the attempt stays where it is. */
function ReferenceLink({
  href,
  children,
  newTabNote,
  className,
}: {
  href: string;
  children: React.ReactNode;
  newTabNote: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('link inline-flex min-h-6 items-start gap-1.5 type-body-sm', className)}
    >
      <BookOpen aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        {children}
        <span className="sr-only"> {newTabNote}</span>
      </span>
      <ArrowUpRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-subtle" />
    </Link>
  );
}

export function QuizRunner({
  tier,
  ui,
  locale,
  hubHref,
  rankFloors,
  nextTier,
  bestTemplate,
}: QuizRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  /** A run this browser saved earlier, offered on the start card. */
  const [saved, setSaved] = useState<QuizAttempt | null>(null);
  const [best, setBest] = useState<QuizBestScore | null>(null);

  const storageKey = attemptStorageKey(locale, tier.id);
  const questionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);
  /** What receives focus after the next render: the new question, its feedback or the summary. */
  const pendingFocus = useRef<'question' | 'feedback' | 'summary' | null>(null);

  const cardVariants = useMotionVariants(slideInRight);
  const summaryVariants = useMotionVariants(fadeRise);

  const total = tier.questions.length;

  // Saved runs are read after mount: the server render has no storage, and
  // reading it during render would not match the HTML it sent.
  useEffect(() => {
    setSaved(readSavedAttempt(browserStorage('session'), storageKey, tier));
  }, [storageKey, tier]);

  // Every change to the run is remembered, so a reload or a reference link
  // never costs the reader their place.
  useEffect(() => {
    if (!attempt || phase === 'intro') return;
    saveAttempt(browserStorage('session'), storageKey, attempt);
  }, [attempt, phase, storageKey]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === 'question') {
      revealTop(questionRef.current);
      headingRef.current?.focus({ preventScroll: true });
    } else if (target === 'feedback') {
      revealElement(feedbackRef.current);
      feedbackRef.current?.focus({ preventScroll: true });
    } else {
      revealTop(summaryHeadingRef.current);
      summaryHeadingRef.current?.focus({ preventScroll: true });
    }
  });

  const begin = useCallback(() => {
    clearSavedAttempt(browserStorage('session'), storageKey);
    setSaved(null);
    setAttempt(buildAttempt(tier.questions));
    setPhase('running');
    pendingFocus.current = 'question';
  }, [storageKey, tier.questions]);

  const resume = useCallback(() => {
    if (!saved) return;
    setAttempt(saved);
    setSaved(null);
    if (saved.phase === 'summary') {
      setBest(recordBestScore(browserStorage('local'), tier.id, scoreOf(saved)));
      setPhase('summary');
      pendingFocus.current = 'summary';
    } else {
      setPhase('running');
      pendingFocus.current = 'question';
    }
  }, [saved, tier.id]);

  const current = attempt ? attempt.questions[attempt.currentIndex] : undefined;
  const currentAnswer = attempt && current ? answerFor(attempt, current.question.id) : undefined;

  const choose = useCallback(
    (optionId: string) => {
      if (!current || currentAnswer) return;
      setAttempt((previous) =>
        previous
          ? {
              ...previous,
              answers: [
                ...previous.answers,
                {
                  questionId: current.question.id,
                  chosenOptionId: optionId,
                  correct: optionId === current.question.correctOptionId,
                },
              ],
            }
          : previous,
      );
      pendingFocus.current = 'feedback';
    },
    [current, currentAnswer],
  );

  const advance = useCallback(() => {
    if (!attempt || !currentAnswer) return;
    if (attempt.currentIndex + 1 >= attempt.questions.length) {
      const finished: QuizAttempt = { ...attempt, phase: 'summary' };
      setAttempt(finished);
      setBest(recordBestScore(browserStorage('local'), tier.id, scoreOf(finished)));
      setPhase('summary');
      pendingFocus.current = 'summary';
    } else {
      setAttempt({ ...attempt, currentIndex: attempt.currentIndex + 1 });
      pendingFocus.current = 'question';
    }
  }, [attempt, currentAnswer, tier.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      // Links, buttons and fields keep their native keyboard behaviour,
      // including the site's skip link and the quiz's own reference links.
      if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) return;
      if (phase === 'intro' && event.key === 'Enter') {
        event.preventDefault();
        if (saved) resume();
        else begin();
        return;
      }
      if (phase !== 'running' || !current) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        advance();
        return;
      }
      const digit = Number.parseInt(event.key, 10);
      const option = digit >= 1 && digit <= 4 ? current.options[digit - 1] : undefined;
      if (option) {
        event.preventDefault();
        choose(option.id);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, begin, choose, current, phase, resume, saved]);

  const correctCount = useMemo(
    () => attempt?.answers.filter((answer) => answer.correct).length ?? 0,
    [attempt],
  );

  if (phase === 'intro' || !attempt) {
    return (
      <QuizStartCard
        ui={ui}
        rankFloors={rankFloors}
        saved={saved}
        total={total}
        onBegin={begin}
        onResume={resume}
      />
    );
  }

  if (phase === 'summary') {
    return (
      <motion.div variants={summaryVariants} initial="initial" animate="animate">
        <QuizSummary
          attempt={attempt}
          ui={ui}
          total={total}
          correctCount={correctCount}
          rankFloors={rankFloors}
          best={best}
          bestTemplate={bestTemplate}
          nextTier={nextTier}
          hubHref={hubHref}
          headingRef={summaryHeadingRef}
          onRestart={begin}
        />
      </motion.div>
    );
  }

  if (!current) return null;

  const progressText = fillTemplate(ui.progressTemplate, {
    current: attempt.currentIndex + 1,
    total,
  });
  const streak = trailingStreak(attempt);
  const feedbackPool = currentAnswer?.correct ? ui.correctFeedback : ui.incorrectFeedback;
  const feedbackText = feedbackPool[attempt.answers.length % feedbackPool.length];
  const correctIndex = current.options.findIndex(
    (option) => option.id === current.question.correctOptionId,
  );
  const correctLetter = OPTION_LABELS[correctIndex] ?? '';
  const isLast = attempt.currentIndex + 1 >= attempt.questions.length;
  const questionHeadingId = `quiz-question-${current.question.id}`;
  const feedbackHeadingId = `${questionHeadingId}-feedback`;

  return (
    <section
      ref={questionRef}
      aria-labelledby={questionHeadingId}
      className="scroll-mt-[var(--sticky-offset)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="type-label tabular-nums text-muted-foreground" data-testid="quiz-progress">
          {progressText}
        </p>
        {currentAnswer?.correct && streak >= 3 ? (
          <p className="inline-flex items-center gap-1.5 type-label text-subtle">
            <Sparkles aria-hidden className="size-3.5" />
            {fillTemplate(ui.streakTemplate, { count: streak })}
          </p>
        ) : null}
      </div>
      {/* One segment per question: answered right, answered wrong, the current one, still to come. */}
      <div aria-hidden className="mt-3 flex gap-0.5" data-testid="quiz-progress-track">
        {attempt.questions.map((entry, index) => {
          const answer = answerFor(attempt, entry.question.id);
          return (
            <span
              key={entry.question.id}
              className={cn(
                'h-1 min-w-0 flex-1 first:rounded-l-pill last:rounded-r-pill',
                answer?.correct && 'bg-primary',
                answer && !answer.correct && 'bg-subtle',
                !answer && index === attempt.currentIndex && 'bg-foreground',
                !answer && index !== attempt.currentIndex && 'bg-rule',
              )}
            />
          );
        })}
      </div>

      <motion.div
        key={current.question.id}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="mt-6 rounded-surface border border-rule bg-surface"
      >
        <div className="p-5 sm:p-8">
          <h2
            ref={headingRef}
            id={questionHeadingId}
            tabIndex={-1}
            className="type-heading-3 text-foreground"
          >
            {current.question.prompt}
          </h2>

          <div role="group" aria-labelledby={questionHeadingId} className="mt-6 grid gap-2.5">
            {current.options.map((option, index) => {
              const state = optionState(current, option.id, currentAnswer?.chosenOptionId);
              const revealed = state !== 'open';
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  aria-disabled={revealed || undefined}
                  data-state={state}
                  data-testid={`quiz-option-${index + 1}`}
                  className={cn(
                    'flex w-full min-h-12 items-start gap-3 rounded-control border px-3.5 py-3 text-left transition-[background-color,border-color,color] duration-fast sm:px-4',
                    state === 'open' &&
                      'border-rule text-foreground hover:border-input hover:bg-surface-raised',
                    state === 'correct' && 'border-positive bg-positive-surface text-foreground',
                    state === 'chosen' && 'border-critical bg-critical-surface text-foreground',
                    state === 'other' && 'border-rule-faint text-muted-foreground',
                    revealed && 'cursor-default',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex size-6 shrink-0 items-center justify-center rounded-edge border type-label',
                      state === 'correct' && 'border-positive text-positive',
                      state === 'chosen' && 'border-critical text-critical',
                      (state === 'open' || state === 'other') && 'border-input text-subtle',
                    )}
                  >
                    {OPTION_LABELS[index]}
                  </span>
                  <span className="min-w-0 flex-1 type-body-md">{option.text}</span>
                  {state === 'correct' ? (
                    <>
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-positive" />
                      <span className="sr-only">{`(${ui.correctAnswerLabel})`}</span>
                    </>
                  ) : null}
                  {state === 'chosen' ? (
                    <>
                      <X aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
                      <span className="sr-only">{`(${ui.yourAnswerLabel})`}</span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {currentAnswer ? (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            role="region"
            aria-labelledby={feedbackHeadingId}
            data-testid="quiz-feedback"
            className="scroll-mt-[var(--sticky-offset)] border-t border-rule-faint"
          >
            <div className="px-5 pt-5 sm:px-8 sm:pt-6">
              <p
                id={feedbackHeadingId}
                className="flex items-start gap-2 type-title text-foreground"
                data-testid="quiz-feedback-status"
              >
                {currentAnswer.correct ? (
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-positive" />
                ) : (
                  <X aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
                )}
                <span>
                  {feedbackText}
                  {currentAnswer.correct
                    ? null
                    : ` ${fillTemplate(ui.correctAnswerTemplate, { letter: correctLetter })}`}
                </span>
              </p>

              <p className="mt-5 type-label text-subtle">{ui.explanationHeading}</p>
              <p className="mt-1 type-body-md text-muted-foreground">
                {current.question.explanation}
              </p>

              {current.question.funFact ? (
                <>
                  <p className="mt-5 type-label text-subtle">{ui.funFactHeading}</p>
                  <p className="mt-1 type-body-sm text-muted-foreground">
                    {current.question.funFact}
                  </p>
                </>
              ) : null}
            </div>

            {/* On a phone the explanation can outgrow the screen: the next step stays in reach. */}
            <div className="sticky bottom-0 mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-b-surface border-t border-rule-faint bg-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:border-t-0 sm:px-8 sm:pb-6 sm:pt-0">
              <ReferenceLink href={current.question.reference.href} newTabNote={ui.newTabNote}>
                {ui.referenceLabel}
                {': '}
                {current.question.reference.label}
              </ReferenceLink>
              <Button onClick={advance} data-testid="quiz-next" className="max-sm:w-full">
                {isLast ? ui.finishLabel : ui.nextLabel}
                <ArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}

function scoreOf(attempt: QuizAttempt): QuizBestScore {
  return {
    correct: attempt.answers.filter((answer) => answer.correct).length,
    total: attempt.questions.length,
  };
}

interface QuizStartCardProps {
  ui: QuizRunnerUi;
  rankFloors: Readonly<Record<QuizRankKey, string | null>>;
  saved: QuizAttempt | null;
  total: number;
  onBegin: () => void;
  onResume: () => void;
}

/** Before the first question: the goal (the rank ladder) and the way in. */
function QuizStartCard({ ui, rankFloors, saved, total, onBegin, onResume }: QuizStartCardProps) {
  const savedNote = saved
    ? saved.phase === 'summary'
      ? fillTemplate(ui.summary.scoreTemplate, {
          correct: saved.answers.filter((answer) => answer.correct).length,
          total,
        })
      : fillTemplate(ui.progressTemplate, {
          current: Math.min(saved.currentIndex + 1, total),
          total,
        })
    : null;

  return (
    <section
      aria-labelledby="quiz-start-ranks"
      className="rounded-surface border border-rule bg-surface p-5 sm:p-8"
      data-testid="quiz-start"
    >
      <h2 id="quiz-start-ranks" className="type-label text-subtle">
        {ui.intro.ranksHeading}
      </h2>
      <RankLadder
        ranks={ui.summary.ranks}
        floors={rankFloors}
        label={ui.intro.ranksHeading}
        className="mt-3"
      />

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule-faint pt-6">
        {saved ? (
          <>
            <Button
              size="lg"
              onClick={onResume}
              data-testid="quiz-resume"
              className="max-sm:w-full"
            >
              {ui.intro.resumeLabel}
              <ArrowRight aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onBegin}
              data-testid="quiz-begin"
              className="max-sm:w-full"
            >
              <RotateCcw aria-hidden />
              {ui.intro.startOverLabel}
            </Button>
            <p className="basis-full type-label tabular-nums text-muted-foreground sm:basis-auto">
              {savedNote}
            </p>
          </>
        ) : (
          <Button size="lg" onClick={onBegin} data-testid="quiz-begin" className="max-sm:w-full">
            {ui.intro.beginLabel}
            <ArrowRight aria-hidden />
          </Button>
        )}
        <p className="hidden basis-full type-caption text-subtle [@media(hover:hover)_and_(pointer:fine)]:block">
          {ui.intro.keyboardHint}
        </p>
      </div>
    </section>
  );
}

interface QuizSummaryProps {
  attempt: QuizAttempt;
  ui: QuizRunnerUi;
  total: number;
  correctCount: number;
  rankFloors: Readonly<Record<QuizRankKey, string | null>>;
  best: QuizBestScore | null;
  bestTemplate: string;
  nextTier?: QuizNextTier;
  hubHref: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}

/** The score, the rank on the ladder, the way on, and every missed question with its answer. */
function QuizSummary({
  attempt,
  ui,
  total,
  correctCount,
  rankFloors,
  best,
  bestTemplate,
  nextTier,
  hubHref,
  headingRef,
  onRestart,
}: QuizSummaryProps) {
  const rankKey = rankFor(correctCount, total);
  const rank = ui.summary.ranks[rankKey];
  const missed = attempt.questions.filter(
    (entry) => !answerFor(attempt, entry.question.id)?.correct,
  );
  const suggestNext = nextTier !== undefined && correctCount / total >= NEXT_TIER_THRESHOLD;
  const showBest = best !== null && best.correct > correctCount;

  return (
    <section aria-labelledby="quiz-summary-heading" data-testid="quiz-summary">
      <div className="rounded-surface border border-rule bg-surface p-5 sm:p-8">
        <p className="type-eyebrow text-secondary">{ui.summary.eyebrow}</p>
        <h2
          ref={headingRef}
          id="quiz-summary-heading"
          tabIndex={-1}
          className="mt-3 type-section text-foreground scroll-mt-[var(--sticky-offset)]"
        >
          {fillTemplate(ui.summary.scoreTemplate, { correct: correctCount, total })}
        </h2>
        <p className="mt-3 type-body-md text-muted-foreground">
          {ui.summary.rankLabel}
          {': '}
          <span className="font-semibold text-foreground">{rank.name}</span>
        </p>
        <p className="mt-1 max-w-[var(--measure-lede)] type-body-md text-muted-foreground">
          {rank.line}
        </p>
        {showBest ? (
          <p className="mt-2 type-label tabular-nums text-subtle">
            {fillTemplate(bestTemplate, { correct: best.correct, total: best.total })}
          </p>
        ) : null}

        <RankLadder
          ranks={ui.summary.ranks}
          floors={rankFloors}
          current={rankKey}
          label={ui.summary.rankLabel}
          className="mt-8"
        />

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule-faint pt-6">
          {suggestNext ? (
            <Button size="lg" asChild className="max-sm:w-full">
              <Link href={nextTier.href} data-testid="quiz-next-tier">
                {fillTemplate(ui.summary.nextTierTemplate, { tier: nextTier.title })}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : null}
          <Button
            size="lg"
            variant={suggestNext ? 'outline' : 'default'}
            onClick={onRestart}
            data-testid="quiz-restart"
            className="max-sm:w-full"
          >
            <RotateCcw aria-hidden />
            {ui.summary.restartLabel}
          </Button>
          <Button size="lg" variant="ghost" asChild className="max-sm:w-full">
            <Link href={hubHref}>{ui.summary.hubLabel}</Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="quiz-review-heading" className="mt-10 sm:mt-12">
        <h3 id="quiz-review-heading" className="type-heading-3 text-foreground">
          {ui.summary.studyHeading}
        </h3>
        {missed.length === 0 ? (
          <p className="mt-2 type-body-md text-muted-foreground">{ui.summary.noMissesNote}</p>
        ) : (
          <>
            <p className="mt-2 type-body-md text-muted-foreground">{ui.summary.studyIntro}</p>
            <ol
              className="mt-6 divide-y divide-rule-faint border-y border-rule-faint"
              data-testid="quiz-review"
            >
              {missed.map((entry) => (
                <MissedQuestion key={entry.question.id} entry={entry} attempt={attempt} ui={ui} />
              ))}
            </ol>
          </>
        )}
      </section>
    </section>
  );
}

function MissedQuestion({
  entry,
  attempt,
  ui,
}: {
  entry: QuizAttemptQuestion;
  attempt: QuizAttempt;
  ui: QuizRunnerUi;
}) {
  const chosenId = answerFor(attempt, entry.question.id)?.chosenOptionId;
  const letterOf = (optionId: string | undefined) =>
    OPTION_LABELS[entry.options.findIndex((option) => option.id === optionId)] ?? '';
  const textOf = (optionId: string | undefined) =>
    entry.options.find((option) => option.id === optionId)?.text ?? '';
  const correctId = entry.question.correctOptionId;

  return (
    <li className="py-5 sm:py-6">
      <p className="type-title text-foreground">{entry.question.prompt}</p>
      <dl className="mt-3 grid gap-2">
        {chosenId ? (
          <div className="flex items-start gap-2.5">
            <X aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
            <dt className="sr-only">{ui.yourAnswerLabel}</dt>
            <dd className="type-body-sm text-muted-foreground">
              <span aria-hidden className="type-label text-subtle">
                {ui.yourAnswerLabel}
                {' · '}
              </span>
              <span className="tabular-nums">{letterOf(chosenId)}.</span> {textOf(chosenId)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-start gap-2.5">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-positive" />
          <dt className="sr-only">{ui.correctAnswerLabel}</dt>
          <dd className="type-body-sm text-foreground">
            <span aria-hidden className="type-label text-subtle">
              {ui.correctAnswerLabel}
              {' · '}
            </span>
            <span className="tabular-nums">{letterOf(correctId)}.</span> {textOf(correctId)}
          </dd>
        </div>
      </dl>
      <details className="group mt-3">
        <summary className="inline-flex min-h-6 cursor-pointer list-none items-center gap-1 type-label text-primary [&::-webkit-details-marker]:hidden">
          <ArrowRight
            aria-hidden
            className="size-3.5 transition-transform duration-fast group-open:rotate-90"
          />
          {ui.explanationHeading}
        </summary>
        <div className="mt-2 border-l-2 border-rule pl-4">
          <p className="type-body-sm text-muted-foreground">{entry.question.explanation}</p>
          <ReferenceLink
            href={entry.question.reference.href}
            newTabNote={ui.newTabNote}
            className="mt-3"
          >
            {entry.question.reference.label}
          </ReferenceLink>
        </div>
      </details>
    </li>
  );
}
