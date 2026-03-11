import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import type { DonatedNFT, DonatedERC20Token } from '@/services/api/types';

import { render, screen } from '@/test-utils';

jest.mock(
  '../../../components/donations/DonatedNFT',
  () =>
    function MockDonatedNFT({ nft }: { nft: { RecordId: number } }) {
      return <div data-testid="nft">{nft.RecordId}</div>;
    },
);
jest.mock(
  '../../../components/donations/DonatedERC20Table',
  () =>
    function MockDonatedERC20Table({ list }: { list: unknown[] }) {
      return <div data-testid="erc20-table">{list.length} tokens</div>;
    },
);
jest.mock('../../../components/common/CustomPagination', () => ({
  CustomPagination: () => <div data-testid="pagination" />,
}));

import { DonatedTokensSection } from '../DonatedTokensSection';

const createNFT = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  RecordId: 42,
  RoundNum: 1,
  DonorAddr: '0xdonor',
  TokenAddr: '0xtoken',
  ...overrides,
});

const defaultProps = {
  donatedNFTs: [] as DonatedNFT[],
  donatedERC20Tokens: [] as DonatedERC20Token[],
  donatedTokensTab: 0,
  onTabChange: jest.fn(),
  curPage: 1,
  setCurPage: jest.fn(),
  perPage: 12,
};

describe('DonatedTokensSection', () => {
  it('renders heading', () => {
    render(<DonatedTokensSection {...defaultProps} />);
    expect(screen.getByText('DONATED TOKENS FOR CURRENT ROUND')).toBeInTheDocument();
  });

  it('renders both tab labels', () => {
    render(<DonatedTokensSection {...defaultProps} />);
    expect(screen.getByText('ERC721 Tokens')).toBeInTheDocument();
    expect(screen.getByText('ERC20 Tokens')).toBeInTheDocument();
  });

  it('shows empty state for ERC721 when no NFTs', () => {
    render(<DonatedTokensSection {...defaultProps} donatedTokensTab={0} />);
    expect(screen.getByText('No ERC721 tokens were donated on this round.')).toBeInTheDocument();
  });

  it('renders NFT grid when NFTs are provided', () => {
    const nfts = [createNFT({ RecordId: 1 }), createNFT({ RecordId: 2, EvtLogId: 2 })];
    render(<DonatedTokensSection {...defaultProps} donatedNFTs={nfts} donatedTokensTab={0} />);
    const nftEls = screen.getAllByTestId('nft');
    expect(nftEls).toHaveLength(2);
    expect(nftEls[0]).toHaveTextContent('1');
    expect(nftEls[1]).toHaveTextContent('2');
  });

  it('renders pagination when NFTs exist', () => {
    render(
      <DonatedTokensSection {...defaultProps} donatedNFTs={[createNFT()]} donatedTokensTab={0} />,
    );
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('uses correct tab value prop', () => {
    const { container } = render(<DonatedTokensSection {...defaultProps} donatedTokensTab={1} />);
    expect(container.querySelector('[data-state="active"]')).toHaveTextContent('ERC20 Tokens');
  });

  it('renders DonatedERC20Table in second tab', () => {
    const tokens = [
      {
        RoundNum: 1,
        TokenAddr: '0x1',
        AmountDonatedEth: 1,
        AmountClaimedEth: 0,
        WinnerAddr: '0xw',
      },
    ];
    render(
      <DonatedTokensSection
        {...defaultProps}
        donatedERC20Tokens={tokens as DonatedERC20Token[]}
        donatedTokensTab={1}
      />,
    );
    expect(screen.getByTestId('erc20-table')).toHaveTextContent('1 tokens');
  });

  it('clicking ERC20 tab calls onTabChange with index 1', async () => {
    const user = userEvent.setup();
    render(<DonatedTokensSection {...defaultProps} donatedTokensTab={0} />);

    await user.click(screen.getByText('ERC20 Tokens'));

    expect(defaultProps.onTabChange).toHaveBeenCalled();
    const callArgs = defaultProps.onTabChange.mock.calls[0];
    expect(callArgs[1]).toBe(1);
  });

  it('clicking ERC721 tab calls onTabChange with index 0', async () => {
    const onTabChange = jest.fn();
    const user = userEvent.setup();
    render(
      <DonatedTokensSection {...defaultProps} donatedTokensTab={1} onTabChange={onTabChange} />,
    );

    await user.click(screen.getByText('ERC721 Tokens'));

    expect(onTabChange).toHaveBeenCalled();
    const callArgs = onTabChange.mock.calls[0];
    expect(callArgs[1]).toBe(0);
  });

  it('does not render pagination when no NFTs', () => {
    render(<DonatedTokensSection {...defaultProps} donatedNFTs={[]} donatedTokensTab={0} />);
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('does not render pagination in ERC20 tab', () => {
    render(
      <DonatedTokensSection {...defaultProps} donatedNFTs={[createNFT()]} donatedTokensTab={1} />,
    );
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('renders correct number of NFT cards for multiple NFTs', () => {
    const nfts = Array.from({ length: 5 }, (_, i) =>
      createNFT({ RecordId: i + 1, EvtLogId: i + 1 }),
    );
    render(<DonatedTokensSection {...defaultProps} donatedNFTs={nfts} donatedTokensTab={0} />);
    expect(screen.getAllByTestId('nft')).toHaveLength(5);
  });
});
