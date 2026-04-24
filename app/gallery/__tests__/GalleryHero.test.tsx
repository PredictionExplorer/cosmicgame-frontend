import { render, screen, checkA11y } from '@/test-utils';

import { GalleryHero, type GalleryStats } from '../components/GalleryHero';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_t: unknown, prop: string) => {
          const Comp = React.forwardRef(function MotionProxy(
            props: Record<string, unknown>,
            ref: React.Ref<HTMLElement>,
          ) {
            const { initial: _i, animate: _a, transition: _tr, ...rest } = props;
            return React.createElement(prop, { ...rest, ref });
          });
          Comp.displayName = `motion.${prop}`;
          return Comp;
        },
      },
    ),
  };
});

const defaultStats: GalleryStats = {
  total: 1234,
  staked: 567,
  named: 89,
  rounds: 42,
};

describe('GalleryHero', () => {
  it('renders all four stat labels', () => {
    render(<GalleryHero stats={defaultStats} />);
    expect(screen.getByText('Total Minted')).toBeInTheDocument();
    expect(screen.getByText('Currently Anchored')).toBeInTheDocument();
    expect(screen.getByText('Named NFTs')).toBeInTheDocument();
    expect(screen.getByText('Game Rounds')).toBeInTheDocument();
  });

  it('renders stat icons', () => {
    const { container } = render(<GalleryHero stats={defaultStats} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(4);
  });

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(<GalleryHero stats={defaultStats} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('renders zero stats correctly', () => {
    const zeroStats: GalleryStats = { total: 0, staked: 0, named: 0, rounds: 0 };
    render(<GalleryHero stats={zeroStats} />);
    expect(screen.getByText('Total Minted')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryHero stats={defaultStats} />);
    await checkA11y(container);
  });
});
