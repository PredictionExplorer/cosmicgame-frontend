import '@testing-library/jest-dom';

import { GradientText } from '@/components/ui/gradient-text';

import { render, screen, checkA11y } from '@/test-utils';

describe('GradientText', () => {
  it('renders a span with signature variant by default', () => {
    render(<GradientText data-testid="g">42 ETH</GradientText>);
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('text-gradient-signature');
  });

  it.each([
    ['signature', 'text-gradient-signature'],
    ['nebula', 'text-gradient-nebula'],
    ['aurora', 'text-gradient-aurora'],
  ])('applies variant=%s', (variant, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <GradientText variant={variant as any} data-testid="g">
        val
      </GradientText>,
    );
    expect(screen.getByTestId('g')).toHaveClass(expected);
  });

  it('supports rendering as a heading via `as`', () => {
    render(
      <GradientText as="h2" data-testid="g">
        Title
      </GradientText>,
    );
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('H2');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GradientText>label</GradientText>);
    await checkA11y(container);
  });
});
