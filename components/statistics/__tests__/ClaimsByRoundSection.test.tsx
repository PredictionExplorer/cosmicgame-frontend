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

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_SEC * 1000,
}));

const NOW_SEC = 1_700_000_000;
const RECIPIENT = '0xRecipient1234567890abcdef1234567890abcd';
const SWEEPER = '0xSweeper1234567890abcdef1234567890abcdef';

function cycle(overrides: Partial<RoundClaimSummary> = {}): RoundClaimSummary {
  return {
    RoundNum: 12,
    ClaimWindowTimeout: NOW_SEC + 3600,
    AwardedTs: NOW_SEC - 7200,
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
    AvgClaimPeriodSecs: 3600,
    UnclaimedItems: [
      {
        AssetType: 'ETH',
        RecipientAddr: RECIPIENT,
        AmountEth: 2.5,
        TokenAddr: '',
        TokenId: -1,
      },
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
      BeneficiaryAddr: RECIPIENT,
      AmountEth: 1.25,
      TokenAddr: '',
      TokenId: -1,
      ClaimedAfterSecs: 120,
      ClaimTs: NOW_SEC - 3600,
      TxHash: '0xclaimtx1234567890abcdef',
    },
  ],
  AttachedTokens: [
    {
      AssetType: 'ERC721',
      ContributorAddr: '0xContributor1234567890abcdef123456789012',
      TokenAddr: '0xNftContract1234567890abcdef1234567890ab',
      TokenId: 42,
      AmountEth: 0,
      Ts: NOW_SEC - 10_000,
      TxHash: '0xattachtx1234567890abcdef',
    },
  ],
};

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

function dataRows() {
  return within(screen.getAllByRole('table')[0]!).getAllByRole('row').slice(1);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseClaimsByRound.mockReturnValue(okQuery([cycle()]));
  mockUseClaimDetailByRound.mockReturnValue(okQuery(detail));
});

describe('ClaimsByRoundSection table', () => {
  it('explains what counts as a claimable asset', () => {
    render(<ClaimsByRoundSection />);

    expect(screen.getByText(/Retrievable assets allocated each cycle/)).toBeInTheDocument();
  });

  it('renders one row per cycle with its number', () => {
    mockUseClaimsByRound.mockReturnValue(
      okQuery([cycle({ RoundNum: 12 }), cycle({ RoundNum: 11 })]),
    );
    render(<ClaimsByRoundSection />);

    expect(dataRows()).toHaveLength(2);
    expect(screen.getByRole('cell', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '11' })).toBeInTheDocument();
  });

  it('badges only the asset types that were actually awarded', () => {
    render(<ClaimsByRoundSection />);
    const row = dataRows()[0]!;

    expect(within(row).getByText('4 ETH')).toBeInTheDocument();
    expect(within(row).getByText('2 NFT')).toBeInTheDocument();
    // No ERC-20 was awarded, so no badge is drawn for it.
    expect(within(row).queryByText(/^\d+ ERC-20$/)).not.toBeInTheDocument();
  });

  it('offers a way into the unretrieved assets when any remain', () => {
    render(<ClaimsByRoundSection />);

    expect(screen.getByRole('button', { name: /1 unretrieved/ })).toBeInTheDocument();
  });

  it('shows the leftover ETH beside the unretrieved count', () => {
    render(<ClaimsByRoundSection />);

    expect(screen.getByRole('button', { name: /1 unretrieved/ })).toHaveTextContent('2.5000 ETH');
  });

  it('says everything is claimed when nothing is outstanding', () => {
    mockUseClaimsByRound.mockReturnValue(
      okQuery([cycle({ TotalUnclaimed: 0, EthUnclaimed: 0, UnclaimedItems: [] })]),
    );
    render(<ClaimsByRoundSection />);

    expect(screen.getByText('All retrieved')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /unretrieved/ })).not.toBeInTheDocument();
  });

  it('reports the claimed share per asset type', () => {
    render(<ClaimsByRoundSection />);
    const row = dataRows()[0]!;

    // 4 ETH allocations awarded, 1 outstanding → 75%; every NFT claimed → 100%.
    expect(within(row).getByText('75%')).toBeInTheDocument();
    expect(within(row).getByText('100%')).toBeInTheDocument();
  });

  it('shows a dash instead of a share for an asset type that was never awarded', () => {
    render(<ClaimsByRoundSection />);
    const row = dataRows()[0]!;

    expect(within(row).getByText('ERC-20').parentElement).toHaveTextContent('—');
  });

  it('reports 0% when a cycle has been awarded but nothing claimed', () => {
    mockUseClaimsByRound.mockReturnValue(
      okQuery([cycle({ EthAwarded: 3, EthUnclaimed: 3, NftAwarded: 0, NftUnclaimed: 0 })]),
    );
    render(<ClaimsByRoundSection />);

    expect(within(dataRows()[0]!).getByText('0%')).toBeInTheDocument();
  });

  it('formats the average claim time and falls back to a dash', () => {
    mockUseClaimsByRound.mockReturnValue(
      okQuery([cycle({ RoundNum: 12 }), cycle({ RoundNum: 11, AvgClaimPeriodSecs: 0 })]),
    );
    render(<ClaimsByRoundSection />);

    const [first, second] = dataRows();
    expect(within(first!).getByText(/1h/)).toBeInTheDocument();
    expect(within(second!).getAllByText('—').length).toBeGreaterThan(0);
  });

  it('pages ten cycles at a time', async () => {
    const user = userEvent.setup();
    mockUseClaimsByRound.mockReturnValue(
      okQuery(Array.from({ length: 14 }, (_, i) => cycle({ RoundNum: 100 - i }))),
    );
    render(<ClaimsByRoundSection />);

    expect(dataRows()).toHaveLength(10);

    const pager = screen.getByRole('navigation', { name: 'tables.pagination.label' });
    await user.click(within(pager).getByText('2'));

    expect(dataRows()).toHaveLength(4);
  });
});

