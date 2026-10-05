import { checkA11y, render, screen, within } from '@/test-utils';

import { AnchoredMark, SignatureWallLabel } from '../signature-label';

describe('SignatureWallLabel', () => {
  it('titles an unnamed Signature "Signature #…" with the number in the identifier face', () => {
    render(<SignatureWallLabel tokenId={23} cycle={1} />);
    const number = screen.getByText('#000023');
    expect(number).toHaveClass('type-mono-inline');
    expect(number.parentElement).toHaveTextContent('common.signature.untitled(id=#000023)');
    // The number is never repeated in the caption.
    expect(screen.getAllByText(/#000023/)).toHaveLength(1);
    expect(screen.getByText('common.signature.cycle(n=1)')).toBeInTheDocument();
  });

  it('keeps the noun of a full wall label visible at every width', () => {
    render(<SignatureWallLabel tokenId={23} />);
    expect(screen.getByText('#000023').parentElement!.querySelector('.max-sm\\:hidden')).toBeNull();
  });

  it('captions a named Signature in one fixed order: number, cycle, structure, palette, date', () => {
    render(
      <SignatureWallLabel
        tokenId={25}
        name="  Twisted Mind "
        cycle={2}
        structure="Orbit Ribbons"
        palette="Glacial Split"
        date="Sep 2026"
      />,
    );
    expect(screen.getByText('Twisted Mind')).toBeInTheDocument();
    expect(screen.getByText('#000025')).toHaveClass('type-mono');
    const caption = screen.getByText('#000025').closest('p')!;
    expect(caption).toHaveTextContent(
      '#000025·common.signature.cycle(n=2)·Orbit Ribbons·Glacial Split·Sep 2026',
    );
  });

  it('leaves out a missing or negative cycle', () => {
    render(<SignatureWallLabel tokenId={3} name="Dawn" cycle={-1} />);
    expect(screen.queryByText(/common\.signature\.cycle/)).toBeNull();
  });

  it('links the cycle to its record when given a destination', () => {
    render(<SignatureWallLabel tokenId={3} cycle={4} cycleHref="/allocation/4" />);
    expect(screen.getByRole('link', { name: 'common.signature.cycle(n=4)' })).toHaveAttribute(
      'href',
      '/allocation/4',
    );
  });

  it('marks the anchored state with one quiet anchor, never a text tag', () => {
    render(<SignatureWallLabel tokenId={9} anchored />);
    const mark = screen.getByTestId('anchored-mark');
    expect(mark).toHaveAttribute('title', 'common.signature.anchored');
    expect(within(mark).getByText('common.signature.anchored')).toHaveClass('sr-only');
    expect(mark.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <figure>
        <SignatureWallLabel as="figcaption" tokenId={9} name="Dawn" cycle={0} anchored />
      </figure>,
    );
    await checkA11y(container);
  });
});

describe('AnchoredMark', () => {
  it('is named for screen readers', () => {
    render(<AnchoredMark />);
    expect(screen.getByText('common.signature.anchored')).toHaveClass('sr-only');
  });
});
