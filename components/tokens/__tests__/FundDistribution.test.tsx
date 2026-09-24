import { ALLOCATION_TRACK_COLORS, ALLOCATION_TRACK_IDS } from '@/config/allocationTracks';

import { render, screen, checkA11y } from '@/test-utils';

import { FundDistribution } from '../FundDistribution';

jest.mock('framer-motion', () => {
  const React = require('react');
  /** A plain element that exposes the animated width, so tests can read each bar's scale. */
  const element = (tag: string) => {
    function MotionElement({
      children,
      animate,
      initial: _initial,
      transition: _transition,
      ...rest
    }: Record<string, unknown> & {
      children?: React.ReactNode;
      animate?: { width?: string };
    }) {
      return React.createElement(tag, { ...rest, 'data-width': animate?.width }, children);
    }
    MotionElement.displayName = `motion.${tag}`;
    return MotionElement;
  };
  return {
    motion: { div: element('div'), li: element('li') },
    useReducedMotion: () => false,
  };
});

const createData = (overrides = {}) => ({
  PrizePercentage: 25,
  RafflePercentage: 4,
  CharityPercentage: 7,
  StakingPercentage: 6,
  ChronoWarriorPercentage: 8,
  CosmicGameBalanceEth: 10,
  ...overrides,
});

const row = (id: string) => {
  const element = document.querySelector(`[data-track="${id}"]`);
  if (!element) throw new Error(`no track row ${id}`);
  return element;
};

/** The row as a reader sees it: without the ⓘ button's hidden description. */
const visibleRow = (id: string) => {
  const copy = row(id).cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[hidden]').forEach((node) => node.remove());
  return copy;
};

describe('FundDistribution', () => {
  it('renders the container', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
  });

  it('renders all six category labels', () => {
    render(<FundDistribution data={createData()} />);
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distribution')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Next cycle')).toBeInTheDocument();
  });

  it('renders percentage values for each category', () => {
    render(<FundDistribution data={createData()} />);
    expect(row('signature')).toHaveTextContent('25%');
    expect(row('nextCycle')).toHaveTextContent('50%');
    expect(row('chrono')).toHaveTextContent('8%');
    expect(row('publicGoods')).toHaveTextContent('7%');
    expect(row('anchor')).toHaveTextContent('6%');
    expect(row('stellar')).toHaveTextContent('4%');
  });

  it('renders ETH amounts', () => {
    render(<FundDistribution data={createData({ CosmicGameBalanceEth: 100 })} />);
    expect(row('signature')).toHaveTextContent('(25.0000 ETH)');
    expect(row('nextCycle')).toHaveTextContent('(50.0000 ETH)');
    expect(row('chrono')).toHaveTextContent('(8.0000 ETH)');
    expect(row('publicGoods')).toHaveTextContent('(7.0000 ETH)');
    expect(row('anchor')).toHaveTextContent('(6.0000 ETH)');
    expect(row('stellar')).toHaveTextContent('(4.0000 ETH)');
  });

  it('computes the next cycle as the remainder', () => {
    render(<FundDistribution data={createData()} />);
    // 100 - 25 - 4 - 7 - 6 - 8 = 50%
    expect(row('nextCycle')).toHaveTextContent('50%');
  });

  it('draws each bar against the whole reserve, not the largest track', () => {
    // Regression: bars were scaled to the largest share, so the 50% next-cycle bar filled
    // the whole track and the 25% Signature Allocation filled half of it.
    render(<FundDistribution data={createData()} />);
    expect(screen.getByTestId('fund-track-fill-signature')).toHaveAttribute('data-width', '25%');
    expect(screen.getByTestId('fund-track-fill-nextCycle')).toHaveAttribute('data-width', '50%');
    expect(screen.getByTestId('fund-track-fill-stellar')).toHaveAttribute('data-width', '4%');
  });

  it('colours each track as the other allocation charts do', () => {
    render(<FundDistribution data={createData()} />);
    for (const id of ALLOCATION_TRACK_IDS) {
      expect(screen.getByTestId(`fund-track-fill-${id}`)).toHaveClass(ALLOCATION_TRACK_COLORS[id]);
    }
  });

  it('draws each track with its concept icon', () => {
    render(<FundDistribution data={createData()} />);
    const glyph = (id: string) =>
      [...(row(id).querySelector('svg')?.classList ?? [])].find((name) =>
        name.startsWith('lucide-'),
      );
    // Anchor Distribution is Split everywhere (allocation pages, My Anchors);
    // Anchor is the act of Anchoring, not its distribution.
    expect(glyph('anchor')).toBe('lucide-split');
    expect(glyph('nextCycle')).toBe('lucide-rotate-ccw');
  });

  it('lists the tracks in the shared order', () => {
    render(<FundDistribution data={createData()} />);
    const order = Array.from(document.querySelectorAll('[data-track]')).map((element) =>
      element.getAttribute('data-track'),
    );
    expect(order).toEqual([...ALLOCATION_TRACK_IDS]);
  });

  it('shows unread shares and amounts as unavailable, never as 0%', () => {
    render(<FundDistribution />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
    expect(row('signature')).toHaveTextContent('common.status.unavailable');
    expect(visibleRow('signature')).not.toHaveTextContent(/\d/);
    // The remainder is unknown while any share is unknown.
    expect(visibleRow('nextCycle')).not.toHaveTextContent(/\d/);
    expect(screen.queryByTestId(/^fund-track-fill-/)).not.toBeInTheDocument();
  });

  it('shows the ETH amount as unavailable when the reserve balance is unread', () => {
    render(<FundDistribution data={createData({ CosmicGameBalanceEth: undefined })} />);
    expect(row('signature')).toHaveTextContent('25%');
    expect(visibleRow('signature')).not.toHaveTextContent('ETH');
    expect(row('signature')).toHaveTextContent('common.status.unavailable');
  });

  it('clamps negative percentages to zero', () => {
    render(<FundDistribution data={createData({ PrizePercentage: -10 })} />);
    expect(row('signature')).toHaveTextContent('0%');
    expect(screen.queryByTestId('fund-track-fill-signature')).not.toBeInTheDocument();
  });

  it('clamps percentages above 100 to 100', () => {
    render(<FundDistribution data={createData({ RafflePercentage: 200 })} />);
    expect(row('stellar')).toHaveTextContent('100%');
  });

  it('renders tooltip icons for each category', () => {
    const { container } = render(<FundDistribution data={createData()} />);
    const tooltipTriggers = container.querySelectorAll('[data-state="closed"]');
    expect(tooltipTriggers.length).toBeGreaterThanOrEqual(6);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution data={createData()} />);
    await checkA11y(container);
  }, 15_000);
});
