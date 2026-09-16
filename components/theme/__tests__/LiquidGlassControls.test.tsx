import { render, screen } from '@testing-library/react';

import { Button } from '@/components/ui/button';

describe('Liquid Glass control boundaries', () => {
  it('keeps destructive actions and text links outside the optional material', () => {
    render(
      <>
        <Button variant="destructive">Remove</Button>
        <Button variant="link">Read more</Button>
        <Button disabled>Unavailable</Button>
      </>,
    );
    for (const name of ['Remove', 'Read more']) {
      const button = screen.getByRole('button', { name });
      expect(button).not.toHaveClass('cs-glass-control');
      expect(button).not.toHaveClass('cs-glass-cta');
    }
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });
});
