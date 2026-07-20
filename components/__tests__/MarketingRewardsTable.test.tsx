import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import MarketingRewardsTable from '@/components/tables/MarketingRewardsTable';
import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

const mockConvertTimestampToDateTime = jest.fn();
jest.mock('@/utils', () => {
  const actual = jest.requireActual<typeof import('@/utils')>('@/utils');
  return {
    ...actual,
    convertTimestampToDateTime: (timestamp: number, showSecond?: boolean, locale?: string) => {
      mockConvertTimestampToDateTime(timestamp, showSecond, locale);
      return actual.convertTimestampToDateTime(timestamp, showSecond, locale);
    },
  };
});

const createReward = (overrides: Partial<MarketingReward> = {}): MarketingReward => ({
  EvtLogId: 1,
  BlockNum: 100000,
  TxId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30T12:18:38Z',
  MarketerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 25.5,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('MarketingRewardsTable', () => {
  it('renders "No allocations yet." when list is empty', () => {
    render(<MarketingRewardsTable list={[]} />);
    expect(screen.getByText('tables.empty.allocations')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<MarketingRewardsTable list={[createReward()]} />);
    const headers = screen.getAllByText('tables.columns.datetime');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as link', () => {
    const reward = createReward();
    render(<MarketingRewardsTable list={[reward]} />);
    expect(screen.getByText(convertTimestampToDateTime(reward.TimeStamp))).toBeInTheDocument();
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(reward.TimeStamp, false, 'en');
  });

  it('renders amount', () => {
    render(<MarketingRewardsTable list={[createReward({ AmountEth: 25.5 })]} />);
    expect(screen.getByText('25.50')).toBeInTheDocument();
  });

  it('sets target="_blank" on datetime link', () => {
    const reward = createReward();
    render(<MarketingRewardsTable list={[reward]} />);
    const link = screen.getByText(convertTimestampToDateTime(reward.TimeStamp));
    expect(link.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<MarketingRewardsTable list={[createReward()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders multiple rewards', () => {
    const rewards = [
      createReward({ EvtLogId: 1, AmountEth: 10 }),
      createReward({ EvtLogId: 2, AmountEth: 20 }),
    ];
    render(<MarketingRewardsTable list={rewards} />);
    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('20.00')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MarketingRewardsTable list={[]} />);
    await checkA11y(container);
  });
});
