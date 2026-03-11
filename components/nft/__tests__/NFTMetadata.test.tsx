import { render, screen, checkA11y } from '@/test-utils';

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
}));

const fullNft: NFTMetadataProps['nft'] = {
  TimeStamp: 1700000000,
  TxHash: '0xABC',
  WinnerAddr: '0xWinner',
  CurOwnerAddr: '0xOwner',
  Seed: 'deadbeef',
  RecordType: 3,
  RoundNum: 42,
  Staked: false,
  WasUnstaked: false,
};

describe('NFTMetadata', () => {
  it('renders minted date with explorer link', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText('date-1700000000')).toBeInTheDocument();
    const link = screen.getByText('date-1700000000').closest('a');
    expect(link).toHaveAttribute('href', 'https://explorer/tx/0xABC');
  });

  it('renders winner and owner addresses', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText('0xWinner')).toBeInTheDocument();
    expect(screen.getByText('0xOwner')).toBeInTheDocument();
  });

  it('renders seed value', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText('deadbeef')).toBeInTheDocument();
  });

  it('renders "Round Winner" for RecordType 3', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText(/Round Winner/)).toBeInTheDocument();
    expect(screen.getByText('Round #42')).toBeInTheDocument();
  });

  it('renders "Raffle Winner" for RecordType 1', () => {
    render(<NFTMetadata nft={{ ...fullNft, RecordType: 1 }} />);
    expect(screen.getByText('Raffle Winner')).toBeInTheDocument();
  });

  it('renders "Staking Winner" for RecordType 2', () => {
    render(<NFTMetadata nft={{ ...fullNft, RecordType: 2 }} />);
    expect(screen.getByText('Staking Winner')).toBeInTheDocument();
  });

  it('renders staking eligibility when not staked', () => {
    render(<NFTMetadata nft={fullNft} />);
    expect(screen.getByText('The token is eligible for staking.')).toBeInTheDocument();
  });

  it('renders staking ineligibility when already staked', () => {
    render(<NFTMetadata nft={{ ...fullNft, Staked: true }} />);
    expect(
      screen.getByText('The token has already been staked and cannot be staked again.'),
    ).toBeInTheDocument();
  });

  it('hides minted date when TimeStamp is absent', () => {
    render(<NFTMetadata nft={{ ...fullNft, TimeStamp: undefined }} />);
    expect(screen.queryByText(/Minted Date/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTMetadata nft={fullNft} />);
    await checkA11y(container);
  });
});
