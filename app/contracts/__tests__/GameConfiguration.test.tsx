import { fireEvent, render, screen, checkA11y } from '@/test-utils';

import { GameConfiguration } from '../components/GameConfiguration';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
    }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

jest.mock('../../../utils', () => ({
  formatSeconds: (s: number) => (s > 0 ? `${s}s` : '0s'),
}));

const defaultProps = {
  priceIncrease: 1,
  timeIncrease: 1,
  timeIncrement: 3600,
  cstRewardPerBid: 200,
  maxMessageLength: 280,
  claimTimeout: 86400,
  initialIncrement: 43200,
};

describe('GameConfiguration', () => {
  it('renders all stat cards with correct values', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Gesture-Cost Drift')).toBeInTheDocument();
    expect(screen.getByText('1%')).toBeInTheDocument();
    expect(screen.getByText('Time Increment')).toBeInTheDocument();
    expect(screen.getByText('3600s')).toBeInTheDocument();
    expect(screen.getByText('Participation CST per Gesture')).toBeInTheDocument();
    expect(screen.getByText('200 CST')).toBeInTheDocument();
    expect(screen.getByText('Max Message Length')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('renders the Protocol Configuration section title', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Protocol Configuration')).toBeInTheDocument();
  });

  it('renders formatted time values', () => {
    render(<GameConfiguration {...defaultProps} />);
    expect(screen.getByText('Finalization Timeout')).toBeInTheDocument();
    expect(screen.getByText('86400s')).toBeInTheDocument();
    expect(screen.getByText('Initial Time Increment')).toBeInTheDocument();
    expect(screen.getByText('43200s')).toBeInTheDocument();
  });

  it('handles zero/missing values with "--" fallback', () => {
    render(
      <GameConfiguration
        priceIncrease={0}
        timeIncrease={0}
        timeIncrement={0}
        cstRewardPerBid={0}
        maxMessageLength={0}
        claimTimeout={0}
        initialIncrement={0}
      />,
    );
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('displays time increment as duration, not the increase percentage', () => {
    render(<GameConfiguration {...defaultProps} timeIncrease={5} timeIncrement={7200} />);
    expect(screen.getByText('7200s')).toBeInTheDocument();
    expect(screen.queryByText('5%')).not.toBeInTheDocument();
  });

  it('shows "--" for Time Increment when timeIncrement is 0 regardless of timeIncrease', () => {
    render(<GameConfiguration {...defaultProps} timeIncrease={1} timeIncrement={0} />);
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading skeletons when loading is true', () => {
    const { container } = render(<GameConfiguration {...defaultProps} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GameConfiguration {...defaultProps} />);
    await checkA11y(container);
  });
});

describe('GameConfiguration tooltips', () => {
  const STAT_TOOLTIPS: Array<{ label: string; tooltip: string | RegExp }> = [
    {
      label: 'Gesture-Cost Drift',
      tooltip: /Each gesture increases the next Gesture Cost by this percentage/,
    },
    {
      label: 'Time Increment',
      tooltip:
        /Each gesture adds this much time to the Cycle Finalization Time\. The increment grows by 1% with each cycle\./,
    },
    {
      label: 'Participation CST per Gesture',
      tooltip: /Cosmic Signature Tokens imprinted with each gesture/,
    },
    {
      label: 'Finalization Timeout',
      tooltip: /Time the Final Gesture participant has to finalize the cycle/,
    },
    {
      label: 'Initial Time Increment',
      tooltip: /The initial Cycle Finalization Time added when the first gesture is made/,
    },
    {
      label: 'Max Message Length',
      tooltip: /Maximum character length allowed in gesture messages/,
    },
  ];

  function openTooltipNextTo(label: string): HTMLElement {
    // The InfoTooltip renders an accessible button labelled "Show more
    // information" right next to its label inside a flex row. Anchor the lookup
    // on the label, then walk up to the row and find the trigger so we exercise
    // the actual UX (label-tooltip pairing) rather than relying on order.
    const labelNode = screen.getByText(label);
    const row = labelNode.parentElement;
    if (!row) {
      throw new Error(`Could not find tooltip row for label "${label}"`);
    }
    const trigger = row.querySelector<HTMLElement>('button[aria-label="Show more information"]');
    if (!trigger) {
      throw new Error(`Could not find tooltip trigger next to label "${label}"`);
    }
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    fireEvent(trigger, event);
    fireEvent.click(trigger);
    return trigger;
  }

  it.each(STAT_TOOLTIPS)(
    'wires the "$label" card to its expected tooltip copy',
    async ({ label, tooltip }) => {
      render(<GameConfiguration {...defaultProps} />);
      openTooltipNextTo(label);
      const popper = await screen.findByRole('tooltip');
      expect(popper.textContent ?? '').toMatch(tooltip);
    },
  );

  it('exposes one accessible tooltip trigger per stat card', () => {
    render(<GameConfiguration {...defaultProps} />);
    const triggers = screen.getAllByRole('button', { name: 'Show more information' });
    expect(triggers).toHaveLength(STAT_TOOLTIPS.length);
  });

  it('renders the open tooltip popper outside the StatCard render subtree (portaled)', async () => {
    const { container } = render(<GameConfiguration {...defaultProps} />);
    openTooltipNextTo('Initial Time Increment');
    const popper = await screen.findByRole('tooltip');

    // Portaling lifts the tooltip out of the StatCard's `overflow-hidden` and
    // backdrop-filter stacking context, so the popper must NOT be a descendant
    // of the rendered component subtree. It still has to be in the document so
    // assistive tech can reach it.
    expect(container.contains(popper)).toBe(false);
    expect(document.body.contains(popper)).toBe(true);
  });
});
