import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { AllocationTracksSection } from '../components/AllocationTracksSection';

const DASHBOARD = {
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
  CharityPercentage: 7,
};
const defaultProps = { data: DASHBOARD };

const figure = (track: string) => document.querySelector(`[data-track="${track}"] dd`);

describe('AllocationTracksSection', () => {
  it('clamps an out-of-range share the way every chart of the split does', () => {
    render(<AllocationTracksSection data={{ ...DASHBOARD, PrizePercentage: 140 }} />);
    expect(figure('signature')).toHaveTextContent('100%');
    expect(screen.getByTestId('fund-segment-signature')).toHaveStyle({ width: '100%' });
  });

  it('titles the section in sentence case', () => {
    render(<AllocationTracksSection {...defaultProps} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Allocation tracks' }),
    ).toBeInTheDocument();
  });

  it('lists every track with its share, and the remainder that carries forward', () => {
    render(<AllocationTracksSection {...defaultProps} />);
    expect(figure('signature')).toHaveTextContent('25%');
    expect(figure('chrono')).toHaveTextContent('8%');
    expect(figure('stellar')).toHaveTextContent('4%');
    expect(figure('anchor')).toHaveTextContent('6%');
    expect(figure('publicGoods')).toHaveTextContent('7%');
    expect(figure('nextCycle')).toHaveTextContent('50%');
    for (const label of [
      'Signature Allocation',
      'Chrono-Warrior',
      'Stellar Selection',
      'Anchor Distribution',
      'Public Goods',
      'Next cycle',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('draws each track against the whole Cycle Reserve, not against their sum', () => {
    // Regression: the five distributed tracks sum to 50%, and the bar once stretched them
    // to the full width, so the 25% Signature Allocation filled half of it.
    render(<AllocationTracksSection {...defaultProps} />);
    expect(screen.getByTestId('fund-segment-signature')).toHaveStyle({ width: '25%' });
    expect(screen.getByTestId('fund-segment-publicGoods')).toHaveStyle({ width: '7%' });
    expect(screen.getByTestId('fund-segment-nextCycle')).toHaveStyle({ width: '50%' });
    expect(screen.getByRole('img', { name: /allocation tracks bar chart/i })).toBeInTheDocument();
  });

  it('shows zero shares as 0% and draws no segment for them', () => {
    render(
      <AllocationTracksSection
        data={{
          PrizePercentage: 0,
          ChronoWarriorPercentage: 0,
          RafflePercentage: 0,
          StakingPercentage: 0,
          CharityPercentage: 0,
        }}
      />,
    );
    expect(screen.getAllByText('0%')).toHaveLength(5);
    expect(figure('nextCycle')).toHaveTextContent('100%');
    expect(screen.queryByTestId('fund-segment-signature')).not.toBeInTheDocument();
  });

  it('renders missing percentages as unavailable, never as 0%', () => {
    render(<AllocationTracksSection />);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(screen.getAllByText('common.status.unavailable')).toHaveLength(6);
    expect(screen.queryByTestId(/^fund-segment-/)).not.toBeInTheDocument();
  });

  it('leaves the next-cycle share unknown when any track is unknown', () => {
    render(<AllocationTracksSection data={{ ...DASHBOARD, CharityPercentage: undefined }} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.queryByText('57%')).not.toBeInTheDocument();
    expect(screen.getAllByText('common.status.unavailable')).toHaveLength(2);
  });

  it('shows skeletons, not figures, while the dashboard loads', () => {
    const { container } = render(<AllocationTracksSection loading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/%/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTracksSection {...defaultProps} />);
    await checkA11y(container);
  });
});

describe('AllocationTracksSection definitions', () => {
  const SEGMENT_DEFINITIONS: Array<{ label: string; definition: RegExp }> = [
    { label: 'Signature Allocation', definition: /participant who made the Final Gesture/ },
    { label: 'Chrono-Warrior', definition: /ETH allocation to the Chrono-Warrior/ },
    {
      label: 'Stellar Selection',
      definition: /Portion distributed to randomly selected participants/,
    },
    {
      label: 'Anchor Distribution',
      definition: /ETH Anchor Distributions to Cosmic Signature NFT anchor-holders/,
    },
    { label: 'Public Goods', definition: /Forwarded to the Public Goods Beneficiary/ },
    { label: 'Next cycle', definition: /roll forward into the next cycle/ },
  ];

  it.each(SEGMENT_DEFINITIONS)(
    'the "$label" label explains itself when pressed',
    async ({ label, definition }) => {
      render(<AllocationTracksSection {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: `More information about ${label}` }));
      const card = await screen.findByRole('tooltip');
      expect(card.textContent ?? '').toMatch(definition);
    },
  );

  it('offers one explanation per track and no other', () => {
    render(<AllocationTracksSection {...defaultProps} />);
    expect(screen.getAllByRole('button', { name: /^More information about/ })).toHaveLength(
      SEGMENT_DEFINITIONS.length,
    );
  });
});
