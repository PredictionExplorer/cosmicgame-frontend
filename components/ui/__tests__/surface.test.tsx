import '@testing-library/jest-dom';

import { Surface } from '@/components/ui/surface';

import { render, screen, checkA11y } from '@/test-utils';

describe('Surface', () => {
  it('renders with default glass variant classes', () => {
    render(<Surface data-testid="s">body</Surface>);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('border', 'bg-white/[0.03]');
  });

  it.each([
    ['glass', 'bg-white/[0.03]'],
    ['glass-bordered', 'bg-white/[0.04]'],
    ['solid', 'bg-card'],
    ['gradient-border', 'gradient-border-card'],
    ['gradient-border-accent', 'gradient-border-card-accent'],
    ['elevated', 'shadow-[var(--elevation-3)]'],
  ])('applies variant=%s classes', (variant, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Surface variant={variant as any} data-testid="s">
        body
      </Surface>,
    );
    expect(screen.getByTestId('s')).toHaveClass(expected);
  });

  it('applies radius variants', () => {
    render(
      <Surface radius="lg" data-testid="s">
        body
      </Surface>,
    );
    expect(screen.getByTestId('s')).toHaveClass('rounded-[var(--radius-surface)]');
  });

  it('supports padding variants', () => {
    render(
      <Surface padding="lg" data-testid="s">
        body
      </Surface>,
    );
    expect(screen.getByTestId('s')).toHaveClass('p-6');
  });

  it('renders asChild via Radix Slot', () => {
    render(
      <Surface asChild>
        <a href="/x" data-testid="link">
          link
        </a>
      </Surface>,
    );
    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('border');
  });

  it('merges custom className', () => {
    render(
      <Surface className="custom-x" data-testid="s">
        body
      </Surface>,
    );
    expect(screen.getByTestId('s')).toHaveClass('custom-x');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Surface padding="md">content</Surface>);
    await checkA11y(container);
  });
});
