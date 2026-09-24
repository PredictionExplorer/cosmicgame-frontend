import { render, screen, checkA11y } from '@/test-utils';

import { NFTDetailSkeleton } from '../NFTDetailSkeleton';

describe('NFTDetailSkeleton', () => {
  it('renders the skeleton container as busy', () => {
    render(<NFTDetailSkeleton />);
    expect(screen.getByTestId('nft-detail-skeleton')).toHaveAttribute('aria-busy', 'true');
  });

  it('reserves the art plate at the native ratio, not a 16:9 box', () => {
    render(<NFTDetailSkeleton />);
    const plate = screen.getByTestId('pending-plate');
    expect(plate).toHaveClass('aspect-art');
    expect(plate).toHaveAttribute('aria-busy', 'true');
  });

  it('reserves the rows of the provenance ledger', () => {
    render(<NFTDetailSkeleton />);
    expect(screen.getAllByTestId('spec-row-skeleton')).toHaveLength(6);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTDetailSkeleton />);
    await checkA11y(container);
  });
});
