import { render, screen } from '@testing-library/react';

import { UnknownValue } from '../unknown-value';

describe('UnknownValue', () => {
  it('shows an em dash and announces the label instead', () => {
    render(<UnknownValue label="Unavailable" />);

    expect(screen.getByText('—')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Unavailable')).toHaveClass('sr-only');
  });

  it('announces the label once, with no title for screen readers to repeat', () => {
    const { container } = render(<UnknownValue label="Unavailable" />);

    expect(container.querySelector('[title]')).toBeNull();
    expect(screen.getAllByText('Unavailable')).toHaveLength(1);
  });

  it('never renders a zero', () => {
    const { container } = render(<UnknownValue label="Unavailable" />);

    expect(container.textContent).not.toMatch(/\d/);
  });
});
