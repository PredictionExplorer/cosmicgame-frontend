import '@testing-library/jest-dom';
import {
  Skeleton,
  SkeletonText,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonNFTCard,
} from '@/components/ui/skeleton';

import { render, screen, checkA11y } from '@/test-utils';

describe('Skeleton', () => {
  it('renders with shimmer by default', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('overflow-hidden');
    expect(el.className).toMatch(/before:animate-shimmer/);
  });

  it('keeps animate-pulse on the base element for backward compat', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('omits the shimmer when shine={false}', () => {
    render(<Skeleton shine={false} data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('animate-pulse');
    expect(el.className).not.toMatch(/before:animate-shimmer/);
  });

  it('applies custom className', () => {
    render(<Skeleton className="h-12 w-12" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('h-12', 'w-12');
  });

  it('is aria-hidden so multiple skeletons do not spam SR users', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton className="h-12 w-12" />);
    await checkA11y(container);
  });
});

describe('SkeletonText', () => {
  it('renders the configured line count', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const bars = container.querySelectorAll('[aria-hidden]');
    expect(bars.length).toBe(5);
  });

  it('exposes a loading role', () => {
    render(<SkeletonText lines={3} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SkeletonStatCard', () => {
  it('exposes a single loading status wrapper', () => {
    render(<SkeletonStatCard />);
    expect(screen.getByRole('status', { name: /loading stat/i })).toBeInTheDocument();
  });
});

describe('SkeletonTableRow', () => {
  it('renders the configured cell count', () => {
    const { container } = render(<SkeletonTableRow cols={6} />);
    const cells = container.querySelectorAll('[aria-hidden]');
    expect(cells.length).toBe(6);
  });
});

describe('SkeletonNFTCard', () => {
  it('exposes a loading status', () => {
    render(<SkeletonNFTCard />);
    expect(screen.getByRole('status', { name: /loading nft/i })).toBeInTheDocument();
  });
});
