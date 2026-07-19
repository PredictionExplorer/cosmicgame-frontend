import { howItWorksContentEn } from '@/content/how-it-works';

import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { StepByStep } from '../components/StepByStep';

jest.mock('framer-motion', () => {
  const React = require('react');
  const cache: Record<string, React.ForwardRefExoticComponent<unknown>> = {};
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          if (!cache[prop]) {
            const Comp = React.forwardRef(function MotionProxy(
              props: Record<string, unknown>,
              ref: React.Ref<HTMLElement>,
            ) {
              const {
                initial: _i,
                animate: _a,
                whileInView: _w,
                viewport: _v,
                transition: _t,
                variants: _va,
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

const renderWithTooltip = (ui: React.ReactElement) =>
  render(<TooltipProvider>{ui}</TooltipProvider>);

const stepByStep = howItWorksContentEn.stepByStep;

describe('StepByStep', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<StepByStep stepByStep={stepByStep} />);
    expect(screen.getByRole('heading', { name: 'Getting Started' })).toBeInTheDocument();
  });

  it('renders all three step titles', () => {
    renderWithTooltip(<StepByStep stepByStep={stepByStep} />);
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    expect(screen.getByText('Check the Gesture Cost')).toBeInTheDocument();
    expect(screen.getByText('Make Your Gesture')).toBeInTheDocument();
  });

  it('renders step labels with correct numbering', () => {
    renderWithTooltip(<StepByStep stepByStep={stepByStep} />);
    expect(screen.getByText('STEP 01')).toBeInTheDocument();
    expect(screen.getByText('STEP 02')).toBeInTheDocument();
    expect(screen.getByText('STEP 03')).toBeInTheDocument();
  });

  it('renders every highlight bullet from the content module', () => {
    renderWithTooltip(<StepByStep stepByStep={stepByStep} />);
    for (const step of stepByStep.steps) {
      for (const highlight of step.highlights) {
        expect(screen.getByText(highlight)).toBeInTheDocument();
      }
    }
    expect(screen.getByText(/Connect Wallet/)).toBeInTheDocument();
    expect(screen.getByText(/Click "Gesture Now"/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<StepByStep stepByStep={stepByStep} />);
    await checkA11y(container);
  });
});
