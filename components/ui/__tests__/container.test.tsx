import '@testing-library/jest-dom';

import { Container } from '@/components/ui/container';

import { render, screen, checkA11y } from '@/test-utils';

describe('Container', () => {
  it('renders on the shared site edge by default, with the gutter built in', () => {
    render(<Container data-testid="c">body</Container>);
    const el = screen.getByTestId('c');
    expect(el).toHaveClass('site-container');
    expect(el.className).not.toMatch(/\bpx-/);
  });

  it.each([
    ['wide', 'w-[min(100%-2*var(--gutter),90rem)]'],
    ['reading', 'w-[min(100%-2*var(--gutter),var(--measure-prose))]'],
  ] as const)('applies the fluid size=%s', (size, expected) => {
    render(
      <Container size={size} data-testid="c">
        body
      </Container>,
    );
    expect(screen.getByTestId('c')).toHaveClass(expected);
  });

  it('spans its parent at size=full', () => {
    render(
      <Container size="full" data-testid="c">
        body
      </Container>,
    );
    expect(screen.getByTestId('c')).toHaveClass('max-w-none');
    expect(screen.getByTestId('c').className).not.toMatch(/\bpx-/);
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
