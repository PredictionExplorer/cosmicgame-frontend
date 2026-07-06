import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

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
    name: 'Cosmic Signature NFT',
    address: '0xBBB',
    description: 'NFT collection',
    category: 'core',
  },
  {
    name: 'Cosmic Signature CST Token',
    address: '0xCST',
    description: 'CST token',
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
    expect(screen.getByText('Cosmic Signature NFT')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature CST Token')).toBeInTheDocument();
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

  it('shows the Uniswap trade action only for the CST token contract', () => {
    render(<ContractAddressGrid {...defaultProps} />);

    const links = screen.getAllByRole('link', { name: 'Trade CST on Uniswap' });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
  });

  it('shows the marketplace action only for the Cosmic Signature NFT contract', () => {
    render(<ContractAddressGrid {...defaultProps} />);

    const links = screen.getAllByRole('link', { name: 'Axiom Zero NFT marketplace' });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContractAddressGrid {...defaultProps} />);
    await checkA11y(container);
  });
});
