import { render, screen, checkA11y } from '@/test-utils';

import { NetworkBadge } from '../components/NetworkBadge';

describe('NetworkBadge', () => {
  it('renders chain name and chain ID', () => {
    render(<NetworkBadge chainName="Arbitrum Sepolia" chainId={421614} />);
    expect(screen.getByText('Arbitrum Sepolia')).toBeInTheDocument();
    expect(screen.getByText('Chain 421614')).toBeInTheDocument();
  });

  it('renders with different chain values', () => {
    render(<NetworkBadge chainName="Arbitrum One" chainId={42161} />);
    expect(screen.getByText('Arbitrum One')).toBeInTheDocument();
    expect(screen.getByText('Chain 42161')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NetworkBadge chainName="Arbitrum Sepolia" chainId={421614} />);
    await checkA11y(container);
  });
});
