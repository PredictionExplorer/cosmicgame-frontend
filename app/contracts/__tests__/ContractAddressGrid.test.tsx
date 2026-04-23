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
    name: 'Cosmic Signature (core)',
    address: '0xAAA',
    description: 'Core protocol',
    category: 'core',
  },
  {
    name: 'Cosmic Signature',
    address: '0xBBB',
    description: 'NFT collection',
    category: 'core',
  },
  {
    name: 'Public Goods Vault',
    address: '0xCCC',
    description: 'Public goods',
    category: 'wallet',
  },
  {
    name: 'CST Anchor Wallet',
    address: '0xDDD',
    description: 'CST anchors',
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
    expect(screen.getByText('Cosmic Signature (core)')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature')).toBeInTheDocument();
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.getByText('CST Anchor Wallet')).toBeInTheDocument();
  });

  it('renders category group dividers', () => {
    render(<ContractAddressGrid {...defaultProps} />);
    expect(screen.getByText('Core Contracts')).toBeInTheDocument();
    expect(screen.getByText('Wallet Contracts')).toBeInTheDocument();
    expect(screen.getByText('Staking Contracts')).toBeInTheDocument();
  });

  it('filters contracts by search term (name)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="public" />);
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Signature (core)')).not.toBeInTheDocument();
  });

  it('filters contracts by search term (address)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="0xDDD" />);
    expect(screen.getByText('CST Anchor Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Signature (core)')).not.toBeInTheDocument();
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
