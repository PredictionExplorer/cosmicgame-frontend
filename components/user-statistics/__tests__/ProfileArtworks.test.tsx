import type { CSTTokenInfo } from '@/services/api';

import { fireEvent, render, screen, checkA11y } from '@/test-utils';

import { ProfileArtworks } from '../ProfileArtworks';

const token = (TokenId: number, extra: Partial<CSTTokenInfo> = {}): CSTTokenInfo =>
  ({ TokenId, Seed: `seed${TokenId}`, RoundNum: 1, ...extra }) as CSTTokenInfo;

describe('ProfileArtworks', () => {
  it('hangs each held Signature on its plate with a wall label, newest first', () => {
    render(
      <ProfileArtworks
        tokens={[token(3), token(25, { TokenName: 'Twisted Mind' })]}
        loading={false}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/detail/25');
    expect(links[1]).toHaveAttribute('href', '/detail/3');
    expect(screen.getByText('Twisted Mind')).toBeInTheDocument();
    // An unnamed token reads "Signature #000003", the number in the identifier face.
    expect(screen.getByText('#000003')).toHaveClass('type-mono-inline');
    expect(screen.getByText('#000003').parentElement).toHaveTextContent(
      'common.signature.untitled(id=#000003)',
    );
    // A named one keeps its number in the caption, in the same face.
    expect(screen.getByText('#000025')).toHaveClass('type-mono');
  });

  it('shows two rows until "Show all"', () => {
    const tokens = Array.from({ length: 11 }, (_, i) => token(i + 1));
    render(<ProfileArtworks tokens={tokens} loading={false} />);
    expect(screen.getAllByRole('link')).toHaveLength(8);
    fireEvent.click(
      screen.getByRole('button', { name: 'myPages.statistics.artworks.showAll(count=11)' }),
    );
    expect(screen.getAllByRole('link')).toHaveLength(11);
  });

  it('hangs anchored Signatures too, marked with the quiet anchor, without repeating a held one', () => {
    render(
      <ProfileArtworks
        tokens={[token(3)]}
        anchored={[
          { TokenId: 3, Seed: 'seed3' },
          { TokenId: 9, Seed: 'seed9', RoundNum: 0 },
        ]}
        loading={false}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/detail/9', '/detail/3']);
    // The anchored state is the one anchor mark every wall label uses, never a text tag.
    expect(links[0]!.querySelector('[data-testid="anchored-mark"]')).toHaveTextContent(
      'common.signature.anchored',
    );
    expect(links[1]!.querySelector('[data-testid="anchored-mark"]')).toBeNull();
  });

  it('explains an empty collection', () => {
    render(<ProfileArtworks tokens={[]} loading={false} />);
    expect(screen.getByText('myPages.statistics.artworks.emptyTitle')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProfileArtworks tokens={[token(1)]} loading={false} />);
    await checkA11y(container);
  });
});
