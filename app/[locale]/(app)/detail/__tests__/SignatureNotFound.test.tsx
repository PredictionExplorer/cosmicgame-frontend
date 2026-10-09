import { checkA11y, render, screen } from '@/test-utils';

import { SignatureNotFound } from '../[id]/SignatureNotFound';

const mockReadDashboard = jest.fn();
jest.mock('../../publicDataReads', () => ({ readDashboard: () => mockReadDashboard() }));

const dashboard = (imprinted: unknown) => ({
  data: { MainStats: { NumCSTokenMints: imprinted } },
  at: 0,
});

describe('SignatureNotFound', () => {
  beforeEach(() => mockReadDashboard.mockResolvedValue(dashboard(48)));

  it('hangs an empty plate captioned with the number that was asked for', async () => {
    render(await SignatureNotFound({ locale: 'en', tokenId: 60 }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'This Signature hasn’t been imprinted yet',
    );
    expect(screen.getByTestId('pending-plate')).toHaveTextContent('#000060');
  });

  it('says how Signatures are numbered and leads to the newest one', async () => {
    render(await SignatureNotFound({ locale: 'en', tokenId: 60 }));
    expect(
      screen.getByText(
        'Signatures are numbered in the order they’re imprinted. The newest is #000047.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See the newest Signature' })).toHaveAttribute(
      'href',
      '/detail/47',
    );
  });

  it('leads back to the gallery first', async () => {
    render(await SignatureNotFound({ locale: 'en', tokenId: 60 }));
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/gallery');
  });

  it('leaves the newest out when the collection size could not be read', async () => {
    mockReadDashboard.mockResolvedValue({ data: null, at: 0 });
    render(await SignatureNotFound({ locale: 'en', tokenId: 60 }));
    expect(screen.queryByRole('link', { name: 'See the newest Signature' })).toBeNull();
    expect(
      screen.getByText('Signatures are numbered in the order they’re imprinted.'),
    ).toBeInTheDocument();
  });

  // Chinese and Japanese run sentences on with no space between them.
  it('joins its two sentences as the locale writes them', async () => {
    render(await SignatureNotFound({ locale: 'ja', tokenId: 60 }));
    const lede = screen.getByText(/#000047/);
    expect(lede.textContent).not.toMatch(/。 /);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(await SignatureNotFound({ locale: 'en', tokenId: 60 }));
    await checkA11y(container);
  });
});
