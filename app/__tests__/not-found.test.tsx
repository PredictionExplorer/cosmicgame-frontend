import '@testing-library/jest-dom';
import { render, screen } from '@/test-utils';

jest.mock('../../components/styled', () => ({
  MainWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children?: React.ReactNode;
    href?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// eslint-disable-next-line import/order
import NotFound from '@/app/not-found';

describe('NotFound page', () => {
  it('renders "404 - Page Not Found" text', () => {
    render(<NotFound />);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('renders a "Return Home" button', () => {
    render(<NotFound />);
    const button = screen.getByText('Return Home');
    expect(button).toBeInTheDocument();
  });

  it('has a link pointing to "/"', () => {
    render(<NotFound />);
    const link = screen.getByText('Return Home').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });
});
