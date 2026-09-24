import userEvent from '@testing-library/user-event';

import type { CSTTokenInfo } from '@/services/api';

import { render, screen, within, checkA11y } from '@/test-utils';

import { LatestSignature } from '../LatestSignature';

const token = (id: number, overrides: Partial<CSTTokenInfo> = {}): CSTTokenInfo =>
  ({
    TokenId: id,
    Seed: `seed${id}`,
    RoundNum: 1,
    TimeStamp: 1_786_491_506,
    ...overrides,
  }) as CSTTokenInfo;

describe('LatestSignature', () => {
  it('hangs the newest Signature on its plate with a wall label', () => {
    render(<LatestSignature signatures={[token(47), token(46)]} />);

    const section = screen.getByRole('region', { name: 'home.latestSignature.title' });
    const link = within(section).getByTestId('latest-signature-link');
    expect(link).toHaveAttribute('href', '/detail/47');
    // The plate is the art itself: nothing is layered over it.
    expect(within(link).getByTestId('art-frame').children).toHaveLength(2);
    expect(within(section).getByText('home.latestSignature.unnamed(id=#000047)')).toBeVisible();
    // An unnamed Signature's title already carries its number.
    expect(within(section).queryByText('#000047')).not.toBeInTheDocument();
    expect(within(section).getByText('home.latestSignature.imprintedIn(number=1)')).toBeVisible();
    expect(
      within(section).getByRole('link', { name: /home\.latestSignature\.gallery/ }),
    ).toHaveAttribute('href', '/gallery');
  });

  it('titles a named Signature by its name and keeps the number in the caption', () => {
    render(<LatestSignature signatures={[token(12, { TokenName: 'Twisted Mind' })]} />);
    expect(screen.getByText('Twisted Mind')).toBeVisible();
    expect(screen.getByText('#000012')).toHaveClass('type-mono');
    expect(screen.getByRole('img', { name: /Twisted Mind/ })).toBeInTheDocument();
    // A single Signature needs no stepper.
    expect(screen.queryByTestId('latest-signature-stepper')).not.toBeInTheDocument();
  });

  it('steps back through the latest imprints and says which one is shown', async () => {
    const user = userEvent.setup();
    render(<LatestSignature signatures={[token(47), token(46), token(45)]} />);

    const newer = screen.getByRole('button', { name: 'home.latestSignature.newer' });
    const older = screen.getByRole('button', { name: 'home.latestSignature.older' });
    expect(newer).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('');

    await user.click(older);
    expect(screen.getByTestId('latest-signature-link')).toHaveAttribute('href', '/detail/46');
    expect(screen.getByRole('status')).toHaveTextContent(
      'home.latestSignature.unnamed(id=#000046), home.latestSignature.position(index=2,count=3)',
    );

    await user.click(older);
    expect(older).toBeDisabled();
    await user.click(newer);
    expect(screen.getByTestId('latest-signature-link')).toHaveAttribute('href', '/detail/46');
  });

  it('keeps the plate as a skeleton while loading and says so when nothing is imprinted', () => {
    const { rerender } = render(<LatestSignature signatures={[]} loading />);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('latest-signature-link')).not.toBeInTheDocument();

    rerender(<LatestSignature signatures={[]} />);
    expect(screen.getByRole('img', { name: 'home.latestSignature.none' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LatestSignature signatures={[token(47), token(46)]} />);
    await checkA11y(container);
  });
});
