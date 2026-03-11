import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { render, screen } from '@/test-utils';

// eslint-disable-next-line import/order
import StakingWinnerTable from '@/components/tables/StakingWinnerTable';

const createWinner = (overrides = {}) => ({
  EvtLogId: 1,
  RoundNum: 1,
  TokenId: 0,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  StakerNumStakedNFTs: 3,
  StakerAmountEth: 0.5,
  ...overrides,
});

describe('StakingWinnerTable', () => {
  it('renders custom empty message when list is empty', () => {
    render(<StakingWinnerTable list={[]} />);
    expect(
      screen.getByText(/There were no staked tokens at the time the round ended/),
    ).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<StakingWinnerTable list={[createWinner()]} />);
    expect(screen.getAllByText('Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Staker').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Number of NFTs').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Reward Amount (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as explorer link', () => {
    const winner = createWinner();
    render(<StakingWinnerTable list={[winner]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(winner.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders shortened staker address with link', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<StakingWinnerTable list={[createWinner({ StakerAddr: addr })]} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
    const addrLink = screen.getByText(shortenHex(addr, 6)).closest('a');
    expect(addrLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('renders NFT count and reward amount', () => {
    render(
      <StakingWinnerTable
        list={[createWinner({ StakerNumStakedNFTs: 5, StakerAmountEth: 1.2345 })]}
      />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1.2345')).toBeInTheDocument();
  });

  it('formats StakerAmountEth to 4 decimal places', () => {
    render(<StakingWinnerTable list={[createWinner({ StakerAmountEth: 0.1 })]} />);
    expect(screen.getByText('0.1000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createWinner({
        StakerAddr: `0x${String(i).padStart(40, '0')}`,
        StakerNumStakedNFTs: 100 + i,
      }),
    );
    render(<StakingWinnerTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });
});
