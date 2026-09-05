'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, Check, RotateCcw, Sparkles, X } from 'lucide-react';

import type { QuizQuestion, QuizRunnerUi, QuizTier } from '@/content/quiz';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { fadeRise, scaleIn, slideInRight, useMotionVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface QuizRunnerProps {
  tier: QuizTier;
  ui: QuizRunnerUi;
  hubHref: string;
}

type Phase = 'intro' | 'running' | 'summary';

/** A question with its options in this attempt's display order. */
interface AttemptQuestion {
  question: QuizQuestion;
  options: QuizQuestion['options'];
}

interface AnswerRecord {
  questionId: string;
  chosenOptionId: string;
  correct: boolean;
}

function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith]!, result[index]!];
  }
  return result;
}

/** Shuffles question order and each question's option order for one attempt. */
function buildAttempt(questions: readonly QuizQuestion[]): AttemptQuestion[] {
  return shuffled(questions).map((question) => ({
    question,
    options: shuffled(question.options),
  }));
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

/** Score bands for the mastery ranks, expressed as minimum correct ratio. */
const RANK_BANDS = [
  { threshold: 0.95, rank: 'chronoWarrior' },
  { threshold: 0.75, rank: 'enduranceChampion' },
  { threshold: 0.5, rank: 'participant' },
  { threshold: 0, rank: 'observer' },
] as const satisfies ReadonlyArray<{
  threshold: number;
  rank: keyof QuizRunnerUi['summary']['ranks'];
}>;

function rankFor(correct: number, total: number): keyof QuizRunnerUi['summary']['ranks'] {
  const ratio = total === 0 ? 0 : correct / total;
  return RANK_BANDS.find((band) => ratio >= band.threshold)?.rank ?? 'observer';
}

function trailingStreak(answers: readonly AnswerRecord[]): number {
  let streak = 0;
  for (let index = answers.length - 1; index >= 0 && answers[index]!.correct; index -= 1) {
    streak += 1;
  }
  return streak;
}

export function QuizRunner({ tier, ui, hubHref }: QuizRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [attempt, setAttempt] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const cardVariants = useMotionVariants(slideInRight);
  const feedbackVariants = useMotionVariants(scaleIn);
  const summaryVariants = useMotionVariants(fadeRise);

  const total = tier.questions.length;
  const current = attempt[currentIndex];
  const currentAnswer =
    current === undefined
      ? undefined
      : answers.find((answer) => answer.questionId === current.question.id);
  const correctCount = useMemo(() => answers.filter((answer) => answer.correct).length, [answers]);
  const streak = trailingStreak(answers);

  const begin = useCallback(() => {
    setAttempt(buildAttempt(tier.questions));
    setAnswers([]);
    setCurrentIndex(0);
    setPhase('running');
  }, [tier.questions]);

  const choose = useCallback(
    (optionId: string) => {
      if (current === undefined || currentAnswer !== undefined) return;
      setAnswers((previous) => [
        ...previous,
        {
          questionId: current.question.id,
          chosenOptionId: optionId,
          correct: optionId === current.question.correctOptionId,
        },
      ]);
    },
    [current, currentAnswer],
  );

  const advance = useCallback(() => {
    if (currentAnswer === undefined) return;
    if (currentIndex + 1 >= attempt.length) {
      setPhase('summary');
    } else {
      setCurrentIndex((index) => index + 1);
    }
  }, [attempt.length, currentAnswer, currentIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      // Navigation and form controls keep their native keyboard behavior,
      // including the site's skip link and the quiz's own reference links.
      if (
        event.target instanceof Element &&
        event.target.closest(
          'a, button, input, select, textarea, [role="button"], [contenteditable]:not([contenteditable="false"])',
        )
      ) {
        return;
      }
      if (phase === 'intro' && event.key === 'Enter') {
        event.preventDefault();
        begin();
        return;
      }
      if (phase !== 'running') return;
      if (event.key === 'Enter') {
        event.preventDefault();
        advance();
        return;
      }
      const digit = Number.parseInt(event.key, 10);
      if (digit >= 1 && digit <= 4 && current !== undefined) {
        const option = current.options[digit - 1];
        if (option) {
          event.preventDefault();
          choose(option.id);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advance, begin, choose, current, phase]);

  if (phase === 'intro') {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-5 p-6 sm:p-8">
          <p className="type-body-md text-white/72">
            {fillTemplate(ui.progressTemplate, { current: 1, total })}
          </p>
          <p className="type-body-sm text-white/55">{ui.intro.keyboardHint}</p>
          <Button size="lg" onClick={begin} data-testid="quiz-begin">
            {ui.intro.beginLabel}
            <ArrowRight aria-hidden />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'summary') {
    const rankKey = rankFor(correctCount, total);
    const rank = ui.summary.ranks[rankKey];
    const missed = attempt.filter((entry) =>
      answers.some((answer) => answer.questionId === entry.question.id && !answer.correct),
    );

    return (
      <motion.section
        variants={summaryVariants}
        initial="initial"
        animate="animate"
        aria-labelledby="quiz-summary-heading"
        data-testid="quiz-summary"
      >
        <Card>
          <CardContent className="p-6 sm:p-8">
            <p className="type-eyebrow text-white/50">{ui.summary.eyebrow}</p>
            <h2 id="quiz-summary-heading" className="type-display-sm mt-3 text-white">
              {fillTemplate(ui.summary.scoreTemplate, { correct: correctCount, total })}
            </h2>
            <p className="mt-4 text-sm text-white/60">
              {ui.summary.rankLabel}
              {': '}
              <span className="font-semibold text-white">{rank.name}</span>
            </p>
            <p className="mt-2 max-w-2xl type-body-md text-white/72">{rank.line}</p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">{ui.summary.studyHeading}</h3>
              {missed.length === 0 ? (
                <p className="mt-3 type-body-sm text-white/60">{ui.summary.noMissesNote}</p>
              ) : (
                <>
                  <p className="mt-3 type-body-sm text-white/60">{ui.summary.studyIntro}</p>
                  <ul className="mt-4 space-y-4">
                    {missed.map((entry) => (
                      <li
                        key={entry.question.id}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <p className="type-body-sm text-white/80">{entry.question.prompt}</p>
                        <Link
                          href={entry.question.reference.href}
                          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                        >
                          <BookOpen className="h-4 w-4" aria-hidden />
                          {entry.question.reference.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={begin} data-testid="quiz-restart">
                <RotateCcw aria-hidden />
                {ui.summary.restartLabel}
              </Button>
              <Button variant="secondary" asChild>
                <Link href={hubHref}>{ui.summary.hubLabel}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  if (current === undefined) return null;

  const progressText = fillTemplate(ui.progressTemplate, {
    current: currentIndex + 1,
    total,
  });
  const feedbackPool = currentAnswer?.correct ? ui.correctFeedback : ui.incorrectFeedback;
  const feedbackText = feedbackPool[answers.length % feedbackPool.length];

  return (
    <section aria-label={progressText}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-body-sm text-white/60" data-testid="quiz-progress">
          {progressText}
        </p>
        {/* Constellation progress: one star per question, lit as it is answered. */}
        <div aria-hidden className="flex max-w-full flex-wrap items-center gap-1.5">
          {attempt.map((entry, index) => {
            const answer = answers.find((item) => item.questionId === entry.question.id);
            return (
              <span
                key={entry.question.id}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-300',
                  answer?.correct &&
                    'bg-primary shadow-[0_0_6px_1px_rgb(var(--aurora-cyan-rgb)/0.8)]',
                  answer !== undefined && !answer.correct && 'bg-white/30',
                  answer === undefined && index === currentIndex && 'bg-white/70',
                  answer === undefined && index !== currentIndex && 'bg-white/12',
                )}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.question.id}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mt-4"
        >
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold leading-8 tracking-tight text-white sm:text-2xl">
                {current.question.prompt}
              </h2>

              <div role="group" aria-label={progressText} className="mt-6 space-y-3">
                {current.options.map((option, index) => {
                  const isChosen = currentAnswer?.chosenOptionId === option.id;
                  const isCorrect = option.id === current.question.correctOptionId;
                  const revealed = currentAnswer !== undefined;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choose(option.id)}
                      disabled={revealed}
                      data-testid={`quiz-option-${index + 1}`}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                        'border-white/10 bg-white/[0.03] text-white/85',
                        !revealed && 'hover:border-white/25 hover:bg-white/[0.06]',
                        revealed && isCorrect && 'border-primary/60 bg-primary/10 text-white',
                        revealed && isChosen && !isCorrect && 'border-red-400/50 bg-red-400/10',
                        revealed && !isChosen && !isCorrect && 'opacity-55',
                      )}
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/15 font-mono text-xs text-white/60"
                      >
                        {OPTION_LABELS[index]}
                      </span>
                      <span className="type-body-md">{option.text}</span>
                      {revealed && isCorrect ? (
                        <Check aria-hidden className="ml-auto mt-1 h-4 w-4 shrink-0 text-primary" />
                      ) : null}
                      {revealed && isChosen && !isCorrect ? (
                        <X aria-hidden className="ml-auto mt-1 h-4 w-4 shrink-0 text-red-300" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {currentAnswer !== undefined ? (
                  <motion.div
                    variants={feedbackVariants}
                    initial="initial"
                    animate="animate"
                    className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-5"
                    data-testid="quiz-feedback"
                  >
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        currentAnswer.correct ? 'text-primary' : 'text-red-300',
                      )}
                      role="status"
                    >
                      {feedbackText}
                      {currentAnswer.correct && streak >= 3 ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-white/70">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                          {fillTemplate(ui.streakTemplate, { count: streak })}
                        </span>
                      ) : null}
                    </p>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      {ui.explanationHeading}
                    </p>
                    <p className="mt-1.5 type-body-md text-white/78">
                      {current.question.explanation}
                    </p>

                    {current.question.funFact ? (
                      <>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                          {ui.funFactHeading}
                        </p>
                        <p className="mt-1.5 type-body-sm text-white/65">
                          {current.question.funFact}
                        </p>
                      </>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <Link
                        href={current.question.reference.href}
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        <BookOpen className="h-4 w-4" aria-hidden />
                        <span>
                          {ui.referenceLabel}
                          {': '}
                          {current.question.reference.label}
                        </span>
                      </Link>
                      <Button onClick={advance} data-testid="quiz-next">
                        {currentIndex + 1 >= attempt.length ? ui.finishLabel : ui.nextLabel}
                        <ArrowRight aria-hidden />
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
