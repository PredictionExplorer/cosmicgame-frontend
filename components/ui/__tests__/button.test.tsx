import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it.each(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'text'] as const)(
    'renders with variant="%s"',
    (variant) => {
      render(<Button variant={variant}>{variant} button</Button>);
      expect(screen.getByRole('button', { name: new RegExp(variant, 'i') })).toBeInTheDocument();
    },
  );

  it.each(['default', 'sm', 'lg', 'icon'] as const)('renders with size="%s"', (size) => {
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

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    await checkA11y(container);
  });
});
