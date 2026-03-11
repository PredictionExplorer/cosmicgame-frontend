import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

describe('Input', () => {
  it('renders with default styling', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('handles type prop', () => {
    render(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} data-testid="input" />);
    fireEvent.change(screen.getByTestId('input'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Input className="my-input" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('my-input');
  });

  it('handles placeholder', () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <label>
        Email
        <Input type="email" />
      </label>,
    );
    await checkA11y(container);
  });
});
