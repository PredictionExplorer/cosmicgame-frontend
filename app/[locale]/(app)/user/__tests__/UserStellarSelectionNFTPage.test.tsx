import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, within } from '@/test-utils';

import UserStellarSelectionNFTPage from '../stellar-selection-nft/[address]/UserStellarSelectionNFTPage';

const ADDRESS = '0x1234567890123456789012345678901234567890';

const mockUseStellarSelectionNFTAllocationsByUser = jest.fn();
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useStellarSelectionNFTAllocationsByUser: (...args: unknown[]) =>
    mockUseStellarSelectionNFTAllocationsByUser(...args),
  useCSTList: () => mockUseCSTList(),
  // The live cycle behind the cycle links, and the empty state's reads.
  useDashboardInfo: () => ({ data: undefined, isLoading: false }),
  useUserInfo: () => ({ data: undefined, isLoading: false }),
  useStellarSelectionDepositsByUser: () => ({ data: undefined, isLoading: false }),
}));

const mockUseCSTList = jest.fn();
const INDEX = {
  data: [
    { TokenId: 42, Seed: 'abc123', TokenName: 'Orbit Study' },
    { TokenId: 43, Seed: 'def456', TokenName: '' },
  ],
  isLoading: false,
};

const ROWS = [
  {
    EvtLogId: 1,
    TxHash: '0xabc',
    TimeStamp: 1_700_000_000,
    RoundNum: 1,
    IsRWalk: false,
    IsStaker: false,
    TokenId: 42,
  },
  {
    EvtLogId: 2,
    TxHash: '0xdef',
    TimeStamp: 1_700_000_100,
    RoundNum: 2,
    IsRWalk: true,
    IsStaker: true,
    TokenId: 43,
  },
];

const mockRefetch = jest.fn();

function withRows(data: unknown, isLoading = false) {
  mockUseStellarSelectionNFTAllocationsByUser.mockReturnValue({
    data,
    isLoading,
    refetch: mockRefetch,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  withRows(ROWS);
  mockUseCSTList.mockReturnValue(INDEX);
});

describe('UserStellarSelectionNFTPage', () => {
  it('shows each Signature on its plate with a wall label, newest first', () => {
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Stellar Selection · NFTs' }),
    ).toBeInTheDocument();

    const cards = screen.getAllByRole('figure');
    expect(cards).toHaveLength(2);
    // The newest is token 43, unnamed: the shared wall label reads "Signature #000043".
    const unnamed = within(cards[0]!).getByText('#000043').closest('a')!;
    expect(unnamed).toHaveTextContent('common.signature.untitled(id=#000043)');
    expect(unnamed).toHaveAttribute('href', '/detail/43');
    // Two short tags, so neither wraps into a box that fills a phone column.
    expect(cards[0]).toHaveTextContent('Anchor-holder');
    expect(cards[0]).toHaveTextContent('Random Walk');
    expect(within(cards[1]!).getByRole('link', { name: 'Orbit Study' })).toBeInTheDocument();
    expect(cards[1]).toHaveTextContent('#000042');
    expect(cards[1]).toHaveTextContent('Participant');
  });

  it('counts the NFTs and the cycles they came from', () => {
    const { container } = render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(container.querySelector('[data-figure="count"]')).toHaveTextContent('2');
    expect(container.querySelector('[data-figure="cycles"]')).toHaveTextContent('2');
  });

  it('holds the grid with pending plates while it loads', () => {
    withRows(undefined, true);
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(screen.getByRole('list', { name: 'Stellar Selection NFTs' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows the designed empty state', () => {
    withRows([]);
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'No Stellar Selection NFTs yet' }),
    ).toBeInTheDocument();
    // "How Stellar Selection works" is the empty state's action, not repeated among the
    // header's related pages.
    expect(document.querySelectorAll('a[href^="/faq#"]')).toHaveLength(1);
  });

  it('sets the participant’s address crumb in mono, as every address is', () => {
    withRows([]);
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    const crumb = screen
      .getByRole('navigation', { name: 'common.accessibility.breadcrumb' })
      .querySelector(`a[href="/user/${ADDRESS}"]`);
    expect(crumb).toHaveClass('font-mono');
  });

  it('shows a failed read as an error with a retry, never as "no NFTs yet"', async () => {
    mockUseStellarSelectionNFTAllocationsByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Couldn’t load the Stellar Selection NFTs' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('No Stellar Selection NFTs yet')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('holds busy plates while the collection index loads, never "Artwork unavailable"', () => {
    mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true });
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    for (const plate of screen.getAllByTestId('pending-plate')) {
      expect(plate).toHaveAttribute('aria-busy', 'true');
    }
    expect(screen.queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
  });

  it('says once that the artwork could not be loaded when the index fails', () => {
    mockUseCSTList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    expect(screen.getAllByText('The artwork couldn’t be loaded')).toHaveLength(1);
  });

  it('explains an address that is not an address', () => {
    render(<UserStellarSelectionNFTPage address="bad" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Not a valid address' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStellarSelectionNFTPage address={ADDRESS} />);
    await checkA11y(container);
  });
});
