import '@testing-library/jest-dom';

import { AmbientBackdrop } from '@/components/ui/ambient-backdrop';

import { render, checkA11y } from '@/test-utils';

describe('AmbientBackdrop', () => {
  it('renders with aria-hidden + pointer-events-none by default', () => {
    const { container } = render(<AmbientBackdrop />);
    const el = container.querySelector('[data-ambient-backdrop]');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute('aria-hidden');
    expect(el).toHaveClass('pointer-events-none', 'fixed', 'inset-0', '-z-10');
  });

  it('data-variant reflects the prop', () => {
    const { container, rerender } = render(<AmbientBackdrop variant="subtle" />);
    expect(container.querySelector('[data-ambient-backdrop="subtle"]')).toBeInTheDocument();

    rerender(<AmbientBackdrop variant="signature" />);
    expect(container.querySelector('[data-ambient-backdrop="signature"]')).toBeInTheDocument();

    rerender(<AmbientBackdrop variant="hero" />);
    expect(container.querySelector('[data-ambient-backdrop="hero"]')).toBeInTheDocument();
  });

  it('hides under prefers-reduced-motion via motion-reduce:hidden', () => {
    const { container } = render(<AmbientBackdrop />);
    expect(container.firstElementChild).toHaveClass('motion-reduce:hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AmbientBackdrop variant="signature" />);
    await checkA11y(container);
  });
});
