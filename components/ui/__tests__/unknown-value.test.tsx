import { render, screen } from '@testing-library/react';

import { UnknownValue } from '../unknown-value';

describe('UnknownValue', () => {
  it('shows an em dash and announces the label instead', () => {
    render(<UnknownValue label="Unavailable" />);

    expect(screen.getByText('—')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Unavailable')).toHaveClass('sr-only');
    expect(screen.getByTitle('Unavailable')).toBeInTheDocument();
  });

  it('never renders a zero', () => {
    const { container } = render(<UnknownValue label="Unavailable" />);

    expect(container.textContent).not.toMatch(/\d/);
  });
});
