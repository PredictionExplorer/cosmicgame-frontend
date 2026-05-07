import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import { AuctionParameters } from '../components/AuctionParameters';

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

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

beforeEach(() => {
  mockWriteText.mockClear();
});

const defaultProps = {
  cstDurations: { AuctionDuration: 3600, ElapsedDuration: 1800 },
  ethDurations: { AuctionDuration: 7200, ElapsedDuration: 3600 },
  cstBeginningBidPrice: 100,
  charityAddress: '0xCharity123',
  charityPercentage: 7,
  explorerUrl: 'https://explorer.example.com',
  raffleEthWinners: 3,
  raffleNftWinnersBidding: 10,
  raffleNftWinnersStaking: 10,
};

describe('AuctionParameters', () => {
  it('renders CST and ETH calibration cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('CST Calibration Window')).toBeInTheDocument();
    expect(screen.getByText('ETH Calibration Window')).toBeInTheDocument();
  });

  it('renders duration and elapsed values', () => {
    render(<AuctionParameters {...defaultProps} />);
    const val3600 = screen.getAllByText('3600s');
    expect(val3600.length).toBe(2);
    expect(screen.getByText('1800s')).toBeInTheDocument();
    expect(screen.getByText('7200s')).toBeInTheDocument();
  });

  it('renders CST beginning gesture cost', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('100 CST')).toBeInTheDocument();
  });

  it('renders public goods address with copy and explorer link', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('Public Goods Address')).toBeInTheDocument();
    expect(screen.getByText('0xCharity123')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy Public Goods address')).toBeInTheDocument();

    const explorerLink = screen.getByLabelText('View Public Goods address on block explorer');
    expect(explorerLink).toHaveAttribute(
      'href',
      'https://explorer.example.com/address/0xCharity123',
    );
  });

  it('copies public goods address on copy button click', async () => {
    render(<AuctionParameters {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Copy Public Goods address'));
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('0xCharity123');
    });
  });

  it('renders public goods percentage', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('7%')).toBeInTheDocument();
  });

  it('renders Stellar Selection stat cards', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(screen.getByText('ETH Stellar Selection Recipients')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Participants)')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection (Anchored RWLK)')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(2);
  });

  it('renders section title', () => {
    render(<AuctionParameters {...defaultProps} />);
    expect(
      screen.getByText('Calibration Window & Stellar Selection Parameters'),
    ).toBeInTheDocument();
  });

  it('shows loading skeletons when loading is true', () => {
    const { container } = render(<AuctionParameters {...defaultProps} loading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles missing stellar selection data with "--" fallback', () => {
    render(
      <AuctionParameters
        {...defaultProps}
        raffleEthWinners={undefined}
        raffleNftWinnersBidding={undefined}
        raffleNftWinnersStaking={undefined}
      />,
    );
    const dashes = screen.getAllByText('--');
    expect(dashes.length).toBe(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AuctionParameters {...defaultProps} />);
    await checkA11y(container);
  });
});

describe('AuctionParameters tooltips', () => {
  function openTooltipNextTo(label: string): HTMLElement {
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

  // Both calibration cards reuse the same row labels ("Duration", "Elapsed
  // Duration") which is why these assertions go after a card-scoped lookup.
  const SHARED_ROW_TOOLTIPS: Array<{ label: string; tooltip: RegExp }> = [
    {
      label: 'Calibration Ceiling',
      tooltip: /Starting Gesture Cost of the CST Calibration Window/,
    },
    {
      label: 'Public Goods Address',
      tooltip: /currently receiving the Public Goods Allocation/,
    },
  ];

  it.each(SHARED_ROW_TOOLTIPS)(
    'wires the "$label" row to its expected tooltip copy',
    async ({ label, tooltip }) => {
      render(<AuctionParameters {...defaultProps} />);
      openTooltipNextTo(label);
      const popper = await screen.findByRole('tooltip');
      expect(popper.textContent ?? '').toMatch(tooltip);
    },
  );

  const STELLAR_TOOLTIPS: Array<{ label: string; tooltip: RegExp }> = [
    {
      label: 'ETH Stellar Selection Recipients',
      tooltip: /Number of participants randomly selected to receive ETH allocations/,
    },
    {
      label: 'NFT Stellar Selection (Participants)',
      tooltip: /Number of participants randomly selected to receive Cosmic Signature NFTs/,
    },
    {
      label: 'NFT Stellar Selection (Anchored RWLK)',
      tooltip: /Number of RandomWalk NFT anchor-holders randomly selected/,
    },
  ];

  it.each(STELLAR_TOOLTIPS)(
    'wires the "$label" stellar-selection card to its expected tooltip copy',
    async ({ label, tooltip }) => {
      render(<AuctionParameters {...defaultProps} />);
      openTooltipNextTo(label);
      const popper = await screen.findByRole('tooltip');
      expect(popper.textContent ?? '').toMatch(tooltip);
    },
  );

  it('renders both Duration and Elapsed Duration tooltips for the CST window', async () => {
    render(<AuctionParameters {...defaultProps} />);
    // The CST card is the first AuctionCard, so its rows come first in the DOM.
    // Open the CST "Duration" tooltip via the first matching label node.
    const durationLabels = screen.getAllByText('Duration');
    expect(durationLabels.length).toBeGreaterThanOrEqual(2);
    const cstDurationRow = durationLabels[0]!.parentElement!;
    const cstDurationTrigger = cstDurationRow.querySelector<HTMLElement>(
      'button[aria-label="Show more information"]',
    )!;
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    fireEvent(cstDurationTrigger, event);
    fireEvent.click(cstDurationTrigger);

    const popper = await screen.findByRole('tooltip');
    expect(popper.textContent ?? '').toMatch(/CST Calibration Window/);
  });

  it('opens AuctionParameters tooltips outside the rendered subtree (portaled)', async () => {
    const { container } = render(<AuctionParameters {...defaultProps} />);
    openTooltipNextTo('Calibration Ceiling');
    const popper = await screen.findByRole('tooltip');
    expect(container.contains(popper)).toBe(false);
    expect(document.body.contains(popper)).toBe(true);
  });
});
