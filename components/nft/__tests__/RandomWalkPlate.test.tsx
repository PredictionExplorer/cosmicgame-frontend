import { render, screen } from '@/test-utils';

import { RandomWalkPlate } from '../RandomWalkPlate';

describe('RandomWalkPlate', () => {
  it('links the thumbnail to the token page, named by its alt text', () => {
    render(<RandomWalkPlate tokenId={4242} alt="RandomWalk NFT #004242" />);

    const link = screen.getByRole('link', { name: 'RandomWalk NFT #004242' });
    expect(link).toHaveAttribute('href', 'https://www.randomwalknft.com/detail/4242');
    expect(screen.getByRole('img', { name: 'RandomWalk NFT #004242' })).toHaveAttribute(
      'src',
      expect.stringContaining('004242_black_thumb.jpg'),
    );
  });

  it('draws nothing over the art: no number chip or badge inside the plate', () => {
    render(<RandomWalkPlate tokenId={7} alt="RandomWalk NFT #000007" />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveTextContent('#000007');
    expect(link.children).toHaveLength(1);
  });
});
