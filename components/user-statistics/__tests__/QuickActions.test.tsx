import { render, screen, checkA11y } from '@/test-utils';

import { QuickActions } from '../QuickActions';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div
        data-testid={props['data-testid'] as string | undefined}
        className={props.className as string | undefined}
      >
        {children}
      </div>
    ),
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('QuickActions', () => {
  const address = '0xAbC123';

  it('renders the quick-actions container', () => {
    render(<QuickActions address={address} />);
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  it('renders all 4 action links', () => {
    render(<QuickActions address={address} />);
    expect(screen.getByText('Anchor NFTs')).toBeInTheDocument();
    expect(screen.getByText('Make a Gesture')).toBeInTheDocument();
    expect(screen.getByText('View Transfers')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection History')).toBeInTheDocument();
  });

  it('renders action descriptions', () => {
    render(<QuickActions address={address} />);
    expect(
      screen.getByText('Receive Anchor Distributions by anchoring your tokens'),
    ).toBeInTheDocument();
    expect(screen.getByText('Take part in the active cycle')).toBeInTheDocument();
  });

  it('links to correct anchoring page', () => {
    render(<QuickActions address={address} />);
    const anchorLink = screen.getByText('Anchor NFTs').closest('a');
    expect(anchorLink).toHaveAttribute('href', '/my-anchors');
  });

  it('links to correct transfer page with address', () => {
    render(<QuickActions address={address} />);
    const transferLink = screen.getByText('View Transfers').closest('a');
    expect(transferLink).toHaveAttribute('href', `/cosmic-signature-transfer/${address}`);
  });

  it('links to correct raffle history page with address', () => {
    render(<QuickActions address={address} />);
    const raffleLink = screen.getByText('Stellar Selection History').closest('a');
    expect(raffleLink).toHaveAttribute('href', `/user/stellar-selection-eth/${address}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<QuickActions address={address} />);
    await checkA11y(container);
  });
});
