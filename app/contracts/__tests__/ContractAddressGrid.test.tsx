import { render, screen, checkA11y } from '@/test-utils';

import { ContractAddressGrid, type ContractEntry } from '../components/ContractAddressGrid';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
    }) => (
      <div className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

const contracts: ContractEntry[] = [
  {
    name: 'Cosmic Game',
    address: '0xAAA',
    description: 'Main game',
    category: 'core',
  },
  {
    name: 'Cosmic Signature',
    address: '0xBBB',
    description: 'NFT collection',
    category: 'core',
  },
  {
    name: 'Charity Wallet',
    address: '0xCCC',
    description: 'Charity',
    category: 'wallet',
  },
  {
    name: 'CST Staking Wallet',
    address: '0xDDD',
    description: 'CST Staking',
    category: 'staking',
  },
];

const defaultProps = {
  contracts,
  explorerUrl: 'https://explorer.example.com',
  searchTerm: '',
  onSearchChange: jest.fn(),
};

describe('ContractAddressGrid', () => {
  it('renders all contract address cards', () => {
    render(<ContractAddressGrid {...defaultProps} />);
    expect(screen.getByText('Cosmic Game')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature')).toBeInTheDocument();
    expect(screen.getByText('Charity Wallet')).toBeInTheDocument();
    expect(screen.getByText('CST Staking Wallet')).toBeInTheDocument();
  });

  it('renders category group dividers', () => {
    render(<ContractAddressGrid {...defaultProps} />);
    expect(screen.getByText('Core Contracts')).toBeInTheDocument();
    expect(screen.getByText('Wallet Contracts')).toBeInTheDocument();
    expect(screen.getByText('Staking Contracts')).toBeInTheDocument();
  });

  it('filters contracts by search term (name)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="charity" />);
    expect(screen.getByText('Charity Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Game')).not.toBeInTheDocument();
  });

  it('filters contracts by search term (address)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="0xDDD" />);
    expect(screen.getByText('CST Staking Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Game')).not.toBeInTheDocument();
  });

  it('shows empty state when search has no results', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="nonexistent" />);
    expect(screen.getByText(/No contracts match/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContractAddressGrid {...defaultProps} />);
    await checkA11y(container);
  });
});
