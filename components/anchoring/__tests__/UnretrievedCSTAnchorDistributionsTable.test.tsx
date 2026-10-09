import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import type { CSTAnchorDistribution } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import {
  UnretrievedCSTAnchorDistributionsTable,
  unretrievedActionIds,
} from '../UnretrievedCSTAnchorDistributionsTable';

const OWNER = '0x1234567890abcdef1234567890abcdef12345678';
const OTHER = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const mockAccount = { current: OWNER as string | null };
const mockRelease = jest.fn();
const mockRewards = jest.fn();
const mockDeposits = jest.fn();
const mockUnretrievedEth = { current: 0.3124 };

jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount.current }),
}));
jest.mock('@/hooks/useAnchorActions', () => ({
  useAnchorActions: () => ({ release: mockRelease, txStage: { status: 'idle' } }),
}));
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTAnchorDistributionsToRetrieveByUser: (user: string) => mockRewards(user),
  useCSTAnchorDistributionsByUserByDeposit: (user: string | null) => mockDeposits(user),
}));
jest.mock('@/contexts/ApiDataContext', () => ({
  useApiData: () => ({ apiData: { UnretrievedAnchorDistribution: mockUnretrievedEth.current } }),
}));
jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const row = (overrides: Partial<CSTAnchorDistribution> = {}): CSTAnchorDistribution => ({
  EvtLogId: 1,
  RoundNum: 1,
  TokenId: 0,
  DepositId: 18,
  DepositTimeStamp: 1_786_491_506,
  YourTokensStaked: 3,
  NumStakedNFTs: 17,
  NumUnclaimedTokens: 3,
  DepositAmountEth: 2.65478,
  YourRewardAmountEth: 0.4685,
  PendingToClaimEth: 0.3124,
  ...overrides,
});

const DEPOSITS = [
  { Actions: [{ Claimed: true, Stake: { ActionId: 1 } }] },
  {
    Actions: [
      { Claimed: false, Stake: { ActionId: 4 } },
      { Claimed: true, Stake: { ActionId: 5 } },
      { Claimed: false, Stake: { ActionId: 6 } },
    ],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.current = OWNER;
  mockUnretrievedEth.current = 0.3124;
  mockRewards.mockReturnValue({ data: [row()], isLoading: false, error: null, refetch: jest.fn() });
  mockDeposits.mockReturnValue({ data: DEPOSITS });
  mockRelease.mockResolvedValue({ status: 'confirmed' });
});

describe('unretrievedActionIds', () => {
  it('takes the unretrieved anchors of the newest deposit', () => {
    expect(unretrievedActionIds(DEPOSITS)).toEqual([4, 6]);
  });

  it('is empty without deposits', () => {
    expect(unretrievedActionIds(undefined)).toEqual([]);
    expect(unretrievedActionIds([])).toEqual([]);
  });
});

describe('UnretrievedCSTAnchorDistributionsTable', () => {
  it('lists each unretrieved deposit with this address’s share of the anchored NFTs', () => {
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    expect(
      screen.getByText(
        'anchoring.tables.unretrievedDistributions.anchoredOfTotal(count=3,total=17)',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('0.3124').length).toBeGreaterThanOrEqual(1);
  });

  it('offers "release all" on the wallet’s own page, through the confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    await user.click(
      screen.getByRole('button', { name: 'anchoring.tables.unretrievedDistributions.releaseAll' }),
    );
    expect(mockRelease).not.toHaveBeenCalled();
    const dialog = screen.getByTestId('release-confirm-dialog');
    expect(within(dialog).getByText('anchoring.release.title(count=2)')).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole('button', { name: 'anchoring.release.confirm(count=2)' }),
    );
    expect(mockRelease).toHaveBeenCalledWith([4, 6], false);
    expect(screen.queryByTestId('release-confirm-dialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open when the release does not go through', async () => {
    const user = userEvent.setup();
    mockRelease.mockResolvedValue({ status: 'cancelled' });
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    await user.click(screen.getByRole('button', { name: /releaseAll/ }));
    await user.click(screen.getByRole('button', { name: 'anchoring.release.confirm(count=2)' }));
    expect(screen.getByTestId('release-confirm-dialog')).toBeInTheDocument();
  });

  it('offers no release on someone else’s page', () => {
    mockAccount.current = OTHER;
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    expect(screen.queryByRole('button', { name: /releaseAll/ })).not.toBeInTheDocument();
    expect(mockDeposits).toHaveBeenCalledWith(null);
  });

  it('offers no release when nothing is owed', () => {
    mockUnretrievedEth.current = 0;
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    expect(screen.queryByRole('button', { name: /releaseAll/ })).not.toBeInTheDocument();
  });

  it('shows a retryable error instead of an empty list when the read fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockRewards.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('x'),
      refetch,
    });
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    expect(screen.getByText('anchoring.tables.unretrievedDistributions.error')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('explains an empty list', () => {
    mockRewards.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.unretrieved.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UnretrievedCSTAnchorDistributionsTable user={OWNER} />);
    await checkA11y(container);
  });
});
