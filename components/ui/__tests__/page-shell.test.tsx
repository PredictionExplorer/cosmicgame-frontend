import '@testing-library/jest-dom';

import { PageShell } from '@/components/ui/page-shell';

import { render, screen, checkA11y } from '@/test-utils';

describe('PageShell', () => {
  it('renders as <main> with default #main id', () => {
    render(<PageShell>content</PageShell>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main');
    expect(main).toHaveAttribute('tabIndex', '-1');
  });

  it('supports an override id', () => {
    render(<PageShell id="content">body</PageShell>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content');
  });

  it.each([
    ['data', 'max-w-[calc(80rem+2*var(--gutter))]'],
    ['marketing', 'max-w-[calc(80rem+2*var(--gutter))]'],
    ['form', 'max-w-[calc(48rem+2*var(--gutter))]'],
    ['detail', 'max-w-[calc(72rem+2*var(--gutter))]'],
  ] as const)('applies variant=%s its measure on the shared gutter', (variant, expected) => {
    render(<PageShell variant={variant}>body</PageShell>);
    const main = screen.getByRole('main');
    expect(main).toHaveClass(expected, 'px-[var(--gutter)]', 'mx-auto');
    // The header and footer draw their edge from --gutter; a fixed padding
    // put page content 9-27px off the wordmark between 640 and 1376px.
    expect(main.className).not.toMatch(/\bsm:px-6\b|\bpx-4\b/);
  });

  it('lets a caller open a full-bleed page', () => {
    render(
      <PageShell variant="detail" className="max-w-none px-0">
        body
      </PageShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-none', 'px-0');
    expect(main).not.toHaveClass('px-[var(--gutter)]');
  });

  it('renders an AmbientBackdrop by default', () => {
    const { container } = render(<PageShell>body</PageShell>);
    expect(container.querySelector('[data-ambient-backdrop]')).toBeInTheDocument();
  });

  it('suppresses the backdrop when backdrop={null}', () => {
    const { container } = render(<PageShell backdrop={null}>body</PageShell>);
    expect(container.querySelector('[data-ambient-backdrop]')).toBeNull();
  });

  it('bare variant strips padding + min-height', () => {
    render(<PageShell variant="bare">body</PageShell>);
    expect(screen.getByRole('main')).toHaveClass('overflow-visible');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageShell>
        <h1>Title</h1>
        <p>Body</p>
      </PageShell>,
    );
    await checkA11y(container);
  });
});
