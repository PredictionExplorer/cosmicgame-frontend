import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import { AnchoringQuestions } from '../AnchoringQuestions';
import { AnchoringSteps } from '../AnchoringSteps';

describe('AnchoringSteps', () => {
  it('walks a newcomer from anchoring through receiving to releasing', () => {
    render(<AnchoringSteps />);
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(
      screen.getByRole('heading', { name: 'anchoring.steps.anchor.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'anchoring.steps.receive.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'anchoring.steps.release.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringSteps />);
    await checkA11y(container);
  });
});

describe('AnchoringQuestions', () => {
  it('answers the common questions in native disclosures, closed at first', async () => {
    const user = userEvent.setup();
    render(<AnchoringQuestions />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'anchoring.questions.title' }),
    ).toBeInTheDocument();
    const questions = screen.getAllByText(/anchoring\.questions\.items\.\w+\.question/);
    expect(questions).toHaveLength(5);
    // The answers quote the protocol's constants rather than hard-coding them.
    const answer = screen.getByText(
      'anchoring.questions.items.anchorOnce.answer(percentage=6,selections=10,cst=1000)',
    );
    const disclosure = answer.closest('details');
    expect(disclosure).not.toHaveAttribute('open');
    await user.click(screen.getByText('anchoring.questions.items.anchorOnce.question'));
    expect(disclosure).toHaveAttribute('open');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringQuestions />);
    await checkA11y(container);
  });
});