describe('ClaimsByRoundSection states', () => {
  it('shows a spinner while the summaries load', () => {
    mockUseClaimsByRound.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<ClaimsByRoundSection />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders an empty state when no cycle has awarded a claimable asset', () => {
    mockUseClaimsByRound.mockReturnValue(okQuery([]));
    render(<ClaimsByRoundSection />);

    expect(screen.getByText('No retrievable assets allocated yet.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('offers a retry that refetches after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseClaimsByRound.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<ClaimsByRoundSection />);

    expect(screen.getByText('Failed to load allocation retrievals')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('ClaimsByRoundSection unretrieved dialog', () => {
  it('stays closed until the unretrieved count is activated', () => {
    render(<ClaimsByRoundSection />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists each unretrieved asset with its recipient', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Unretrieved assets — Cycle 12')).toBeInTheDocument();
    expect(within(dialog).getAllByText('ETH').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('2.5000 ETH')).toBeInTheDocument();
  });

  it('counts down the remaining claim window', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));

    expect(screen.getByText(/Retrieval window closes in/)).toBeInTheDocument();
  });

  it('says the window has closed for an expired cycle', async () => {
    const user = userEvent.setup();
    mockUseClaimsByRound.mockReturnValue(
      okQuery([cycle({ Expired: true, ClaimWindowTimeout: NOW_SEC - 10 })]),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));

    expect(screen.getByText(/retrieval window has closed/i)).toBeInTheDocument();
  });

  it('renders an NFT entry with its contract and token id', async () => {
    const user = userEvent.setup();
    mockUseClaimsByRound.mockReturnValue(
      okQuery([
        cycle({
          UnclaimedItems: [
            {
              AssetType: 'ERC721',
              RecipientAddr: RECIPIENT,
              AmountEth: 0,
              TokenAddr: '0xNftContract1234567890abcdef1234567890ab',
              TokenId: 42,
            },
          ],
        }),
      ]),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Attached NFT')).toBeInTheDocument();
    expect(within(dialog).getByText(/#42/)).toBeInTheDocument();
  });

  it('closes again and leaves the table in place', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 unretrieved/ })).toBeInTheDocument();
  });

  it('shows a dash when an unretrieved asset has no recipient', async () => {
    const user = userEvent.setup();
    mockUseClaimsByRound.mockReturnValue(
      okQuery([
        cycle({
          UnclaimedItems: [
            { AssetType: 'ETH', RecipientAddr: '', AmountEth: 1, TokenAddr: '', TokenId: -1 },
          ],
        }),
      ]),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: /1 unretrieved/ }));

    expect(within(screen.getByRole('dialog')).getByText('—')).toBeInTheDocument();
  });
});

