import '@testing-library/jest-dom';

import { SectionEyebrow } from '@/components/ui/section-eyebrow';

import { render, screen, checkA11y } from '@/test-utils';

describe('SectionEyebrow', () => {
  it('renders children with the eyebrow typography class', () => {
    render(<SectionEyebrow data-testid="e">Allocation · Live</SectionEyebrow>);
    const el = screen.getByTestId('e');
    expect(el).toHaveTextContent('Allocation · Live');
    expect(el).toHaveClass('type-eyebrow');
  });

  it('renders a colored dot by default', () => {
    render(<SectionEyebrow data-testid="e">x</SectionEyebrow>);
    const dot = screen.getByTestId('e').querySelector('[aria-hidden]');
    expect(dot).not.toBeNull();
  });

  it('hides the dot when showDot={false}', () => {
    render(
      <SectionEyebrow showDot={false} data-testid="e">
        x
      </SectionEyebrow>,
    );
    expect(screen.getByTestId('e').querySelector('[aria-hidden]')).toBeNull();
  });

  it.each([
    ['aurora', 'bg-data-2'],
    ['nebula', 'bg-data-1'],
    ['solar', 'bg-data-3'],
    ['impact', 'bg-data-5'],
    ['rose', 'bg-data-4'],
    ['muted', 'bg-subtle'],
  ] as const)('dot tone=%s uses the %s token', (tone, expected) => {
    render(
      <SectionEyebrow tone={tone} data-testid="e">
        x
      </SectionEyebrow>,
    );
    const dot = screen.getByTestId('e').querySelector('[aria-hidden]');
    expect(dot).toHaveClass(expected);
  });

  it('never pulses, even when a caller still asks for it', () => {
    render(
      <SectionEyebrow pulse data-testid="e">
        Collection
      </SectionEyebrow>,
    );
    const dot = screen.getByTestId('e').querySelector('[aria-hidden]');
    expect(dot?.className).not.toMatch(/animate/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SectionEyebrow>Live</SectionEyebrow>);
    await checkA11y(container);
  });
});
