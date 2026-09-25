import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { getQuizContent, quizContentEn } from '@/content/quiz';
import type { QuizTier } from '@/content/quiz';

import { QuizRunner, type QuizRunnerProps } from '@/components/quiz/QuizRunner';
import { attemptStorageKey, bestScoreStorageKey } from '@/components/quiz/quizProgress';

// Render motion elements as plain DOM so question transitions resolve
// synchronously in jsdom (matches the mock pattern used across the suite).
jest.mock('framer-motion', () => {
  const React = require('react');
  const cache: Record<string, unknown> = {};
  return {
    AnimatePresence: ({ children }: { children?: unknown }) => children,
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          if (!cache[prop]) {
            const Comp = React.forwardRef(function MotionProxy(
              props: Record<string, unknown>,
              ref: unknown,
            ) {
              const {
                initial: _initial,
                animate: _animate,
                exit: _exit,
                whileInView: _whileInView,
                viewport: _viewport,
                transition: _transition,
                variants: _variants,
                custom: _custom,
                ...rest
              } = props;
              return React.createElement(prop, { ...rest, ref });
            });
            Comp.displayName = `motion.${prop}`;
            cache[prop] = Comp;
          }
          return cache[prop];
        },
      },
    ),
  };
});

const tier: QuizTier = {
  id: 'basic',
  title: 'Basic',
  heading: 'Basic: the fundamentals',
  tagline: 'Stub tagline',
  description: 'Stub description',
  questions: [
    {
      id: 'first-question',
      prompt: 'First stub prompt?',
      options: [
        { id: 'a', text: 'First correct option' },
        { id: 'b', text: 'First distractor one' },
        { id: 'c', text: 'First distractor two' },
        { id: 'd', text: 'First distractor three' },
      ],
      correctOptionId: 'a',
      explanation: 'First stub explanation.',
      funFact: 'First stub fun fact.',
      reference: { label: 'White paper — Gestures', href: '/white-paper#gestures' },
    },
    {
      id: 'second-question',
      prompt: 'Second stub prompt?',
      options: [
        { id: 'a', text: 'Second distractor one' },
        { id: 'b', text: 'Second correct option' },
        { id: 'c', text: 'Second distractor two' },
        { id: 'd', text: 'Second distractor three' },
      ],
      correctOptionId: 'b',
      explanation: 'Second stub explanation.',
      reference: { label: 'White paper — Finalization', href: '/white-paper#finalization' },
    },
  ],
};

const ui = quizContentEn.ui;

const props: QuizRunnerProps = {
  tier,
  ui,
  locale: 'en',
  hubHref: '/quiz',
  rankFloors: {
    reader: null,
    student: 'From 50%',
    scholar: 'From 75%',
    cartographer: 'From 95%',
  },
  bestTemplate: quizContentEn.hub.bestTemplate,
  nextTier: { title: 'Medium', href: '/quiz/medium' },
};

const SESSION_KEY = attemptStorageKey('en', 'basic');

