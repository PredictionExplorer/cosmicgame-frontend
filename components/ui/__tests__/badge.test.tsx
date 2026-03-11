import '@testing-library/jest-dom';
import { Badge } from '@/components/ui/badge';

import { render, screen, checkA11y } from '@/test-utils';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it.each(['secondary', 'destructive', 'outline'] as const)(
    'renders with %s variant',
    (variant) => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
    },
  );

  it('renders children', () => {
    render(<Badge>Badge Content</Badge>);
    expect(screen.getByText('Badge Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="extra-class">Styled</Badge>);
    expect(screen.getByText('Styled')).toHaveClass('extra-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    await checkA11y(container);
  });
});
