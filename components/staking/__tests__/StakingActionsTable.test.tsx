import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

import StakingActionsTable from '../StakingActionsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  ActionId: 10,
  ActionType: 0,
  TokenAddr: '0x0000000000000000000000000000000000000000',
  TokenId: 42,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakedNFTs: 5,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('StakingActionsTable', () => {
  it('renders empty state message', () => {
    render(<StakingActionsTable list={[]} IsRwalk={false} />);
    expect(screen.getByText('No actions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<StakingActionsTable list={[createRow()]} IsRwalk={false} />);
    for (const header of ['Stake Datetime', 'Action Type', 'Token ID', 'Number of NFTs']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<StakingActionsTable list={[createRow()]} IsRwalk={false} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Stake').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Unstake for ActionType 1', () => {
    render(<StakingActionsTable list={[createRow({ ActionType: 1 })]} IsRwalk={false} />);
    expect(screen.getAllByText('Unstake').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, ActionId: i, NumStakedNFTs: 100 + i }),
    );
    render(<StakingActionsTable list={list} IsRwalk={false} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('navigates to staking action on row click (CST)', () => {
    render(<StakingActionsTable list={[createRow({ ActionId: 7 })]} IsRwalk={false} />);
    const row = screen.getAllByText('Stake')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/staking-action/0/7');
  });

  it('navigates with IsRwalk=1 flag on row click', () => {
    render(<StakingActionsTable list={[createRow({ ActionId: 3 })]} IsRwalk={true} />);
    const row = screen.getAllByText('Stake')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/staking-action/1/3');
  });

  it('renders RWLK token link when IsRwalk', () => {
    render(<StakingActionsTable list={[createRow({ TokenId: 99 })]} IsRwalk={true} />);
    const link = screen.getByText('99').closest('a');
    expect(link).toHaveAttribute('href', 'https://randomwalknft.com/detail/99');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StakingActionsTable list={[]} IsRwalk={false} />);
    await checkA11y(container);
  });
});
