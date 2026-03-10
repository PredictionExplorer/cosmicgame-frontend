import '@testing-library/jest-dom';
import { Separator } from '@/components/ui/separator';

import { render, screen } from '@/test-utils';

describe('Separator', () => {
  it('renders horizontal by default', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toBeInTheDocument();
    expect(sep).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders vertical when specified', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies custom className', () => {
    render(<Separator className="my-sep" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveClass('my-sep');
  });
});
