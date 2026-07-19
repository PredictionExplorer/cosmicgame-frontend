import { howItWorksContentEn } from '@/content/how-it-works';

import { TooltipProvider } from '@/components/ui/tooltip';

import { render, screen, checkA11y } from '@/test-utils';

import { GameOverview } from '../components/GameOverview';

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

const overview = howItWorksContentEn.overview;

describe('GameOverview', () => {
  it('renders the section heading', () => {
    renderWithTooltip(<GameOverview overview={overview} />);
    expect(screen.getByRole('heading', { name: 'How It Works' })).toBeInTheDocument();
    expect(screen.getByText(overview.subhead)).toBeInTheDocument();
  });

  it('renders all three card titles', () => {
    renderWithTooltip(<GameOverview overview={overview} />);
    expect(screen.getByText('Gesture')).toBeInTheDocument();
    expect(screen.getByText('Endure')).toBeInTheDocument();
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    renderWithTooltip(<GameOverview overview={overview} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders every card description from the content module', () => {
    renderWithTooltip(<GameOverview overview={overview} />);
    for (const card of overview.cards) {
      expect(screen.getByText(card.description)).toBeInTheDocument();
    }
    expect(screen.getByText(/Make a gesture with ETH or CST/)).toBeInTheDocument();
  });

  it('has the correct section id for anchor linking', () => {
    const { container } = renderWithTooltip(<GameOverview overview={overview} />);
    expect(container.querySelector('#protocol-overview')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTooltip(<GameOverview overview={overview} />);
    await checkA11y(container);
  });
});
