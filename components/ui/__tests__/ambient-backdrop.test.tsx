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

    rerender(<AmbientBackdrop variant="none" />);
    expect(container.querySelector('[data-ambient-backdrop="none"]')).toBeInTheDocument();
  });

  it.each([
    ['hero', '[--backdrop-strength:1]'],
    ['subtle', '[--backdrop-strength:0.4]'],
    ['signature', '[--backdrop-strength:0.4]'],
    ['none', '[--backdrop-strength:0]'],
  ] as const)('shows the %s share of the palette atmosphere', (variant, strength) => {
    const { container } = render(<AmbientBackdrop variant={variant} />);
    expect(container.querySelector('[data-ambient-backdrop]')).toHaveClass(strength);
  });

  it('draws the starfield on hero pages only', () => {
    const { container, rerender } = render(<AmbientBackdrop variant="hero" />);
    expect(container.querySelector('[data-starfield]')).toHaveClass('starfield');

    for (const variant of ['subtle', 'signature', 'none'] as const) {
      rerender(<AmbientBackdrop variant={variant} />);
      expect(container.querySelector('[data-starfield]')).toBeNull();
    }
  });

  it('is static: no canvas and no animation', () => {
    const { container } = render(<AmbientBackdrop variant="hero" />);
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.innerHTML).not.toMatch(/animate-/);
  });

  it('keeps its static atmosphere when motion is reduced', () => {
    const { container } = render(<AmbientBackdrop />);
    expect(container.firstElementChild).not.toHaveClass('motion-reduce:hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AmbientBackdrop variant="signature" />);
    await checkA11y(container);
  });
});
