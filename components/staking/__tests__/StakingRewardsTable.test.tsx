import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { render, screen, checkA11y } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

import { StakingRewardsTable } from '../StakingRewardsTable';

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

const createRow = (overrides = {}) => ({
  TokenId: 1,
  RewardCollectedEth: 0.123456,
  RewardToCollectEth: 0.654321,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('StakingRewardsTable', () => {
  it('renders empty state message', () => {
    render(<StakingRewardsTable list={[]} address={ADDRESS} />);
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders empty state for null list', () => {
    render(<StakingRewardsTable list={null as unknown as never[]} address={ADDRESS} />);
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<StakingRewardsTable list={[createRow()]} address={ADDRESS} />);
    for (const header of ['Token ID', 'Collected Rewards (ETH)', 'Rewards to Collect (ETH)']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data with toFixed(6) formatting', () => {
    render(<StakingRewardsTable list={[createRow()]} address={ADDRESS} />);
    expect(screen.getByText('0.123456')).toBeInTheDocument();
    expect(screen.getByText('0.654321')).toBeInTheDocument();
  });

  it('formats zero values correctly', () => {
    render(
      <StakingRewardsTable
        list={[createRow({ RewardCollectedEth: 0, RewardToCollectEth: 0 })]}
        address={ADDRESS}
      />,
    );
    const zeroCells = screen.getAllByText('0.000000');
    expect(zeroCells.length).toBeGreaterThanOrEqual(2);
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) => createRow({ TokenId: 100 + i }));
    render(<StakingRewardsTable list={list} address={ADDRESS} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('navigates to rewards-by-token page on row click', () => {
    render(<StakingRewardsTable list={[createRow({ TokenId: 42 })]} address={ADDRESS} />);
    const row = screen.getByText('42').closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith(`/rewards-by-token/${ADDRESS}/42`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StakingRewardsTable list={[]} address={ADDRESS} />);
    await checkA11y(container);
  });
});
