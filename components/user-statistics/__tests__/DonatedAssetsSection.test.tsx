import { render, screen, checkA11y } from '@/test-utils';

import { DonatedAssetsSection, type DonatedAssetsSectionProps } from '../DonatedAssetsSection';

jest.mock('../../donations/DonatedNFTTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="donated-nft-table">nfts: {list.length}</div>
  ),
}));
jest.mock('../../donations/DonatedERC20Table', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="donated-erc20-table">tokens: {list.length}</div>
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
    expect(screen.getByText('Donated NFTs User Won')).toBeInTheDocument();
    expect(screen.getByText('Donated ERC20 Tokens')).toBeInTheDocument();
  });

  it('shows NFT loading state', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingNFTs={true} />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('shows ERC20 loading state', () => {
    render(<DonatedAssetsSection {...defaultProps} loadingERC20={true} />);
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders Claim All button when unclaimed NFTs exist', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} />);
    expect(screen.getByText('Claim All')).toBeInTheDocument();
  });

  it('hides Claim All when canClaim is false', () => {
    const nft = {
      Index: 0,
      RecordId: '1',
    } as unknown as DonatedAssetsSectionProps['unclaimedNFTs'][0];
    render(<DonatedAssetsSection {...defaultProps} unclaimedNFTs={[nft]} canClaim={false} />);
    expect(screen.queryByText('Claim All')).not.toBeInTheDocument();
  });

  it('renders tables with combined NFT data', () => {
    render(<DonatedAssetsSection {...defaultProps} />);
    expect(screen.getByTestId('donated-nft-table')).toHaveTextContent('nfts: 0');
    expect(screen.getByTestId('donated-erc20-table')).toHaveTextContent('tokens: 0');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedAssetsSection {...defaultProps} />);
    await checkA11y(container);
  });
});
