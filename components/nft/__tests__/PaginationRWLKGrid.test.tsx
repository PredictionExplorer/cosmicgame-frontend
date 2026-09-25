import '@testing-library/jest-dom';

import { render, screen, fireEvent, checkA11y, within } from '@/test-utils';

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
  it('says the wallet’s NFTs are loading, with nothing to search yet', () => {
    render(<PaginationRWLKGrid loading={true} data={[]} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('home.rwlkGrid.loading');
    // The grid's own shape waits in skeleton cards, not a spinner and a caption.
    expect(within(status).getByText('home.rwlkGrid.loading')).toHaveClass('sr-only');
    expect(status.querySelectorAll('.aspect-art')).toHaveLength(6);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByText('home.rwlkGrid.empty')).not.toBeInTheDocument();
  });

  it('says a wallet without NFTs holds none and links to imprint one (F091)', () => {
    render(<PaginationRWLKGrid loading={false} data={[]} />);
    expect(screen.getByText('home.rwlkGrid.none')).toBeInTheDocument();
    expect(screen.queryByText('home.rwlkGrid.empty')).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'home.rwlkGrid.imprint' })).toHaveAttribute(
      'href',
      '/imprint',
    );
  });

  it('renders search input', () => {
    render(<PaginationRWLKGrid loading={false} data={[10]} />);
    expect(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder')).toBeInTheDocument();
    // The first paint already lists the NFTs: no "no match" flash.
    expect(screen.queryByText('home.rwlkGrid.empty')).not.toBeInTheDocument();
  });

  it('says so when a search matches no NFT', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20]} />);
    fireEvent.change(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder'), {
      target: { value: '99' },
    });
    expect(screen.queryAllByTestId('rwlk-card')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('home.rwlkGrid.empty');
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
    fireEvent.click(screen.getByRole('button', { name: 'home.rwlkGrid.tokenAria(id=#000010)' }));
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
    fireEvent.click(screen.getAllByTestId('rwlk-option')[0]!);
    expect(setSelected).toHaveBeenCalledWith(-1);
  });

  it('renders plain cards, not buttons, when nothing can be selected', () => {
    render(<PaginationRWLKGrid loading={false} data={[10]} />);
    expect(screen.getByTestId('rwlk-card')).toBeInTheDocument();
    expect(screen.queryByTestId('rwlk-option')).not.toBeInTheDocument();
  });

  it('makes each token a labelled toggle button that reports its selection', () => {
    render(
      <PaginationRWLKGrid
        loading={false}
        data={[10, 20]}
        selectedToken={20}
        setSelectedToken={jest.fn()}
      />,
    );
    const group = screen.getByRole('group', { name: 'home.form.rwlk.title' });
    const options = within(group).getAllByRole('button');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('type', 'button');
    expect(options[0]).toHaveAttribute('aria-pressed', 'false');
    expect(options[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('is labelled by the picker heading when one is given', () => {
    render(
      <>
        <h3 id="rwlk-heading">Your NFTs</h3>
        <PaginationRWLKGrid
          loading={false}
          data={[10]}
          setSelectedToken={jest.fn()}
          labelledBy="rwlk-heading"
        />
      </>,
    );
    expect(screen.getByRole('group', { name: 'Your NFTs' })).toBeInTheDocument();
  });

  it('selects a token from the keyboard', () => {
    const setSelected = jest.fn();
    render(
      <PaginationRWLKGrid
        loading={false}
        data={[10]}
        selectedToken={-1}
        setSelectedToken={setSelected}
      />,
    );
    const option = screen.getByTestId('rwlk-option');
    option.focus();
    expect(option).toHaveFocus();
    // Native buttons turn Enter and Space into clicks.
    fireEvent.click(option);
    expect(setSelected).toHaveBeenCalledWith(10);
  });

  it('labels the search field and keeps its icon out of the accessibility tree', () => {
    const { container } = render(<PaginationRWLKGrid loading={false} data={[10]} />);
    expect(screen.getByRole('searchbox', { name: 'home.rwlkGrid.searchAria' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('search input filters displayed items', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20, 30]} />);

    fireEvent.change(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder'), {
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

    fireEvent.change(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder'), {
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

    // Query by role rather than tag: paging controls are buttons, since they
    // change state instead of navigating.
    const nav = screen.getByRole('navigation');
    const [page2] = within(nav)
      .getAllByRole('button')
      .filter((control) => control.getAttribute('aria-current') !== 'page');
    expect(page2).toBeDefined();
    fireEvent.click(page2!);

    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(3);
  });

  it('clearing search restores all items', () => {
    render(<PaginationRWLKGrid loading={false} data={[10, 20, 30]} />);

    fireEvent.change(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder'), {
      target: { value: '20' },
    });
    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(1);

    fireEvent.change(screen.getByPlaceholderText('home.rwlkGrid.searchPlaceholder'), {
      target: { value: '' },
    });
    expect(screen.getAllByTestId('rwlk-card')).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PaginationRWLKGrid loading={false} data={[]} />);
    await checkA11y(container);
  });

  it('has no accessibility violations while loading', async () => {
    const { container } = render(<PaginationRWLKGrid loading data={[]} />);
    await checkA11y(container);
  });

  it('has no accessibility violations with selectable tokens', async () => {
    const { container } = render(
      <PaginationRWLKGrid
        loading={false}
        data={[10, 20]}
        selectedToken={10}
        setSelectedToken={jest.fn()}
      />,
    );
    await checkA11y(container);
  });
});
