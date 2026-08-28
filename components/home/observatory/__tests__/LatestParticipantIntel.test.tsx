import type { ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api';

import { render, screen, within, checkA11y } from '@/test-utils';

import { LatestParticipantIntel } from '../LatestParticipantIntel';

const ADDRESS = '0x1111111111111111111111111111111111111111';

const champions: ChampionsState = {
  isLoading: false,
  hasData: true,
  endurance: {
    address: '0x2222222222222222222222222222222222222222',
    duration: 3600,
    lockedDuration: 3600,
    isLive: false,
  },
  chrono: {
    address: '0x3333333333333333333333333333333333333333',
    duration: 1800,
    lockedDuration: 1800,
    isLive: false,
  },
  chronoChallenge: {
    address: '0x2222222222222222222222222222222222222222',
    recordToBeat: 1800,
    isLive: false,
    isRecordHolder: false,
    hasDetails: false,
  },
  lastCst: { address: null },
  latestGesture: {
    address: ADDRESS,
    holdDuration: 900,
    latestGestureTime: 1_700_000_000,
    isCurrentEnduranceChampion: false,
    isExtendingEnduranceRecord: false,
    durationToBeat: 3601,
    secondsUntilEnduranceChampion: 2701,
    progressToEnduranceChampion: 24.99,
  },
  raw: null,
  source: 'api-v2',
};

const latestGesture = {
  EvtLogId: 77,
  BlockNum: 100,
  TxId: 7,
  TxHash: '0x77',
  BidPosition: 12,
  TimeStamp: 1_700_000_000,
  BidderAddr: ADDRESS,
  RoundNum: 7,
  GestureType: 1,
  GestureCostEth: 0.05,
  ParticipationCST: 123.45,
  RWalkNFTId: 42,
  NFTDonationTokenAddr: '0xNFT',
  NFTDonationTokenId: 9,
  DonatedERC20TokenAddr: '0xToken',
  Message: 'The orbit holds.',
} as GestureInfo;

const baseProps = {
  champions,
  latestGesture,
  latestMessage: 'The orbit holds.',
  account: '0xUser' as string | null,
  signatureEth: 2.75,
  attachedNftCount: 2,
  attachedErc20Count: 1,
  showLastGesture: true,
};

describe('LatestParticipantIntel', () => {
  it('shows full participant identity with profile and gesture links', () => {
    render(<LatestParticipantIntel {...baseProps} />);

    const intel = screen.getByTestId('latest-participant-intel');
    expect(within(intel).getByText(ADDRESS)).toHaveAttribute('href', `/user/${ADDRESS}`);
    expect(
      within(screen.getByTestId('latest-participant-gesture-details')).getByRole('link', {
        name: ADDRESS,
      }),
    ).toHaveAttribute('href', `/user/${ADDRESS}`);
    expect(
      within(intel).getByRole('link', { name: /home\.observatory\.intel\.viewGesture/ }),
    ).toHaveAttribute('href', '/gesture/77');
    expect(intel).toHaveTextContent('tables.specialAllocation.currentHold');
    expect(intel).toHaveTextContent('15m');
  });

  it('shows every decision-critical field from the latest gesture', () => {
    render(<LatestParticipantIntel {...baseProps} />);

    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('0.0500000 ETH');
    expect(screen.getByTestId('latest-participant-gesture-details')).toHaveTextContent(
      'tables.specialAllocation.method',
    );
    expect(screen.getByTestId('latest-participant-gesture-details')).toHaveTextContent(
      'Random Walk',
    );
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('123.45 CST');
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent(
      'tables.specialAllocation.yesToken',
    );
    expect(screen.getByTestId('latest-participant-gesture-id')).toHaveTextContent('#12');
    expect(screen.getByTestId('latest-participant-attached-assets')).toHaveTextContent(
      'NFT + ERC20',
    );
    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('The orbit holds.');
  });

  it('exposes current versus target Endurance progress accessibly', () => {
    render(<LatestParticipantIntel {...baseProps} />);

    const progress = screen.getByRole('progressbar', {
      name: 'tables.specialAllocation.progressAria',
    });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '24');
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.needsToBecomeChampion',
    );
  });

  it('separates received CST from the still-pending finalization package', () => {
    render(<LatestParticipantIntel {...baseProps} />);

    const received = screen.getByTestId('latest-participant-cst-received');
    const pending = screen.getByTestId('latest-participant-allocation-package');
    expect(received).toHaveTextContent('123.45 CST');
    expect(pending).toHaveTextContent('home.observatory.intel.inLineFor');
    expect(pending).toHaveTextContent('home.allocation.amounts.eth(amount=2.7500)');
    expect(pending).toHaveTextContent('home.allocation.amounts.fixedCst');
    expect(pending).toHaveTextContent('home.allocation.amounts.nft');
  });

  it('includes cycle-held attachments in the pending package', () => {
    render(<LatestParticipantIntel {...baseProps} />);

    const pending = screen.getByTestId('latest-participant-allocation-package');
    expect(pending).toHaveTextContent('home.observatory.intel.attachedNfts(count=2)');
    expect(pending).toHaveTextContent('home.observatory.intel.attachedTokens(count=1)');
  });

  it('marks the connected participant without changing the address', () => {
    render(<LatestParticipantIntel {...baseProps} account={ADDRESS.toUpperCase()} />);
    expect(screen.getByText('tables.status.youBadge')).toBeInTheDocument();
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
  });

  it('never hides an indexed Last Gesture because role sources temporarily disagree', () => {
    const other = '0x9999999999999999999999999999999999999999';
    render(
      <LatestParticipantIntel
        {...baseProps}
        latestGesture={{
          ...latestGesture,
          BidderAddr: other,
        }}
      />,
    );

    expect(screen.getByTestId('latest-participant-gesture-details')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('latest-participant-gesture-details')).getByRole('link', {
        name: other,
      }),
    ).toHaveAttribute('href', `/user/${other}`);
    expect(screen.getByTestId('latest-participant-allocation-package')).toBeInTheDocument();
  });

  it.each([ADDRESS, '0x9999999999999999999999999999999999999999', null])(
    'shows identical Last Gesture metrics for wallet state %s',
    (account) => {
      render(<LatestParticipantIntel {...baseProps} account={account} />);
      expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent(
        '0.0500000 ETH',
      );
      expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('123.45 CST');
    },
  );

  it('keeps the Last Gesture panel mounted while matching transaction details sync', () => {
    render(
      <LatestParticipantIntel
        {...baseProps}
        latestGesture={null}
        latestMessage="stale message"
        gestureDetailsPending
      />,
    );

    expect(screen.getByTestId('latest-participant-gesture-details')).toBeInTheDocument();
    expect(screen.getByTestId('latest-participant-gesture-syncing')).toHaveTextContent(
      'tables.specialAllocation.gestureDetailsSyncing',
    );
    expect(screen.queryByTestId('latest-participant-message')).not.toBeInTheDocument();
  });

  it('omits Last Gesture only when the active-cycle visibility contract is false', () => {
    render(<LatestParticipantIntel {...baseProps} showLastGesture={false} />);
    expect(screen.queryByTestId('latest-participant-gesture-details')).not.toBeInTheDocument();
  });

  it('binds the message to the displayed gesture instead of a stale external prop', () => {
    render(
      <LatestParticipantIntel
        {...baseProps}
        latestMessage="stale message"
        latestGesture={{ ...latestGesture, Message: 'fresh message' }}
      />,
    );

    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('fresh message');
    expect(screen.queryByText('stale message')).not.toBeInTheDocument();
  });

  it('shows a stable empty state before the first gesture', () => {
    const noLatest: ChampionsState = {
      ...champions,
      latestGesture: {
        ...champions.latestGesture,
        address: null,
        holdDuration: 0,
        latestGestureTime: null,
      },
    };

    render(
      <LatestParticipantIntel
        {...baseProps}
        champions={noLatest}
        latestGesture={null}
        latestMessage=""
      />,
    );

    expect(screen.getByText('tables.specialAllocation.noLatestGesture')).toBeInTheDocument();
    expect(screen.getByTestId('latest-participant-empty')).toHaveClass(
      'flex-1',
      'items-center',
      'justify-center',
    );
    expect(screen.queryByTestId('latest-participant-gesture-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('latest-participant-allocation-package')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LatestParticipantIntel {...baseProps} />);
    await checkA11y(container);
  });
});
