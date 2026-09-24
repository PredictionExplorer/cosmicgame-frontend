import { render, screen } from '@/test-utils';

import NftDetailLoading from '../[id]/loading';

describe('detail loading boundary', () => {
  it('renders the skeleton and the ground the page itself uses', () => {
    const { container } = render(<NftDetailLoading />);
    // The same component NFTTrait shows while the token record loads.
    expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
    expect(container.querySelector('main#main')).not.toBeNull();
    // Lights down, as on the page: no atmosphere behind the plate.
    expect(container.querySelector('[data-ambient-backdrop]')).toHaveAttribute(
      'data-ambient-backdrop',
      'none',
    );
  });

  it('announces loading once', () => {
    render(<NftDetailLoading />);
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent('common.status.loadingEllipsis');
  });
});
