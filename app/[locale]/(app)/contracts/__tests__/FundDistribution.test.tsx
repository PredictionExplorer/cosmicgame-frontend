import { fireEvent, render, screen, checkA11y } from '@/test-utils';

import { FundDistribution } from '../components/FundDistribution';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      title,
      className,
      animate,
      'data-testid': testId,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: { width?: string };
      transition?: unknown;
      'data-testid'?: string;
    }) => (
      <div
        className={className}
        title={title}
        data-testid={testId ?? 'motion-div'}
        data-width={animate?.width}
      >
        {children}
      </div>
    ),
  },
}));

const defaultProps = {
  prizePercentage: 25,
  chronoWarriorPercentage: 8,
  stellarSelectionPercentage: 4,
  stakingPercentage: 6,
  charityPercentage: 7,
};

describe('FundDistribution', () => {
  it('renders all percentage segments with labels', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('Anchor Distribution')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
    expect(screen.getByText('Next cycle')).toBeInTheDocument();
  });

  it('renders percentage values for each segment', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
    expect(screen.getByText('6%')).toBeInTheDocument();
    expect(screen.getByText('7%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('draws each track against the whole Cycle Reserve, not against their sum', () => {
    // Regression: the five distributed tracks sum to 50%, and the bar once stretched them
    // to the full width, so the 25% Signature Allocation filled half of it.
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByTestId('fund-segment-signature')).toHaveAttribute('data-width', '25%');
    expect(screen.getByTestId('fund-segment-publicGoods')).toHaveAttribute('data-width', '7%');
    expect(screen.getByTestId('fund-segment-nextCycle')).toHaveAttribute('data-width', '50%');
  });

  it('renders the Allocation Tracks title', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByText('Allocation Tracks')).toBeInTheDocument();
  });

  it('renders the distribution bar', () => {
    render(<FundDistribution {...defaultProps} />);
    expect(screen.getByRole('img', { name: /allocation tracks bar chart/i })).toBeInTheDocument();
  });

  it('handles zero percentages gracefully', () => {
    render(
      <FundDistribution
        prizePercentage={0}
        chronoWarriorPercentage={0}
        stellarSelectionPercentage={0}
        stakingPercentage={0}
        charityPercentage={0}
      />,
    );
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBe(5);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders missing percentages as unavailable, never as 0%', () => {
    render(<FundDistribution />);
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(screen.getAllByText('common.status.unavailable')).toHaveLength(6);
    expect(screen.queryByTestId(/^fund-segment-/)).not.toBeInTheDocument();
  });

  it('leaves the next-cycle share unknown when any track is unknown', () => {
    render(<FundDistribution {...defaultProps} charityPercentage={undefined} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
    expect(screen.queryByText('57%')).not.toBeInTheDocument();
    expect(screen.getAllByText('common.status.unavailable')).toHaveLength(2);
  });

  it('shows loading skeleton when loading is true', () => {
    const { container } = render(<FundDistribution loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution {...defaultProps} />);
    await checkA11y(container);
  });
});

describe('FundDistribution tooltips', () => {
  function openTooltipNextTo(label: string): HTMLElement {
    const labelNode = screen.getByText(label);
    const row = labelNode.parentElement;
    if (!row) {
      throw new Error(`Could not find tooltip row for label "${label}"`);
    }
    const trigger = row.querySelector<HTMLElement>('button[aria-label^="More information"]');
    if (!trigger) {
      throw new Error(`Could not find tooltip trigger next to label "${label}"`);
    }
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    fireEvent(trigger, event);
    fireEvent.click(trigger);
    return trigger;
  }

  const SEGMENT_TOOLTIPS: Array<{ label: string; tooltip: string | RegExp }> = [
    {
      label: 'Signature Allocation',
      tooltip: /participant who made the Final Gesture/,
    },
    {
      label: 'Chrono-Warrior',
      tooltip: /ETH allocation to the Chrono-Warrior/,
    },
    {
      label: 'Stellar Selection',
      tooltip: /Portion distributed to randomly selected participants/,
    },
    {
      label: 'Anchor Distribution',
      tooltip: /ETH Anchor Distributions to Cosmic Signature NFT anchor-holders/,
    },
    {
      label: 'Public Goods',
      tooltip: /Forwarded to the Public Goods Beneficiary/,
    },
    {
      label: 'Next cycle',
      tooltip: /roll forward into the next cycle/,
    },
  ];

  it.each(SEGMENT_TOOLTIPS)(
    'wires the "$label" segment to its expected tooltip copy',
    async ({ label, tooltip }) => {
      render(<FundDistribution {...defaultProps} />);
      openTooltipNextTo(label);
      const popper = await screen.findByRole('tooltip');
      expect(popper.textContent ?? '').toMatch(tooltip);
    },
  );

  it('exposes one tooltip trigger per segment plus one for the section title', () => {
    render(<FundDistribution {...defaultProps} />);
    const triggers = screen.getAllByRole('button', { name: /information/i });
    expect(triggers).toHaveLength(SEGMENT_TOOLTIPS.length + 1);
  });

  it('opens the tooltip popper outside the FundDistribution render subtree (portaled)', async () => {
    const { container } = render(<FundDistribution {...defaultProps} />);
    openTooltipNextTo('Signature Allocation');
    const popper = await screen.findByRole('tooltip');
    expect(container.contains(popper)).toBe(false);
    expect(document.body.contains(popper)).toBe(true);
  });
});
