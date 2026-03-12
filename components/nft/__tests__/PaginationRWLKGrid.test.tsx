import '@testing-library/jest-dom';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

jest.mock(
  'next/image',
  () =>
    function MockImage(props: Record<string, unknown>) {
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

  it('card click calls setSelectedToken with token id', () => {
    const setSelected = jest.fn();
    render(
      <PaginationRWLKGrid
        loading={false}
        data={[10, 20]}
        selectedToken={-1}
        setSelectedToken={setSelected}
      />,
    );
    fireEvent.click(screen.getAllByTestId('rwlk-card')[0]!.closest('[class*="cursor"]')!);
    expect(setSelected).toHaveBeenCalledWith(10);
  });

  it('card click deselects by passing -1 when already selected', () => {
    const setSelected = jest.fn();
    render(
      <PaginationRWLKGrid
        loading={false}
        data={[10, 20]}
        selectedToken={10}
        setSelectedToken={setSelected}
      />,
    );
    fireEvent.click(screen.getAllByTestId('rwlk-card')[0]!.closest('[class*="cursor"]')!);
    expect(setSelected).toHaveBeenCalledWith(-1);
  });

  it('card click is no-op when setSelectedToken is not provided', () => {
    render(<PaginationRWLKGrid loading={false} data={[10]} />);
    expect(() =>
      fireEvent.click(screen.getByTestId('rwlk-card').closest('[class*="cursor"]')!),
    ).not.toThrow();
  });

  it('search input filters displayed items', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20, 30]} />);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID'), {
      target: { value: '20' },
    });

    const cards = screen.getAllByTestId('rwlk-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('20');
  });

  it('search resets to page 1', () => {
    const data = Array.from({ length: 9 }, (_, i) => i + 1);
    render(<PaginationRWLKGrid loading={false} data={data} />);

    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(6);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID'), {
      target: { value: '3' },
    });

    const cards = screen.getAllByTestId('rwlk-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('3');
  });

  it('pagination page click updates visible items', () => {
    const data = Array.from({ length: 9 }, (_, i) => (i + 1) * 100);
    render(<PaginationRWLKGrid loading={false} data={data} />);

    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(6);

    const nav = screen.getByRole('navigation');
    const page2 = nav.querySelector('a:not([aria-current])');
    fireEvent.click(page2!);

    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(3);
  });

  it('clearing search restores all items', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20, 30]} />);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID'), {
      target: { value: '20' },
    });
    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(1);

    fireEvent.change(screen.getByPlaceholderText('Enter NFT ID'), {
      target: { value: '' },
    });
    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PaginationRWLKGrid loading={false} data={[]} />);
    await checkA11y(container);
  });
});