describe('ClaimsByRoundSection explore dialog', () => {
  it('requests no detail until a cycle is explored', () => {
    render(<ClaimsByRoundSection />);

    expect(mockUseClaimDetailByRound).toHaveBeenLastCalledWith(null);
  });

  it('loads the detail for the explored cycle', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    expect(mockUseClaimDetailByRound).toHaveBeenLastCalledWith(12);
    expect(screen.getByText('Explore Cycle 12')).toBeInTheDocument();
  });

  it('lists the claim transactions with their latency', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Retrieval transactions')).toBeInTheDocument();
    expect(within(dialog).getByText('1.2500 ETH')).toBeInTheDocument();
    expect(within(dialog).getByText(/2m/)).toBeInTheDocument();
  });

  it('lists the tokens attached during the cycle', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Attached tokens')).toBeInTheDocument();
    expect(within(dialog).getByText('#42')).toBeInTheDocument();
  });

  it('flags a claim swept by someone other than the recipient', async () => {
    const user = userEvent.setup();
    mockUseClaimDetailByRound.mockReturnValue(
      okQuery({
        ...detail,
        ClaimTransactions: [{ ...detail.ClaimTransactions[0]!, BeneficiaryAddr: SWEEPER }],
      }),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    expect(
      within(screen.getByRole('dialog')).getByText(/Retrieved after the deadline by/),
    ).toBeInTheDocument();
  });

  it('does not flag a sweep when the beneficiary only differs in case', async () => {
    const user = userEvent.setup();
    mockUseClaimDetailByRound.mockReturnValue(
      okQuery({
        ...detail,
        ClaimTransactions: [
          { ...detail.ClaimTransactions[0]!, BeneficiaryAddr: RECIPIENT.toUpperCase() },
        ],
      }),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    expect(
      within(screen.getByRole('dialog')).queryByText(/Retrieved after the deadline by/),
    ).not.toBeInTheDocument();
  });

  it('says so when a cycle has no claims and no attached tokens', async () => {
    const user = userEvent.setup();
    mockUseClaimDetailByRound.mockReturnValue(
      okQuery({ RoundNum: 12, ClaimTransactions: [], AttachedTokens: [] }),
    );
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    expect(screen.getByText('No retrievals recorded for this cycle.')).toBeInTheDocument();
    expect(screen.getByText('No tokens attached this cycle.')).toBeInTheDocument();
  });

  it('drops the detail query again once the dialog is dismissed', async () => {
    const user = userEvent.setup();
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockUseClaimDetailByRound).toHaveBeenLastCalledWith(null);
  });

  it('shows a spinner while the detail loads', async () => {
    const user = userEvent.setup();
    mockUseClaimDetailByRound.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<ClaimsByRoundSection />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    expect(within(screen.getByRole('dialog')).getByRole('status')).toBeInTheDocument();
  });
});

describe('ClaimsByRoundSection accessibility', () => {
  it('has no violations with data', async () => {
    const { container } = render(<ClaimsByRoundSection />);

    await checkA11y(container);
  });

  it('has no violations when empty', async () => {
    mockUseClaimsByRound.mockReturnValue(okQuery([]));
    const { container } = render(<ClaimsByRoundSection />);

    await checkA11y(container);
  });
});
