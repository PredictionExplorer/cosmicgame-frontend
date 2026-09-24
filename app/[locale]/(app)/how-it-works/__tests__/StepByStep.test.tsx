import { getHowItWorksContent, howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { StepByStep } from '../components/StepByStep';

const stepByStep = howItWorksContentEn.stepByStep;

describe('StepByStep', () => {
  it('renders the section heading', () => {
    render(<StepByStep stepByStep={stepByStep} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Getting started' })).toBeInTheDocument();
  });

  it('numbers the three steps in sentence case', () => {
    render(<StepByStep stepByStep={stepByStep} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    for (const step of stepByStep.steps) {
      expect(screen.getByRole('heading', { level: 3, name: step.title })).toBeInTheDocument();
    }
  });

  it('lets each locale place the step number, with no space beside Japanese', () => {
    const ja = getHowItWorksContent('ja').stepByStep;
    render(<StepByStep stepByStep={ja} />);
    expect(screen.getByText('ステップ1')).toBeInTheDocument();
    expect(getHowItWorksContent('ko').stepByStep.stepLabel).toBe('{n}단계');
  });

  it('renders every checklist item from the content module', () => {
    render(<StepByStep stepByStep={stepByStep} />);
    for (const step of stepByStep.steps) {
      for (const highlight of step.highlights) {
        expect(screen.getByText(highlight)).toBeInTheDocument();
      }
    }
    expect(screen.getByText(/Press the gesture button/)).toBeInTheDocument();
    expect(screen.queryByText(/Gesture Now/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StepByStep stepByStep={stepByStep} />);
    await checkA11y(container);
  });
});
