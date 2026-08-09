import userEvent from '@testing-library/user-event';

import type { AttachedNFT, DonatedERC20Token } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { AttachedAssetsSection } from '../AttachedAssetsSection';

const mockUseDonationsNFTList = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
}));

/**
 * The NFT card fetches its own token metadata and is covered by its own
 * suite; stubbing it keeps this suite on the section's job — scoping,
 * paging and the loading / error / empty treatments.
 */
jest.mock('../../../components/attachments/AttachedNFT', () => ({
  __esModule: true,
  default: ({ nft }: { nft: { RecordId?: number; NFTTokenId?: number } }) => (
    <div data-testid="attached-nft-card">NFT {nft.RecordId ?? `token-${nft.NFTTokenId}`}</div>
  ),
}));

const CURRENT_CYCLE = 9;

function nft(recordId: number, roundNum: number): AttachedNFT {
  return {
    RecordId: recordId,
    RoundNum: roundNum,
    TokenAddr: `0xtoken${recordId}`,
    NFTTokenId: recordId,
  } as AttachedNFT;
}

/** 15 attached NFTs, of which 3 belong to the current cycle. */
const allNfts: AttachedNFT[] = Array.from({ length: 15 }, (_, i) =>
  nft(i + 1, i < 3 ? CURRENT_CYCLE : 1),
);

const erc20Tokens = [
  {
    EvtLogId: 1,
    BlockNum: 100,
    TxId: 1,
    TxHash: '0xabc',
    TimeStamp: 1_700_000_000,
    DateTime: '2023-11-14',
    RoundNum: CURRENT_CYCLE,
    TokenAddr: '0xTokenAddr1234567890abcdef1234567890abcdef',
    AmountDonatedEth: 5.25,
    AmountClaimedEth: 1.5,
    WinnerAddr: '0xWinnerAddr1234567890abcdef1234567890abcdef',
    Claimed: false,
    DonateClaimDiff: '3750000000000000000',
    DonateClaimDiffEth: '3.75',
  } as unknown as DonatedERC20Token,
];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

function nftCards() {
  return screen.queryAllByTestId('attached-nft-card');
}

/**
 * The pager renders its page numbers as anchors with no `href`, so they carry
 * no `link` role; reach them through the pagination landmark instead.
 */
function pager() {
  return screen.getByRole('navigation', { name: 'tables.pagination.label' });
}

async function goToPage(user: ReturnType<typeof userEvent.setup>, page: string) {
  await user.click(within(pager()).getByText(page));
}

async function openErc20Tab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('tab', { name: 'Tokens (ERC-20)' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDonationsNFTList.mockReturnValue(okQuery(allNfts));
  mockUseDonationsERC20ByRound.mockReturnValue(okQuery(erc20Tokens));
});

