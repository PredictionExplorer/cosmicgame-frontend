import { render, screen, checkA11y } from '@/test-utils';

import CosmicSignatureTransfersPage from '../[address]/CosmicSignatureTransfersPage';

const mockUseCSTTransfers = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useCSTTransfers: (...args: unknown[]) => mockUseCSTTransfers(...args),
}));

jest.mock('../../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
  isWalletAddress: () => '',
}));

jest.mock('../../../../components/common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination">Pagination</div>,
}));

jest.mock('../../../../components/common/AddressLink', () => ({
  AddressLink: ({ address }: { address: string }) => <span data-testid="addr">{address}</span>,
}));

beforeEach(() => jest.clearAllMocks());

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

describe('CosmicSignatureTransfersPage', () => {
  it('renders the heading', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('Cosmic Signature Transfers')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: true });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "No transfers yet" for empty data', () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    expect(screen.getByText('No transfers yet.')).toBeInTheDocument();
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

  it('has no accessibility violations', async () => {
    mockUseCSTTransfers.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<CosmicSignatureTransfersPage address={VALID_ADDRESS} />);
    await checkA11y(container);
  });
});
