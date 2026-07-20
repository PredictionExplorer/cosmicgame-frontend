import { render, screen, checkA11y } from '@/test-utils';

import CosmicSignatureTransfersPage from '../[address]/CosmicSignatureTransfersPage';

const mockUseCSTTransfers = jest.fn();
const mockGetWalletKind = jest.fn();
const mockConvertTimestampToDateTime = jest.fn(
  (ts: number, _showSecond?: boolean, _locale?: string) => `date-${ts}`,
);

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useCSTTransfers: (...args: unknown[]) => mockUseCSTTransfers(...args),
}));

jest.mock('../../../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number, showSecond?: boolean, locale?: string) =>
    mockConvertTimestampToDateTime(ts, showSecond, locale),
  getWalletKind: (...args: unknown[]) => mockGetWalletKind(...args),
}));

jest.mock('../../../../../components/common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination">Pagination</div>,
}));

jest.mock('../../../../../components/common/AddressLink', () => ({
  AddressLink: ({ address }: { address: string }) => <span data-testid="addr">{address}</span>,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetWalletKind.mockReturnValue(null);
});

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

describe('CosmicSignatureTransfersPage', () => {
  it('renders the heading', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('myPages.transferHistory.nft.title')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: true });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('myPages.transferHistory.loading')).toBeInTheDocument();
  });

  it('shows the NFT-specific empty state', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('myPages.transferHistory.nft.empty')).toBeInTheDocument();
  });

  it('renders transfer rows when data exists', () => {
    mockUseCSTTransfers.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TxHash: '0xTX',
          TimeStamp: 1000,
          FromAddr: '0xA',
          ToAddr: '0xB',
          TokenId: 5,
        },
      ],
      isLoading: false,
    });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1000, false, 'en');
  });

  it.each([
    'cosmicSignatureAnchoring',
    'randomWalkAnchoring',
    'outreach',
    'stellarSelection',
    'publicGoods',
  ])('renders the localized %s wallet label', (walletKind) => {
    mockGetWalletKind.mockImplementation((address: string) =>
      address === '0xKnown' ? walletKind : null,
    );
    mockUseCSTTransfers.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TxHash: '0xTX',
          TimeStamp: 1000,
          FromAddr: '0xKnown',
          ToAddr: '0xB',
          TokenId: 5,
        },
      ],
      isLoading: false,
    });

    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(
      screen.getByText(`myPages.transferHistory.walletLabels.${walletKind}`),
    ).toBeInTheDocument();
  });

  it('renders pagination for non-empty data', () => {
    mockUseCSTTransfers.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TxHash: '0xTX',
          TimeStamp: 1000,
          FromAddr: '0xA',
          ToAddr: '0xB',
          TokenId: 5,
        },
      ],
      isLoading: false,
    });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('checksums the address before passing to hook', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    const arg = mockUseCSTTransfers.mock.calls[0][0];
    expect(arg).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('shows a localized invalid-address state and disables the query', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address="not-an-address" />);

    expect(
      screen.getByText('myPages.transferHistory.nft.invalidAddress.title'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('myPages.transferHistory.nft.invalidAddress.description'),
    ).toBeInTheDocument();
    expect(mockUseCSTTransfers).toHaveBeenCalledWith(null);
  });

  it('has no accessibility violations', async () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    await checkA11y(container);
  });
});
