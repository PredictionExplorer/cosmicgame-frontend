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
    ['data', 'max-w-7xl'],
    ['marketing', 'max-w-7xl'],
    ['form', 'max-w-3xl'],
    ['detail', 'max-w-6xl'],
  ])('applies variant=%s max-width', (variant, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PageShell variant={variant as any}>body</PageShell>,
    );
    expect(screen.getByRole('main')).toHaveClass(expected);
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
