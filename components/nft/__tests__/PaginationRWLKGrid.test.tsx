import '@testing-library/jest-dom';

import { render, screen } from '@/test-utils';

jest.mock(
  'next/image',
  () =>
    function MockImage(props: Record<string, unknown>) {
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
    },
);

jest.mock(
  '../RandomWalkNFT',
  () =>
    function MockRandomWalkNFT({ tokenId, selected }: { tokenId: number; selected?: boolean }) {
      return (
        <div data-testid="rwlk-card" data-selected={selected}>
          {tokenId}
        </div>
      );
    },
);

 
import PaginationRWLKGrid from '../PaginationRWLKGrid';

describe('PaginationRWLKGrid', () => {
  it('renders loading spinner', () => {
    const { container } = render(<PaginationRWLKGrid loading={true} data={[]} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<PaginationRWLKGrid loading={false} data={[]} />);
    expect(screen.getByText('Nothing Found!')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<PaginationRWLKGrid loading={false} data={[]} />);
    expect(screen.getByPlaceholderText('Enter NFT ID')).toBeInTheDocument();
  });

  it('renders RWLK NFT cards when data is provided', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20, 30]} />);
    const cards = screen.getAllByTestId('rwlk-card');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('10');
    expect(cards[1]).toHaveTextContent('20');
    expect(cards[2]).toHaveTextContent('30');
  });

  it('paginates when more than 6 items', () => {
    const data = Array.from({ length: 9 }, (_, i) => i + 1);
    render(<PaginationRWLKGrid loading={false} data={data} />);
    const cards = screen.getAllByTestId('rwlk-card');
    expect(cards).toHaveLength(6);
  });

  it('highlights selected token', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20]} selectedToken={20} />);
    const cards = screen.getAllByTestId('rwlk-card');
    expect(cards[1]).toHaveAttribute('data-selected', 'true');
  });
});
