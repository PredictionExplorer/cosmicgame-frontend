import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

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
});
