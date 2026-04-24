import '@testing-library/jest-dom';

import { SkipLink } from '@/components/ui/skip-link';

import { render, screen, checkA11y } from '@/test-utils';

describe('SkipLink', () => {
  it('defaults to #main target', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main');
  });

  it('accepts a custom target', () => {
    render(<SkipLink href="#content">Skip to content</SkipLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#content');
  });

  it('renders screen-reader-only until focused', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('sr-only');
    expect(link).toHaveClass('focus:not-sr-only');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SkipLink />);
    await checkA11y(container);
  });
});
