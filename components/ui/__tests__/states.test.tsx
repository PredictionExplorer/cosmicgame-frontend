import '@testing-library/jest-dom';
import { ImageOff } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  SkeletonArtPlate,
  SkeletonChart,
  SkeletonDetailRows,
  SkeletonPageHeader,
  SkeletonFigures,
  SkeletonTable,
} from '@/components/ui/skeleton';

import { checkA11y, render, screen } from '@/test-utils';

describe('EmptyState', () => {
  it.each([
    ['page', 'py-20'],
    ['panel', 'py-12'],
    ['inline', 'text-left'],
  ] as const)('sizes the %s variant for the space it replaces', (variant, expected) => {
    const { container } = render(<EmptyState variant={variant} title="No gestures yet" />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it('takes the heading level of its place in the outline', () => {
    render(<EmptyState title="No allocations" headingLevel={2} variant="page" />);
    expect(screen.getByRole('heading', { level: 2, name: 'No allocations' })).toBeInTheDocument();
  });

  it('normalises any icon into the subtle tile', () => {
    const { container } = render(
      <EmptyState icon={<ImageOff className="h-8 w-8" />} title="No NFTs attached" />,
    );
    const tile = container.querySelector('[aria-hidden]');
    expect(tile).toHaveClass('bg-surface-sunken', 'text-subtle');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState title="Nothing anchored" description="Anchor an NFT to see it here." />,
    );
    await checkA11y(container);
  });
});

describe('ErrorState', () => {
  it('puts the status colour on the icon tile only', () => {
    const { container } = render(<ErrorState tone="warning" title="Delayed" />);
    expect(container.querySelector('[aria-hidden]')).toHaveClass('text-attention');
    expect(screen.getByRole('heading', { name: 'Delayed' })).toHaveClass('text-foreground');
  });
});

describe('layout-matched skeletons', () => {
  it('draws a ledger at the finished row height with a phone card layout', () => {
    const { container } = render(<SkeletonTable rows={5} columns={3} />);
    expect(screen.getByRole('status')).toHaveTextContent('tables.skeleton.loadingRows');
    expect(container.querySelectorAll('.min-h-\\[var\\(--row-h\\)\\]')).toHaveLength(5);
    expect(container.querySelector('.sm\\:hidden')).not.toBeNull();
  });

  it('announces once when nested in a page skeleton', () => {
    render(
      <div role="status" aria-label="Loading">
        <SkeletonPageHeader />
        <SkeletonFigures announce={false} />
        <SkeletonDetailRows announce={false} rows={3} />
        <SkeletonChart announce={false} />
        <SkeletonArtPlate />
      </div>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('keeps the art plate at the native ratio on the black ground', () => {
    const { container } = render(<SkeletonArtPlate />);
    expect(container.firstElementChild).toHaveClass('aspect-art', 'bg-art-ground');
  });
});
