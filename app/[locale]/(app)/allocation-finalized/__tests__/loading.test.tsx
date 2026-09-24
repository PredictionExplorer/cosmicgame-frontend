import { render, screen } from '@/test-utils';

import AllocationFinalizedLoading from '../loading';

describe('AllocationFinalizedLoading', () => {
  it('holds the record page shape and says once that it is loading', () => {
    render(<AllocationFinalizedLoading />);
    expect(
      screen.getByRole('status', { name: 'allocation.finalized.loading.status' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
  });
});
