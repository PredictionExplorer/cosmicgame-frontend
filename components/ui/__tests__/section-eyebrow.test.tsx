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
    ['aurora', 'bg-[oklch(84.7%_0.149_213)]'],
    ['nebula', 'bg-[oklch(50.4%_0.247_296)]'],
    ['solar', 'bg-[oklch(82.4%_0.162_81)]'],
    ['impact', 'bg-[oklch(77.1%_0.163_161)]'],
    ['muted', 'bg-white/40'],
  ])('dot tone=%s applies the right bg', (tone, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SectionEyebrow tone={tone as any} data-testid="e">
        x
      </SectionEyebrow>,
    );
    const dot = screen.getByTestId('e').querySelector('[aria-hidden]');
    expect(dot).toHaveClass(expected);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SectionEyebrow>Live</SectionEyebrow>);
    await checkA11y(container);
  });
});
