import '@testing-library/jest-dom';

import { LoadingState } from '@/components/ui/loading-state';

import { render, screen, checkA11y } from '@/test-utils';

describe('LoadingState', () => {
  it('renders the default title + spinner', () => {
    const { container } = render(<LoadingState />);
    // The visible title is a <p>, distinct from the Spinner's sr-only "Loading..."
    const title = container.querySelector('p.type-heading-3');
    expect(title).toHaveTextContent(/^loading$/i);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses the given title and description', () => {
    render(
      <LoadingState title="Fetching cycles" description="This takes a few seconds on cold cache" />,
    );
    expect(screen.getByText(/fetching cycles/i)).toBeInTheDocument();
    expect(screen.getByText(/cold cache/i)).toBeInTheDocument();
  });

  it('renders an estimated-time hint when provided', () => {
    render(<LoadingState hint={<span>Usually ~8 seconds</span>} />);
    expect(screen.getByText(/usually ~8 seconds/i)).toBeInTheDocument();
  });

  it.each([
    ['sm', 'py-8'],
    ['md', 'py-16'],
    ['lg', 'py-24'],
  ])('size=%s applies padding %s', (size, expectedPad) => {
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <LoadingState size={size as any} />,
    );
    expect(container.firstElementChild).toHaveClass(expectedPad);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoadingState description="Loading data" />);
    await checkA11y(container);
  });
});
