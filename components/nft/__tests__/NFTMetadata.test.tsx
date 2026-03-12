import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { NFTMetadata, type NFTMetadataProps } from '../NFTMetadata';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
  getRelativeTime: (ts: number) => `rel-${ts}`,
  shortenHex: (hex: string, length: number) =>
    hex ? `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}` : '',
}));

const fullNft: NFTMetadataProps['nft'] = {
  TimeStamp: 1700000000,
  TxHash: '0xABC',
  WinnerAddr: '0xWinnerAddress1234567890abcdef',
  CurOwnerAddr: '0xOwnerAddress1234567890abcdef',
  Seed: 'deadbeef',
  RecordType: 3,
  RoundNum: 42,
  Staked: false,
  WasUnstaked: false,
};

describe('NFTMetadata', () => {
  it('renders the metadata container', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByTestId('nft-metadata')).toBeInTheDocument();
  });

  it('renders minted date stat card with explorer link', () => {
    render(<NFTMetadata nft={fullNft} />);
    const mintedLink = screen.getByText(/rel-1700000000/);
    expect(mintedLink).toBeInTheDocument();
    const anchor = mintedLink.closest('a');
    expect(anchor).toHaveAttribute('href', 'https://explorer/tx/0xABC');
  });

  it('renders round stat card with link', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText('Round #42')).toBeInTheDocument();
    const link = screen.getByText('Round #42').closest('a');
    expect(link).toHaveAttribute('href', '/prize/42');
  });

  it('renders seed value', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByTestId('seed-value')).toHaveTextContent('deadbeef');
  });

  it('renders copy seed button', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByTestId('copy-seed-button')).toBeInTheDocument();
  });

  it('copies seed to clipboard when copy button is clicked', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    render(<NFTMetadata nft={fullNft} />);
    fireEvent.click(screen.getByTestId('copy-seed-button'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('deadbeef');
  });

  it('renders dash for minted when no TimeStamp', () => {
    render(<NFTMetadata nft={{ ...fullNft, TimeStamp: undefined }} />);
    expect(screen.getByText('Minted').closest('[class]')).toBeInTheDocument();
  });

  it('handles null nft gracefully', () => {
    render(<NFTMetadata nft={null} />);
    expect(screen.getByTestId('nft-metadata')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTMetadata nft={fullNft} />);
    await checkA11y(container);
  });
});
