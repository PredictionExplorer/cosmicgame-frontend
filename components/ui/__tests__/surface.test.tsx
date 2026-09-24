import '@testing-library/jest-dom';

import { Surface } from '@/components/ui/surface';

import { render, screen, checkA11y } from '@/test-utils';

describe('Surface', () => {
  it('renders the outlined role by default, on tokens rather than white alpha', () => {
    render(<Surface data-testid="s">body</Surface>);
    const el = screen.getByTestId('s');
    expect(el).toHaveClass('border', 'border-rule-faint', 'rounded-surface');
    expect(el.className).not.toMatch(/white\//);
  });

  it.each([
    ['plain', null],
    ['quiet', 'bg-surface'],
    ['outlined', 'border-rule-faint'],
    ['raised', 'shadow-float'],
    ['glass', 'border-rule-faint'],
    ['glass-bordered', 'border-rule'],
    ['solid', 'bg-surface'],
    ['gradient-border', 'gradient-border-card'],
    ['gradient-border-accent', 'gradient-border-card-accent'],
    ['elevated', 'shadow-float'],
    ['solar', 'border-rule-faint'],
  ] as const)('applies variant=%s', (variant, expected) => {
    render(
      <Surface variant={variant} data-testid="s">
        body
      </Surface>,
    );
    const el = screen.getByTestId('s');
    if (expected) expect(el).toHaveClass(expected);
    else expect(el).not.toHaveClass('border');
  });

  it('lands every radius on the four-value scale', () => {
    render(
      <Surface radius="xl" data-testid="s">
        body
      </Surface>,
    );
    expect(screen.getByTestId('s')).toHaveClass('rounded-surface');
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