describe('<QuizRunner />', () => {
  beforeEach(() => {
    // Pin the Fisher-Yates shuffle to a no-op so the attempt keeps the
    // authored question and option order and assertions stay deterministic.
    jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function begin() {
    render(<QuizRunner {...props} />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
  }

  it('opens on the goal, not on a question that has not started', () => {
    render(<QuizRunner {...props} />);
    const start = screen.getByTestId('quiz-start');
    expect(start).toHaveTextContent(ui.intro.keyboardHint);
    expect(within(start).getByRole('list', { name: ui.intro.ranksHeading })).toBeInTheDocument();
    expect(start).toHaveTextContent('From 75%');
    // The progress line belongs to a running attempt only.
    expect(screen.queryByTestId('quiz-progress')).not.toBeInTheDocument();
    expect(start).not.toHaveTextContent('Question 1 of 2');
    expect(screen.queryByText('First stub prompt?')).not.toBeInTheDocument();
  });

  it('lets a focused skip link handle Enter without starting the quiz', () => {
    render(
      <>
        <a href="#main">Skip to content</a>
        <main id="main" tabIndex={-1}>
          <QuizRunner {...props} />
        </main>
      </>,
    );
    const link = screen.getByRole('link', { name: 'Skip to content' });
    link.focus();

    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(true);
    expect(screen.getByTestId('quiz-begin')).toBeInTheDocument();
    expect(screen.queryByText('First stub prompt?')).not.toBeInTheDocument();
  });

  it('does not advance an answered question when Enter activates its reference link', () => {
    begin();
    fireEvent.click(screen.getByText('First correct option'));
    const link = screen.getByRole('link', { name: /White paper — Gestures/ });
    link.focus();

    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(true);
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
  });

  it('opens references in a new tab, so following one keeps the attempt', () => {
    begin();
    fireEvent.click(screen.getByText('First distractor one'));
    const link = screen.getByRole('link', { name: /White paper — Gestures/ });
    expect(link).toHaveAttribute('href', '/white-paper#gestures');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(expect.stringContaining(ui.newTabNote));
  });

  it('keeps focus on the answer, names the correct option and marks the picks', () => {
    begin();
    const wrong = screen.getByTestId('quiz-option-2');
    wrong.focus();
    fireEvent.click(wrong);

    // Options stay focusable: they are aria-disabled, never natively disabled.
    expect(wrong).not.toBeDisabled();
    expect(wrong).toHaveAttribute('aria-disabled', 'true');
    expect(wrong).toHaveAccessibleName(expect.stringContaining(`(${ui.yourAnswerLabel})`));
    expect(screen.getByTestId('quiz-option-1')).toHaveAccessibleName(
      expect.stringContaining(`(${ui.correctAnswerLabel})`),
    );

    // Focus moves to the feedback, whose status names the correct letter.
    const feedback = screen.getByTestId('quiz-feedback');
    expect(feedback).toHaveFocus();
    expect(screen.getByTestId('quiz-feedback-status')).toHaveTextContent(
      'The correct answer is A.',
    );
    expect(feedback).toHaveAccessibleName(expect.stringContaining('The correct answer is A.'));

    // A second click changes nothing.
    fireEvent.click(screen.getByTestId('quiz-option-3'));
    expect(screen.getByTestId('quiz-option-3')).toHaveAttribute('data-state', 'other');

    // Next moves focus to the new question's heading.
    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(screen.getByRole('heading', { level: 2, name: 'Second stub prompt?' })).toHaveFocus();
  });

  it("joins label and value with the locale's own punctuation", () => {
    const ja = getQuizContent('ja').ui;
    render(<QuizRunner {...props} ui={ja} locale="ja" />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
    fireEvent.click(screen.getByTestId('quiz-option-2'));

    // Japanese sentences run on without a space, and the reference label
    // takes a full-width colon: no hard-coded ' ' or ': ' in between.
    const status = screen.getByTestId('quiz-feedback-status').textContent ?? '';
    expect(status).toMatch(/。正解はAです。$/);
    expect(screen.getByRole('link', { name: /White paper — Gestures/ }).textContent).toContain(
      'さらに深く：White paper — Gestures',
    );

    fireEvent.click(screen.getByTestId('quiz-next'));
    fireEvent.click(screen.getByTestId('quiz-option-2'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(screen.getByTestId('quiz-summary')).toHaveTextContent(
      `到達点：${ja.summary.ranks.student.name}`,
    );
  });

  it('walks a full attempt: feedback, explanation, reference, summary and review', () => {
    begin();

    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
    expect(screen.getByText('First stub prompt?')).toBeInTheDocument();

    // Answer question one incorrectly.
    fireEvent.click(screen.getByText('First distractor one'));
    const feedback = screen.getByTestId('quiz-feedback');
    expect(feedback).toHaveTextContent('First stub explanation.');
    expect(feedback).toHaveTextContent('First stub fun fact.');

    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 2 of 2');

    // A digit typed while focus is outside the question records nothing (WCAG 2.1.4).
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.queryByTestId('quiz-feedback')).toBeNull();
    outside.remove();
    screen.getByRole('heading', { level: 2, name: 'Second stub prompt?' }).focus();

    // Answer question two correctly via the keyboard shortcut (option 2 = 'b').
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByTestId('quiz-feedback')).toHaveTextContent('Second stub explanation.');
    expect(screen.getByTestId('quiz-feedback-status')).not.toHaveTextContent('correct answer is');

    // Finish via the Enter shortcut.
    fireEvent.keyDown(window, { key: 'Enter' });
    const summary = screen.getByTestId('quiz-summary');
    expect(summary).toHaveTextContent('1 of 2 correct');
    expect(summary).toHaveTextContent(ui.summary.ranks.student.name);
    expect(screen.getByRole('heading', { level: 2, name: '1 of 2 correct' })).toHaveFocus();

    // The review shows the pick, the correct answer and the explanation.
    const review = screen.getByTestId('quiz-review');
    expect(review).toHaveTextContent('First stub prompt?');
    expect(review).toHaveTextContent('B. First distractor one');
    expect(review).toHaveTextContent('A. First correct option');
    expect(review).toHaveTextContent('First stub explanation.');
    expect(within(review).getByRole('link', { name: /White paper — Gestures/ })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(summary).not.toHaveTextContent('Second stub prompt?');

    // Half right: the next tier is on offer.
    expect(screen.getByTestId('quiz-next-tier')).toHaveAttribute('href', '/quiz/medium');
    expect(screen.getByTestId('quiz-next-tier')).toHaveTextContent('Continue to Medium');
  });

  it('keeps the best score in this browser', () => {
    begin();
    fireEvent.click(screen.getByText('First correct option'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    fireEvent.click(screen.getByText('Second correct option'));
    fireEvent.click(screen.getByTestId('quiz-next'));

    expect(screen.getByTestId('quiz-summary')).toHaveTextContent('2 of 2 correct');
    expect(screen.getByText(ui.summary.noMissesNote)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(bestScoreStorageKey('basic'))!)).toEqual({
      correct: 2,
      total: 2,
    });

    fireEvent.click(screen.getByTestId('quiz-restart'));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
  });

  it('keeps the review a valid definition list: each group holds only a term and its value', async () => {
    begin();
    fireEvent.click(screen.getByText('First distractor one'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    fireEvent.click(screen.getByText('Second distractor one'));
    fireEvent.click(screen.getByTestId('quiz-next'));

    const review = screen.getByTestId('quiz-review');
    const groups = review.querySelectorAll('dl > div');
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect([...group.children].map((child) => child.tagName)).toEqual(['DT', 'DD']);
    }
    // The terms are visible and carry the mark.
    expect(within(review).getAllByText(ui.yourAnswerLabel)[0]?.closest('dt')).not.toBeNull();
    const results = await axe(review, {
      runOnly: { type: 'rule', values: ['definition-list', 'dlitem'] },
    });
    expect(results).toHaveNoViolations();
  });

  it('does not suggest the next tier below half right', () => {
    begin();
    fireEvent.click(screen.getByText('First distractor one'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    fireEvent.click(screen.getByText('Second distractor one'));
    fireEvent.click(screen.getByTestId('quiz-next'));

    expect(screen.getByTestId('quiz-summary')).toHaveTextContent('0 of 2 correct');
    expect(screen.queryByTestId('quiz-next-tier')).not.toBeInTheDocument();
  });

  it('saves the run as it goes and offers to resume it after a reload', () => {
    const { unmount } = render(<QuizRunner {...props} />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
    fireEvent.click(screen.getByText('First distractor one'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(window.sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
    unmount();

    // A new visit (a reload, or Back from a reference) starts on the start card.
    render(<QuizRunner {...props} />);
    const start = screen.getByTestId('quiz-start');
    expect(start).toHaveTextContent('Question 2 of 2');
    act(() => {
      fireEvent.click(screen.getByTestId('quiz-resume'));
    });
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 2 of 2');
    expect(screen.getByText('Second stub prompt?')).toBeInTheDocument();

    // The earlier answer still counts.
    fireEvent.click(screen.getByText('Second correct option'));
    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(screen.getByTestId('quiz-summary')).toHaveTextContent('1 of 2 correct');
  });

  it('starts over from a clean slate when asked', () => {
    const { unmount } = render(<QuizRunner {...props} />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
    fireEvent.click(screen.getByText('First correct option'));
    unmount();

    render(<QuizRunner {...props} />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
    expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
  });

  it('ignores a saved run that no longer matches the tier', () => {
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        v: 1,
        phase: 'running',
        questionIds: ['first-question', 'removed-question'],
        optionIdsByQuestion: {},
        answers: [],
        currentIndex: 0,
      }),
    );
    render(<QuizRunner {...props} />);
    expect(screen.queryByTestId('quiz-resume')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
