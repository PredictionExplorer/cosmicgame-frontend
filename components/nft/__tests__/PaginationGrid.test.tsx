import '@testing-library/jest-dom';

import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
  usePathname: () => '/gallery',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock(
  '../NFT',
  () =>
    function MockNFT({ nft }: { nft: { TokenId: number } }) {
      return <div data-testid="nft-card">{nft.TokenId}</div>;
    },
);
jest.mock(
  '../NFTImage',
  () =>
    function MockNFTImage({ src }: { src: string }) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img data-testid="nft-image" src={src} alt="nft" />;
    },
);
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: { get_token_by_name: jest.fn().mockResolvedValue([]) },
}));

import PaginationGrid from '../PaginationGrid';

const createToken = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  TokenId: 1,
  Seed: 123,
  TokenName: 'Test Token',
  ...overrides,
});

describe('PaginationGrid', () => {
  it('renders loading state', () => {
    render(<PaginationGrid data={[]} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders search box', () => {
    render(<PaginationGrid data={[]} loading={false} />);
    expect(screen.getByPlaceholderText('Enter NFT ID or Name')).toBeInTheDocument();
  });

  it('renders sample NFT when collection is empty', () => {
    render(<PaginationGrid data={[]} loading={false} />);
    expect(screen.getByText('Sample NFT')).toBeInTheDocument();
  });

  it('renders NFT cards when data is provided', () => {
    const data = [
      createToken({ TokenId: 1, EvtLogId: 1 }),
      createToken({ TokenId: 2, EvtLogId: 2 }),
    ];
    render(<PaginationGrid data={data} loading={false} />);
    const cards = screen.getAllByTestId('nft-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('1');
    expect(cards[1]).toHaveTextContent('2');
  });

  it('renders search button', () => {
    render(<PaginationGrid data={[]} loading={false} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('paginates when more than 12 items', () => {
    const data = Array.from({ length: 15 }, (_, i) =>
      createToken({ TokenId: i + 1, EvtLogId: i + 1 }),
    );
    render(<PaginationGrid data={data} loading={false} />);
    const cards = screen.getAllByTestId('nft-card');
    expect(cards).toHaveLength(12);
  });

  it('search input updates value', () => {
    render(<PaginationGrid data={[]} loading={false} />);
    const input = screen.getByPlaceholderText('Enter NFT ID or Name');
    fireEvent.change(input, { target: { value: '5' } });
    expect(input).toHaveValue('5');
  });

  it('numeric search filters by TokenId', async () => {
    const data = [
      createToken({ TokenId: 5, EvtLogId: 1 }),
      createToken({ TokenId: 10, EvtLogId: 2 }),
    ];
    render(<PaginationGrid data={data} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID or Name'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      const cards = screen.getAllByTestId('nft-card');
      expect(cards).toHaveLength(1);
      expect(cards[0]).toHaveTextContent('5');
    });
  });

  it('non-numeric search calls api.get_token_by_name', async () => {
    const mockApi = jest.requireMock('../../../services/api').default;
    mockApi.get_token_by_name.mockResolvedValueOnce([{ TokenId: 1 }]);
    const data = [
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
    ];
    render(<PaginationGrid data={data} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID or Name'), {
      target: { value: 'Alpha' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(mockApi.get_token_by_name).toHaveBeenCalledWith('Alpha');
    });
  });

  it('Enter key triggers search', async () => {
    const data = [
      createToken({ TokenId: 7, EvtLogId: 1 }),
      createToken({ TokenId: 8, EvtLogId: 2 }),
    ];
    render(<PaginationGrid data={data} loading={false} />);

    const input = screen.getByPlaceholderText('Enter NFT ID or Name');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      const cards = screen.getAllByTestId('nft-card');
      expect(cards).toHaveLength(1);
      expect(cards[0]).toHaveTextContent('7');
    });
  });

  it('search clears page param via router.push', async () => {
    const data = [createToken({ TokenId: 3, EvtLogId: 1 })];
    render(<PaginationGrid data={data} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID or Name'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gallery');
    });
  });

  it('clearing search input restores full collection', () => {
    const data = [
      createToken({ TokenId: 1, EvtLogId: 1 }),
      createToken({ TokenId: 2, EvtLogId: 2 }),
    ];
    render(<PaginationGrid data={data} loading={false} />);

    const input = screen.getByPlaceholderText('Enter NFT ID or Name');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.change(input, { target: { value: '' } });

    const cards = screen.getAllByTestId('nft-card');
    expect(cards).toHaveLength(2);
  });

  it('renders link to /detail/sample when collection is empty', () => {
    render(<PaginationGrid data={[]} loading={false} />);
    const links = screen.getAllByRole('link');
    const sampleLink = links.find((l) => l.getAttribute('href') === '/detail/sample');
    expect(sampleLink).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PaginationGrid data={[]} loading={false} />);
    await checkA11y(container);
  });
});
