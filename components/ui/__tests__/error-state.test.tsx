import '@testing-library/jest-dom';

import { ErrorState } from '@/components/ui/error-state';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

describe('ErrorState', () => {
  it('renders the default title', () => {
    render(<ErrorState />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders custom title + message', () => {
    render(<ErrorState title="Fetch failed" message="Please retry shortly" />);
    expect(screen.getByText(/fetch failed/i)).toBeInTheDocument();
    expect(screen.getByText(/retry shortly/i)).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    const btn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry when onRetry is omitted', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders inside a Surface when surface=true', () => {
    const { container } = render(<ErrorState surface />);
    expect(container.querySelector('.border')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ErrorState message="Oops" onRetry={() => {}} />);
    await checkA11y(container);
  });
});
