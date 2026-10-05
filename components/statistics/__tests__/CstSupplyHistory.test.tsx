import { render, screen } from '@/test-utils';

import { CstSupplyHistory } from '../CstSupplyHistory';

const mockByDate = jest.fn();
const mockByGesture = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useCTTotalSupplyHistoryByDate: (...args: unknown[]) => mockByDate(...args),
  useCTTotalSupplyHistoryByBid: (...args: unknown[]) => mockByGesture(...args),
}));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const DAY = 86_400;
const T0 = Date.UTC(2026, 7, 1) / 1000;

const days = (supplies: number[]) =>
  supplies.map((supply, index) => ({
    Date: '',
    DateTime: '',
    TimeStamp: T0 + index * DAY,
    NumBids: 1,
    MintAmountEth: 1,
    BurnAmountEth: 0,
    AmountEth: 1,
    TotalSupplyEth: supply,
  }));

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockByGesture.mockReturnValue(ok([]));
});

describe('CstSupplyHistory', () => {
  it('draws a line with no fill when the axis does not start at zero', () => {
    // Regression: an area filled from 20,000 made small swings look large.
    mockByDate.mockReturnValue(ok(days([20_400, 21_100, 20_800, 21_600])));
    render(<CstSupplyHistory label="Supply" />);
    expect(screen.getByTestId('area-supply')).toHaveAttribute('data-fill', 'none');
  });

  it('fills the area when the axis starts at zero', () => {
    mockByDate.mockReturnValue(ok(days([0, 400, 900, 1_600])));
    render(<CstSupplyHistory label="Supply" />);
    expect(screen.getByTestId('area-supply').getAttribute('data-fill')).toMatch(/^url\(#supply-/);
  });
});
