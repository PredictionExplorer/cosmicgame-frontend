import { render, screen, checkA11y } from '@/test-utils';

import { NFTDetailSkeleton } from '../NFTDetailSkeleton';

describe('NFTDetailSkeleton', () => {
  it('renders the skeleton container', () => {
    render(<NFTDetailSkeleton />);
    expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
  });

  it('renders multiple skeleton shimmer elements', () => {
    const { container } = render(<NFTDetailSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it('renders four stat card skeleton placeholders', () => {
    const { container } = render(<NFTDetailSkeleton />);
    const statCards = container.querySelectorAll('.rounded-xl.border');
    expect(statCards.length).toBeGreaterThanOrEqual(4);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTDetailSkeleton />);
    await checkA11y(container);
  });
});
