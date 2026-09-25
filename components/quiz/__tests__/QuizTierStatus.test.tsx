import { render, screen } from '@testing-library/react';

import { quizContentEn } from '@/content/quiz';

import { QuizTierStatus } from '@/components/quiz/QuizTierStatus';
import {
  attemptStorageKey,
  bestScoreStorageKey,
  buildAttempt,
  saveAttempt,
} from '@/components/quiz/quizProgress';

const { hub, ui, tiers } = quizContentEn;
const basic = tiers[0]!;

function renderStatus() {
  return render(
    <QuizTierStatus
      tierId="basic"
      total={basic.questions.length}
      locale="en"
      bestTemplate={hub.bestTemplate}
      inProgressTemplate={hub.inProgressTemplate}
      startLabel={hub.startLabel}
      resumeLabel={hub.resumeLabel}
      rankNames={{
        reader: ui.summary.ranks.reader.name,
        student: ui.summary.ranks.student.name,
        scholar: ui.summary.ranks.scholar.name,
        cartographer: ui.summary.ranks.cartographer.name,
      }}
    />,
  );
}

describe('<QuizTierStatus />', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('offers Start when this browser remembers nothing', () => {
    renderStatus();
    expect(screen.getByText(hub.startLabel)).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-tier-status')).not.toBeInTheDocument();
  });

  it('shows the best score and its rank', () => {
    window.localStorage.setItem(
      bestScoreStorageKey('basic'),
      JSON.stringify({ correct: 20, total: 25 }),
    );
    renderStatus();
    expect(screen.getByTestId('quiz-tier-status')).toHaveTextContent('Best 20 of 25 · Scholar');
  });

  it('offers Resume for a run in progress', () => {
    const attempt = buildAttempt(basic.questions);
    attempt.answers = [
      {
        questionId: attempt.questions[0]!.question.id,
        chosenOptionId: attempt.questions[0]!.options[0]!.id,
        correct: false,
      },
    ];
    attempt.currentIndex = 1;
    saveAttempt(window.sessionStorage, attemptStorageKey('en', 'basic'), attempt);

    renderStatus();
    expect(screen.getByText(hub.resumeLabel)).toBeInTheDocument();
    expect(screen.getByTestId('quiz-tier-status')).toHaveTextContent(
      'In progress: question 2 of 25',
    );
  });
});
