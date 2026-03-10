import '@testing-library/jest-dom';
import { Spinner } from '@/components/ui/spinner';

import { render, screen } from '@/test-utils';

describe('Spinner', () => {
  it('renders with default (md) size', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    const svg = status.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it.each([
    ['sm', 'h-4', 'w-4'],
    ['md', 'h-8', 'w-8'],
    ['lg', 'h-12', 'w-12'],
  ] as const)('renders with size="%s"', (size, heightClass, widthClass) => {
    render(<Spinner size={size} />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass(heightClass, widthClass);
  });

  it('has role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has sr-only loading text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});
