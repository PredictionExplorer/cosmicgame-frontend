import '@testing-library/jest-dom';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/ui/button';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it.each([
    'default',
    'commit',
    'destructive',
    'outline',
    'secondary',
    'ghost',
    'quiet',
    'link',
    'text',
  ] as const)('renders with variant="%s"', (variant) => {
    render(<Button variant={variant}>{variant} button</Button>);
    expect(screen.getByRole('button', { name: new RegExp(variant, 'i') })).toBeInTheDocument();
  });

  it.each(['default', 'sm', 'lg', 'xl', 'icon'] as const)('renders with size="%s"', (size) => {
    render(<Button size={size}>btn</Button>);
    expect(screen.getByRole('button', { name: /btn/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Styled</Button>);
    expect(screen.getByRole('button', { name: /styled/i })).toHaveClass('custom-class');
  });

  it('renders labels as written, never in forced Title Case', () => {
    for (const variant of ['default', 'commit', 'outline', 'secondary'] as const) {
      const { unmount } = render(<Button variant={variant}>Make a gesture</Button>);
      expect(screen.getByRole('button', { name: 'Make a gesture' })).not.toHaveClass('capitalize');
      unmount();
    }
  });

  it('eases every property that changes on hover and press', () => {
    render(<Button>Ease</Button>);
    const button = screen.getByRole('button', { name: 'Ease' });
    const transition = [...button.classList].find((name) => name.startsWith('transition-'));
    expect(transition).toEqual(expect.stringContaining('filter'));
    expect(transition).toEqual(expect.stringContaining('transform'));
    expect(button.className).toMatch(/active:/);
  });

  it('keeps its label, shows a spinner and reports busy while loading', () => {
    const handleClick = jest.fn();
    render(
      <Button loading onClick={handleClick}>
        Retrieve
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Retrieve' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // Busy, not unavailable: a natively disabled button would drop focus.
    expect(button).not.toBeDisabled();
    expect(button.querySelector('[data-slot="button-spinner"]')).toHaveAttribute('aria-hidden');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('keeps keyboard focus on a button that turns busy when pressed', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    function PendingAction() {
      const [busy, setBusy] = useState(false);
      return (
        <Button
          loading={busy}
          onClick={() => {
            handleClick();
            setBusy(true);
          }}
        >
          Retrieve
        </Button>
      );
    }
    render(<PendingAction />);
    const button = screen.getByRole('button', { name: 'Retrieve' });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveFocus();

    // Further presses are ignored while the action is pending.
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not submit its form while busy', () => {
    const handleSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit" loading>
          Make a gesture
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Make a gesture' }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('stays natively disabled when unavailable, even while loading', () => {
    render(
      <Button loading disabled>
        Retrieve
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Retrieve' })).toBeDisabled();
  });

  it('keeps a caller’s own aria-busy when it is not loading', () => {
    render(<Button aria-busy>Opening</Button>);
    expect(screen.getByRole('button', { name: 'Opening' })).toHaveAttribute('aria-busy', 'true');
  });

  it('shows a held state for a toggle button', () => {
    render(
      <Button variant="outline" aria-pressed>
        Compact
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Compact', pressed: true })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    await checkA11y(container);
  });
});
