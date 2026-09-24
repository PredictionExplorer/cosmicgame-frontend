import { checkA11y, render, screen } from '@/test-utils';

import { SignatureCard } from '../SignatureCard';

describe('SignatureCard', () => {
  it('leads to the token from its title, the plate being a pointer shortcut only', () => {
    const { container } = render(
      <SignatureCard
        tokenId={24}
        seed="5084a8"
        title="Orbit Study"
        meta={['Cycle 1']}
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Orbit Study');
    expect(links[0]).toHaveAttribute('href', '/detail/24');

    const plateLink = container.querySelector('a[aria-hidden="true"]');
    expect(plateLink).toHaveAttribute('tabindex', '-1');
    expect(plateLink).toHaveAttribute('href', '/detail/24');
    expect(screen.getByText('Cycle 1')).toBeInTheDocument();
  });

  it('keeps a role title as plain text and can lead elsewhere', () => {
    render(
      <SignatureCard
        tokenId={27}
        seed={undefined}
        title="Chrono-Warrior"
        titleAs="h3"
        linkTitle={false}
        href="/allocation/1"
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Chrono-Warrior' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    // Without a seed the plate shows the designed pending state, never a broken image.
    expect(screen.getByTestId('pending-plate')).toBeInTheDocument();
  });

  it('holds a busy plate with no "unavailable" caption while the seed is on its way', () => {
    render(
      <SignatureCard
        tokenId={24}
        seed={undefined}
        artState="loading"
        title="Chrono-Warrior"
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
        unavailableDetail="#000024"
      />,
    );
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Artwork unavailable')).not.toBeInTheDocument();
    expect(screen.queryByText('#000024')).not.toBeInTheDocument();
  });

  it('draws the bare plate, not "unavailable", when the seeds could not be read', () => {
    render(
      <SignatureCard
        tokenId={24}
        seed={undefined}
        artState="failed"
        title="Chrono-Warrior"
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
      />,
    );
    expect(screen.getByTestId('pending-plate')).not.toHaveAttribute('aria-busy');
    expect(screen.queryByText('Artwork unavailable')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SignatureCard
        tokenId={24}
        seed="5084a8"
        title="Cosmic Signature #000024"
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
      />,
    );
    await checkA11y(container);
  });
});
