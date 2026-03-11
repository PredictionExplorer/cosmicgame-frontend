import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { render, screen } from '@/test-utils';

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser123' }),
}));

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get_info: jest.fn().mockResolvedValue({ CurName: 'Token Name' }),
    get_name_history: jest.fn().mockResolvedValue([]),
    get_staking_rewards_by_user: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: function MockNFTImage({ src }: { src: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="nft" data-testid="nft-image" />;
  },
}));

 
import { StakedTokensTable } from '../StakedTokensTable';

const mockUnstake = jest.fn().mockResolvedValue(undefined);
const mockUnstakeMany = jest.fn().mockResolvedValue(undefined);

const createRWLKRow = (overrides = {}) => ({
  StakeActionId: 1,
  StakedTokenId: 42,
  StakeTimeStamp: 1701346718,
  ...overrides,
});

const createCSTRow = (
  overrides: {
    TokenInfo?: Partial<{ TokenId: number; Seed: number; StakeActionId: number }>;
    StakeTimeStamp?: number;
  } = {},
) => ({
  TokenInfo: {
    TokenId: 99,
    Seed: 123,
    StakeActionId: 10,
    ...overrides.TokenInfo,
  },
  StakeTimeStamp: overrides.StakeTimeStamp ?? 1701346718,
});

beforeEach(() => jest.clearAllMocks());

describe('StakedTokensTable', () => {
  it('renders empty state message', () => {
    render(
      <StakedTokensTable
        list={[]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={false}
      />,
    );
    expect(screen.getByText('No tokens yet.')).toBeInTheDocument();
  });

  it('renders table headers for RWLK', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    for (const header of ['Token Image', 'Token ID', 'Stake Action ID', 'Stake Datetime']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders table headers including Accumulated Rewards for CST', () => {
    render(
      <StakedTokensTable
        list={[createCSTRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={false}
      />,
    );
    expect(screen.getAllByText('Accumulated Rewards').length).toBeGreaterThanOrEqual(1);
  });

  it('does not show Accumulated Rewards header for RWLK', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    expect(screen.queryByText('Accumulated Rewards')).not.toBeInTheDocument();
  });

  it('renders RWLK row data', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow({ StakedTokenId: 55, StakeActionId: 7 })]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    expect(screen.getAllByText('55').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CST row data', () => {
    render(
      <StakedTokensTable
        list={[createCSTRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={false}
      />,
    );
    expect(screen.getAllByText('99').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Unstake button in each row', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    expect(screen.getAllByText('Unstake').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRWLKRow({
        StakeActionId: 100 + i,
        StakedTokenId: 200 + i,
        StakeTimeStamp: 1701346718 + i,
      }),
    );
    render(
      <StakedTokensTable
        list={list}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    expect(screen.getByText('204')).toBeInTheDocument();
    expect(screen.queryByText('205')).not.toBeInTheDocument();
  });

  it('calls handleUnstake on Unstake button click', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow({ StakeActionId: 42 })]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    fireEvent.click(screen.getAllByText('Unstake')[0]!);
    expect(mockUnstake).toHaveBeenCalledWith(42, true);
  });

  it('renders checkbox for row selection', () => {
    render(
      <StakedTokensTable
        list={[createRWLKRow()]}
        handleUnstake={mockUnstake}
        handleUnstakeMany={mockUnstakeMany}
        IsRwalk={true}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });
});
