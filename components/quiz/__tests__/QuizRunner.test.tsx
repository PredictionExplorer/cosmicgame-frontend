import { fireEvent, render, screen } from '@testing-library/react';

import { quizContentEn } from '@/content/quiz';
import type { QuizTier } from '@/content/quiz';

import { QuizRunner } from '@/components/quiz/QuizRunner';

// Render motion elements as plain DOM and AnimatePresence as a passthrough so
// question transitions resolve synchronously in jsdom (matches the mock
// pattern used across the suite, e.g. FAQCategory.test.tsx).
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

describe('<QuizRunner />', () => {
  beforeEach(() => {
    // Pin the Fisher-Yates shuffle to a no-op so the attempt keeps the
    // authored question and option order and assertions stay deterministic.
    jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function begin() {
    render(<QuizRunner tier={tier} ui={ui} hubHref="/quiz" />);
    fireEvent.click(screen.getByTestId('quiz-begin'));
  }

  it('renders the intro with the keyboard hint before starting', () => {
    render(<QuizRunner tier={tier} ui={ui} hubHref="/quiz" />);
    expect(screen.getByText(ui.intro.keyboardHint)).toBeInTheDocument();
    expect(screen.queryByText('First stub prompt?')).not.toBeInTheDocument();
  });

  it('lets a focused skip link handle Enter without starting the quiz', () => {
    render(
      <>
        <a href="#main">Skip to content</a>
        <main id="main" tabIndex={-1}>
          <QuizRunner tier={tier} ui={ui} hubHref="/quiz" />
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

  it('walks a full attempt: feedback, explanation, reference, summary, and study list', () => {
    begin();

    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
    expect(screen.getByText('First stub prompt?')).toBeInTheDocument();

    // Answer question one incorrectly.
    fireEvent.click(screen.getByText('First distractor one'));
    const feedback = screen.getByTestId('quiz-feedback');
    expect(feedback).toHaveTextContent('First stub explanation.');
    expect(feedback).toHaveTextContent('First stub fun fact.');
    expect(screen.getByRole('link', { name: /White paper — Gestures/ })).toHaveAttribute(
      'href',
      '/white-paper#gestures',
    );

    fireEvent.click(screen.getByTestId('quiz-next'));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 2 of 2');

    // Answer question two correctly via the keyboard shortcut (option 2 = 'b').
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByTestId('quiz-feedback')).toHaveTextContent('Second stub explanation.');

    // Finish via the Enter shortcut.
    fireEvent.keyDown(window, { key: 'Enter' });
    const summary = screen.getByTestId('quiz-summary');
    expect(summary).toHaveTextContent('1 of 2 correct');
    expect(summary).toHaveTextContent(ui.summary.ranks.participant.name);

    // The missed question appears in the study list with its reference link.
    expect(summary).toHaveTextContent('First stub prompt?');
    expect(screen.getByRole('link', { name: /White paper — Gestures/ })).toHaveAttribute(
      'href',
      '/white-paper#gestures',
    );
    expect(summary).not.toHaveTextContent('Second stub prompt?');
  });

  it('locks options after answering and restart returns to a fresh first question', () => {
    begin();

    fireEvent.click(screen.getByText('First correct option'));
    expect(screen.getByTestId('quiz-option-2')).toBeDisabled();

    fireEvent.click(screen.getByTestId('quiz-next'));
    fireEvent.click(screen.getByText('Second correct option'));
    fireEvent.click(screen.getByTestId('quiz-next'));

    expect(screen.getByTestId('quiz-summary')).toHaveTextContent('2 of 2 correct');
    expect(screen.getByText(ui.summary.noMissesNote)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('quiz-restart'));
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent('Question 1 of 2');
  });
});
