import { render, screen, checkA11y } from '@/test-utils';

import { DonatedAssetsSection, type DonatedAssetsSectionProps } from '../DonatedAssetsSection';

jest.mock('../../attachments/AttachedNFTTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="attached-nft-table">nfts: {list.length}</div>
  ),
}));
jest.mock('../../attachments/AttachedERC20Table', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="attached-erc20-table">tokens: {list.length}</div>
  ),
}));

const noop = () => {};

const defaultProps: DonatedAssetsSectionProps = {
  unclaimedNFTs: [],
  claimedNFTs: [],
  donatedERC20: [],
  loadingNFTs: false,
  loadingERC20: false,
  canClaim: true,
  isClaiming: false,
  claimingDonatedNFTs: [],
  onClaimNFT: noop,
  onClaimAllNFTs: noop,
  onClaimERC20: noop,
  onClaimAllERC20: noop,
};

describe('DonatedAssetsSection', () => {
  it('renders both section headings', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(screen.getByText('Attached NFTs Received')).toBeInTheDocument();
    expect(screen.getByText('Attached ERC20 Tokens')).toBeInTheDocument();
  });

  it('shows skeleton loading for NFTs', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingNFTs={true} />);
    expect(screen.getAllByTestId('table-skeleton').length).toBeGreaterThan(0);
  });

  it('shows skeleton loading for ERC20', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingERC20={true} />);
    expect(screen.getAllByTestId('table-skeleton').length).toBeGreaterThan(0);
  });

  it('shows empty state when no attached NFTs', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(screen.getByText('No attached NFTs')).toBeInTheDocument();
  });

  it('shows empty state when no attached ERC20 tokens', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(screen.getByText('No attached tokens')).toBeInTheDocument();
  });

  it('renders Claim All NFTs button when unclaimed NFTs exist', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(screen.getByText('Claim All NFTs')).toBeInTheDocument();
  });

  it('renders unclaimed badge for NFTs', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(screen.getByText('1 unclaimed')).toBeInTheDocument();
  });

  it('renders Claim All Tokens button when unclaimed ERC20 exist', () => {
    const token = {
      RoundNum: 1,
      TokenAddr: '0x123',
      AmountDonatedEth: '1.0',
      Claimed: false,
    } as unknown as DonatedAssetsSectionProps['donatedERC20'][0];
    render(<DonatedAssetsSection {...defaultProps} donatedERC20={[token]} />);
    expect(screen.getByText('Claim All Tokens')).toBeInTheDocument();
  });

  it('hides claim buttons when canClaim is false', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} canClaim={false} />);
    expect(screen.queryByText('Claim All NFTs')).not.toBeInTheDocument();
  });

  it('renders tables with combined NFT data', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(screen.getByTestId('attached-nft-table')).toHaveTextContent('nfts: 1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedAssetsSection {...defaultProps} />);
    await checkA11y(container);
  });
});
