import '@testing-library/jest-dom';
import { Skeleton } from '@/components/ui/skeleton';

import { render, screen } from '@/test-utils';

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('applies custom className', () => {
    render(<Skeleton className="h-12 w-12" data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('h-12', 'w-12');
    expect(el).toHaveClass('animate-pulse');
  });
});
