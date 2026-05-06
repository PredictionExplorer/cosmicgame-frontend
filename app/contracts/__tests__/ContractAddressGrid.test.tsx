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
    name: 'Public Goods Vault',
    address: '0xCCC',
    description: 'Public Goods',
    category: 'wallet',
  },
  {
    name: 'Cosmic Signature NFT Anchoring Wallet',
    address: '0xDDD',
    description: 'Cosmic Signature NFT Anchoring',
    category: 'anchoring',
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
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature NFT Anchoring Wallet')).toBeInTheDocument();
  });

  it('renders category group dividers', () => {
    render(<ContractAddressGrid {...defaultProps} />);
    expect(screen.getByText('Core Contracts')).toBeInTheDocument();
    expect(screen.getByText('Wallet Contracts')).toBeInTheDocument();
    expect(screen.getByText('Anchoring Contracts')).toBeInTheDocument();
  });

  it('filters contracts by search term (name)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="public goods" />);
    expect(screen.getByText('Public Goods Vault')).toBeInTheDocument();
    expect(screen.queryByText('Cosmic Game')).not.toBeInTheDocument();
  });

  it('filters contracts by search term (address)', () => {
    render(<ContractAddressGrid {...defaultProps} searchTerm="0xDDD" />);
    expect(screen.getByText('Cosmic Signature NFT Anchoring Wallet')).toBeInTheDocument();
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
