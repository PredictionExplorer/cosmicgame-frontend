import userEvent from '@testing-library/user-event';

import type { RoundClaimDetail, RoundClaimSummary } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { ClaimsByRoundSection } from '../ClaimsByRoundSection';

const mockUseClaimsByRound = jest.fn();
const mockUseClaimDetailByRound = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useClaimsByRound: (...args: unknown[]) => mockUseClaimsByRound(...args),
  useClaimDetailByRound: (...args: unknown[]) => mockUseClaimDetailByRound(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => NOW_SEC * 1000 }));

const NOW_SEC = 1_700_000_000;
const RECIPIENT = '0x1111111111111111111111111111111111111111';
const SWEEPER = '0x2222222222222222222222222222222222222222';

function cycle(overrides: Partial<RoundClaimSummary> = {}): RoundClaimSummary {
  return {
    RoundNum: 12,
    ClaimWindowTimeout: NOW_SEC + 3_600,
    AwardedTs: NOW_SEC - 7_200,
    Expired: false,
    EthAwarded: 4,
    EthUnclaimed: 1,
    EthUnclaimedEth: 2.5,
    NftAwarded: 2,
    NftUnclaimed: 0,
    Erc20Awarded: 0,
    Erc20Unclaimed: 0,
    TotalAwarded: 6,
    TotalUnclaimed: 1,
    AvgClaimPeriodSecs: 3_600,
    UnclaimedItems: [
      { AssetType: 'ETH', RecipientAddr: RECIPIENT, AmountEth: 2.5, TokenAddr: '', TokenId: -1 },
    ],
    ...overrides,
  };
}

const detail: RoundClaimDetail = {
  RoundNum: 12,
  ClaimTransactions: [
    {
      AssetType: 'ETH',
      RecipientAddr: RECIPIENT,
      BeneficiaryAddr: SWEEPER,
      AmountEth: 1.25,
      TokenAddr: '',
      TokenId: -1,
      ClaimedAfterSecs: 120,
      ClaimTs: NOW_SEC - 3_600,
      TxHash: '0xabc',
    },
  ],
  AttachedTokens: [],
};

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseClaimsByRound.mockReturnValue(
    ok([cycle(), cycle({ RoundNum: 11, TotalUnclaimed: 0, EthUnclaimed: 0, UnclaimedItems: [] })]),
  );
  mockUseClaimDetailByRound.mockReturnValue(ok(detail));
});

describe('ClaimsByRoundSection', () => {
  it('lists each cycle’s retrievable assets and retrieved share in neutral figures, newest first', () => {
    render(<ClaimsByRoundSection />);
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('12');
    expect(rows[1]).toHaveTextContent(/4\sETH · 2\sNFT/);
    expect(rows[1]).toHaveTextContent('83.3%');
    expect(rows[2]).toHaveTextContent('All retrieved');
  });

  it('opens a cycle’s unretrieved assets with the time left in its window', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);
    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Retrieval window closes in 1h/)).toBeInTheDocument();
    expect(within(dialog).getByText(/^2\.50* ETH$/)).toBeInTheDocument();
  });

  it('opens a cycle’s retrieval transactions, noting a retrieval by someone else', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);
    await user.click(screen.getAllByRole('button', { name: 'Explore' })[0]!);
    expect(mockUseClaimDetailByRound).toHaveBeenLastCalledWith(12);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Retrieved after the deadline by 0x2222/)).toBeInTheDocument();
    expect(within(dialog).getByText('No tokens attached this cycle.')).toBeInTheDocument();
  });

  it('says when nothing retrievable has been allocated', () => {
    mockUseClaimsByRound.mockReturnValue(ok([]));
    render(<ClaimsByRoundSection />);
    expect(screen.getByText('No retrievable assets allocated yet.')).toBeInTheDocument();
  });

  it('offers a retry when the cycles fail to load', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseClaimsByRound.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<ClaimsByRoundSection />);
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ClaimsByRoundSection />);
    await checkA11y(container);
  });
});
