import { checkA11y, render, screen } from '@/test-utils';

import { RandomWalkPlate } from '../RandomWalkPlate';

describe('RandomWalkPlate', () => {
  it('links the thumbnail to the token page in a new tab, named by its alt text', () => {
    render(<RandomWalkPlate tokenId={4242} alt="Random Walk NFT #004242" />);

    const link = screen.getByRole('link', { name: /^Random Walk NFT #004242/ });
    expect(link).toHaveAttribute('href', 'https://www.randomwalknft.com/detail/4242');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // It leaves the app, and says so to screen readers.
    expect(link).toHaveAccessibleName('Random Walk NFT #004242 nav.link.newTab');
    expect(screen.getByRole('img', { name: 'Random Walk NFT #004242' })).toHaveAttribute(
      'src',
      expect.stringContaining('004242_black_thumb.jpg'),
    );
  });

  it('draws nothing over the art: no number chip, badge or arrow inside the plate', () => {
    render(<RandomWalkPlate tokenId={7} alt="Random Walk NFT #000007" />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveTextContent('#000007');
    expect(link.querySelector('svg')).toBeNull();
    // The image and the screen-reader note only.
    expect(Array.from(link.children).filter((child) => !child.matches('.sr-only'))).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RandomWalkPlate tokenId={7} alt="Random Walk NFT #000007" />);
    await checkA11y(container);
  });
});