describe('AttachedAssetsSection NFT scope', () => {
  it('opens on the NFT tab showing every cycle', () => {
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(screen.getByRole('tab', { name: 'NFTs (ERC-721)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All cycles' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Current cycle' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('narrows the grid to the current cycle when the scope changes', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(nftCards()).toHaveLength(12);

    await user.click(screen.getByRole('button', { name: 'Current cycle' }));

    expect(nftCards()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Current cycle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('returns to the first page when the scope changes', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await goToPage(user, '2');
    expect(nftCards()).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Current cycle' }));
    await user.click(screen.getByRole('button', { name: 'All cycles' }));

    expect(nftCards()).toHaveLength(12);
  });

  it('groups the scope buttons for assistive tech', () => {
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    const group = screen.getByRole('group', { name: 'Attached NFT scope' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
  });
});

describe('AttachedAssetsSection NFT paging', () => {
  it('pages the grid twelve at a time', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(nftCards()).toHaveLength(12);

    await goToPage(user, '2');

    expect(nftCards()).toHaveLength(3);
    expect(screen.getByText('NFT 13')).toBeInTheDocument();
  });

  it('clamps the page when a refresh shrinks the list under the reader', async () => {
    // Without the clamp the pager would sit past the last page and the grid
    // would render empty after a poll returned fewer records.
    const user = userEvent.setup();
    const { rerender } = render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await goToPage(user, '2');
    expect(screen.getByText('NFT 13')).toBeInTheDocument();

    mockUseDonationsNFTList.mockReturnValue(okQuery(allNfts.slice(0, 4)));
    rerender(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(nftCards()).toHaveLength(4);
    expect(screen.getByText('NFT 1')).toBeInTheDocument();
  });

  it('shows a single page when everything fits', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await user.click(screen.getByRole('button', { name: 'Current cycle' }));

    expect(within(pager()).getByText('1')).toBeInTheDocument();
    expect(within(pager()).queryByText('2')).not.toBeInTheDocument();
  });
});

describe('AttachedAssetsSection NFT states', () => {
  it('explains that no NFTs have ever been attached', () => {
    mockUseDonationsNFTList.mockReturnValue(okQuery([]));
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(screen.getByText('No NFTs have been attached yet')).toBeInTheDocument();
    expect(screen.getByText('Attached NFTs from all cycles will appear here.')).toBeInTheDocument();
    expect(nftCards()).toHaveLength(0);
  });

  it('switches to the current-cycle wording when that scope is empty', async () => {
    const user = userEvent.setup();
    mockUseDonationsNFTList.mockReturnValue(okQuery([nft(1, 1)]));
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await user.click(screen.getByRole('button', { name: 'Current cycle' }));

    expect(screen.getByText('No NFTs attached this cycle')).toBeInTheDocument();
    expect(
      screen.getByText(
        'NFTs attached to gestures during the current Performance Cycle will appear here.',
      ),
    ).toBeInTheDocument();
  });

  it('keys records that carry no record id without colliding', () => {
    // React reports duplicate keys through console.error, which this suite
    // treats as a failure — so a clean render is the assertion.
    mockUseDonationsNFTList.mockReturnValue(
      okQuery([
        { RoundNum: 1, TokenAddr: '0xsame', NFTTokenId: 1 },
        { RoundNum: 1, TokenAddr: '0xsame', NFTTokenId: 2 },
      ] as unknown as AttachedNFT[]),
    );
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(nftCards()).toHaveLength(2);
    expect(screen.getByText('NFT token-1')).toBeInTheDocument();
    expect(screen.getByText('NFT token-2')).toBeInTheDocument();
  });

  it('shows placeholder cards while the NFTs load', () => {
    mockUseDonationsNFTList.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(nftCards()).toHaveLength(0);
    expect(screen.queryByText('No NFTs have been attached yet')).not.toBeInTheDocument();
  });

  it('offers a retry that refetches the NFT list after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseDonationsNFTList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(screen.getByText('Failed to load attached NFTs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('AttachedAssetsSection ERC-20 tab', () => {
  it('requests the tokens attached during the current cycle', () => {
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(CURRENT_CYCLE);
  });

  it('lists the attached tokens once the tab is opened', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await openErc20Tab(user);

    expect(
      screen.getByText('ERC-20 tokens attached to gestures during the current Performance Cycle.'),
    ).toBeInTheDocument();
    const table = screen.getAllByRole('table')[0]!;
    expect(within(table).getByText('5.25')).toBeInTheDocument();
  });

  it('shows placeholder rows while the tokens load', async () => {
    const user = userEvent.setup();
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await openErc20Tab(user);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('tables.attachedAssets.erc20.empty')).not.toBeInTheDocument();
  });

  it('shows the table empty state when nothing was attached this cycle', async () => {
    const user = userEvent.setup();
    mockUseDonationsERC20ByRound.mockReturnValue(okQuery([]));
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await openErc20Tab(user);

    expect(screen.getByText('tables.attachedAssets.erc20.empty')).toBeInTheDocument();
  });

  it('offers a retry that refetches the tokens after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await openErc20Tab(user);

    expect(screen.getByText('Failed to load attached ERC-20 tokens')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the NFT tab state independent of the ERC-20 tab', async () => {
    const user = userEvent.setup();
    render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await user.click(screen.getByRole('button', { name: 'Current cycle' }));
    await openErc20Tab(user);
    await user.click(screen.getByRole('tab', { name: 'NFTs (ERC-721)' }));

    expect(screen.getByRole('button', { name: 'Current cycle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(nftCards()).toHaveLength(3);
  });
});

describe('AttachedAssetsSection accessibility', () => {
  it('has no violations with data', async () => {
    const { container } = render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await checkA11y(container);
  });

  it('has no violations when empty', async () => {
    mockUseDonationsNFTList.mockReturnValue(okQuery([]));
    mockUseDonationsERC20ByRound.mockReturnValue(okQuery([]));
    const { container } = render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await checkA11y(container);
  });

  it('has no violations on the ERC-20 tab', async () => {
    const user = userEvent.setup();
    const { container } = render(<AttachedAssetsSection currentRoundNum={CURRENT_CYCLE} />);

    await openErc20Tab(user);

    await checkA11y(container);
  });
});
