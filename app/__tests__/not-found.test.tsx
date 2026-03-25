import '@testing-library/jest-dom';
import { render, screen, checkA11y } from '@/test-utils';

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
  it('renders 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/404/);
  });

  it('renders a helpful description', () => {
    render(<NotFound />);
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument();
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

  it('renders suggested navigation links', () => {
    render(<NotFound />);
    expect(screen.getByLabelText('Suggested pages')).toBeInTheDocument();
    expect(screen.getByText('NFT Gallery')).toBeInTheDocument();
    expect(screen.getByText('How to Play')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NotFound />);
    await checkA11y(container);
  });
});
