import '@testing-library/jest-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { render, screen } from '@/test-utils';

describe('Alert', () => {
  it('renders with default variant', () => {
    render(<Alert>Default alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Default alert');
  });

  it('renders with destructive variant', () => {
    render(<Alert variant="destructive">Error alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error alert');
    expect(alert.className).toMatch(/destructive/);
  });

  it.each(['success', 'warning', 'info'] as const)('renders with %s variant', (variant) => {
    render(<Alert variant={variant}>{variant} alert</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent(`${variant} alert`);
  });

  it('renders AlertTitle and AlertDescription', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert>Accessible alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
