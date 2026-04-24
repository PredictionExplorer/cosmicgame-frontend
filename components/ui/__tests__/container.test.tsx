import '@testing-library/jest-dom';

import { Container } from '@/components/ui/container';

import { render, screen, checkA11y } from '@/test-utils';

describe('Container', () => {
  it('renders with default xl size + md gutter', () => {
    render(<Container data-testid="c">body</Container>);
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('max-w-7xl', 'mx-auto', 'w-full');
  });

  it.each([
    ['sm', 'max-w-2xl'],
    ['md', 'max-w-4xl'],
    ['lg', 'max-w-6xl'],
    ['xl', 'max-w-7xl'],
    ['full', 'max-w-none'],
    ['prose', 'max-w-prose'],
  ])('applies size=%s', (size, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Container size={size as any} data-testid="c">
        body
      </Container>,
    );
    expect(screen.getByTestId('c')).toHaveClass(expected);
  });

  it('applies gutter variants', () => {
    render(
      <Container gutter="lg" data-testid="c">
        body
      </Container>,
    );
    expect(screen.getByTestId('c')).toHaveClass('px-4');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Container>content</Container>);
    await checkA11y(container);
  });
});
