import { checkA11y, render, screen } from '@/test-utils';

import { AllocationSignatureCard } from '../AllocationSignatureCard';

describe('AllocationSignatureCard', () => {
  it('leads to the token from its title, the plate being a pointer shortcut only', () => {
    const { container } = render(
      <AllocationSignatureCard
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
      <AllocationSignatureCard
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

  it('joins the rows of its grid so neighbouring labels line up', () => {
    // Regression: on /allocation/1 a role whose amounts wrapped on a phone
    // pushed its Recipient line below its neighbour's.
    const { container, rerender } = render(
      <AllocationSignatureCard
        tokenId={27}
        seed="5084a8"
        title="Chrono-Warrior"
        meta={['#000027', '3.5397 ETH', '1,000 CST']}
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
        subgrid
      >
        <p>Recipient</p>
      </AllocationSignatureCard>,
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('row-span-4', 'grid-rows-subgrid');
    expect(container.querySelector('figcaption')).toHaveClass('row-span-3', 'grid-rows-subgrid');
    // A shrinkable column at each level: a long recipient name wraps in the
    // card instead of pushing it past a 320px phone's edge.
    expect(figure).toHaveClass('grid-cols-1');
    expect(container.querySelector('figcaption')).toHaveClass('grid-cols-1');

    rerender(
      <AllocationSignatureCard
        tokenId={27}
        seed="5084a8"
        title="Chrono-Warrior"
        sizes="20rem"
        unavailableLabel="Artwork unavailable"
      />,
    );
    expect(container.querySelector('figure')).not.toHaveClass('grid-rows-subgrid');
  });

  it('holds a busy plate with no "unavailable" caption while the seed is on its way', () => {
    render(
      <AllocationSignatureCard
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
      <AllocationSignatureCard
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
      <AllocationSignatureCard
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
