import { render, screen, checkA11y } from '@/test-utils';

import { NFTNeighbourNav, neighbourIds } from '../NFTNeighbourNav';

describe('neighbourIds', () => {
  it('steps one token either way inside the imprinted range', () => {
    expect(neighbourIds(5, 10)).toEqual({ previous: 4, next: 6 });
  });

  it('has no previous token at the start and no next token at the end', () => {
    expect(neighbourIds(0, 10)).toEqual({ previous: null, next: 1 });
    expect(neighbourIds(9, 10)).toEqual({ previous: 8, next: null });
  });

  it('does not guess a next token while the collection size is unknown', () => {
    expect(neighbourIds(5, null)).toEqual({ previous: 4, next: null });
    expect(neighbourIds(5, undefined)).toEqual({ previous: 4, next: null });
  });
});

describe('NFTNeighbourNav', () => {
  it('renders labelled links that show the neighbouring token numbers', () => {
    render(<NFTNeighbourNav tokenId={25} total={48} />);
    const nav = screen.getByRole('navigation', { name: 'detail.navigation.label' });
    expect(nav).toBeInTheDocument();
    const previous = screen.getByRole('link', { name: 'Previous Signature, #000024' });
    const next = screen.getByRole('link', { name: 'Next Signature, #000026' });
    expect(previous).toHaveAttribute('href', '/detail/24');
    expect(next).toHaveAttribute('href', '/detail/26');
  });

  it('omits the previous link on the first token', () => {
    render(<NFTNeighbourNav tokenId={0} total={48} />);
    expect(screen.queryByRole('link', { name: /Previous Signature/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next Signature/ })).toHaveAttribute(
      'href',
      '/detail/1',
    );
  });

  it('reserves the next link’s space, hidden, until the collection size is known', () => {
    const { rerender } = render(<NFTNeighbourNav tokenId={5} total={null} />);
    expect(screen.queryByRole('link', { name: /Next Signature/ })).not.toBeInTheDocument();
    expect(screen.getByText('#000006').closest('[aria-hidden]')).toHaveClass('invisible');

    rerender(<NFTNeighbourNav tokenId={5} total={6} />);
    expect(screen.queryByText('#000006')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTNeighbourNav tokenId={25} total={48} />);
    await checkA11y(container);
  });
});
