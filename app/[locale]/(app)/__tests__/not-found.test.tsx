import '@testing-library/jest-dom';
import { render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../../components/ui/page-shell', () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
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

import NotFound from '../not-found';

async function renderPage() {
  render(await NotFound());
}

describe('NotFound page', () => {
  it('renders 404 heading', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('errors.notFound.title');
  });

  it('renders a helpful description', async () => {
    await renderPage();
    expect(screen.getByText('errors.notFound.description')).toBeInTheDocument();
  });

  it('renders a "Return Home" button', async () => {
    await renderPage();
    const button = screen.getByText('errors.notFound.returnHome');
    expect(button).toBeInTheDocument();
  });

  it('has a link pointing to "/"', async () => {
    await renderPage();
    const link = screen.getByText('errors.notFound.returnHome').closest('a');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders suggested navigation links', async () => {
    await renderPage();
    expect(screen.getByLabelText('errors.notFound.suggestedPages')).toBeInTheDocument();
    expect(screen.getByText('errors.notFound.links.gallery')).toBeInTheDocument();
    expect(screen.getByText('errors.notFound.links.howItWorks')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(await NotFound());
    await checkA11y(container);
  });
});
