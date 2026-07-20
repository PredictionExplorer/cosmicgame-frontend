import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

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

import { RetrievedCSTAnchorDistributionsTable } from '../RetrievedCSTAnchorDistributionsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  DepositTimeStamp: 1701346718,
  DepositId: 5,
  RoundNum: 10,
  TokenId: 0,
  TotalDepositAmountEth: 1.234567,
  YourCollectedAmountEth: 0.567891,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('RetrievedCSTAnchorDistributionsTable', () => {
  it('renders empty state message', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[]} />);
    expect(screen.getByText('anchoring.common.empty.distributions')).toBeInTheDocument();
  });

  it('renders empty state for null list', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={null as unknown as never[]} />);
    expect(screen.getByText('anchoring.common.empty.distributions')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[createRow()]} />);
    for (const header of [
      'anchoring.tables.retrievedDistributions.columns.depositDatetime',
      'anchoring.tables.retrievedDistributions.columns.depositId',
      'anchoring.tables.retrievedDistributions.columns.cycle',
      'anchoring.tables.retrievedDistributions.columns.depositAmountEth',
      'anchoring.tables.retrievedDistributions.columns.retrievedAmountEth',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[createRow()]} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1701346718, false, 'en');
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 6 decimal places', () => {
    render(
      <RetrievedCSTAnchorDistributionsTable
        list={[createRow({ TotalDepositAmountEth: 1.5, YourCollectedAmountEth: 0.1 })]}
      />,
    );
    expect(screen.getByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.100000')).toBeInTheDocument();
  });

  it('renders round link', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[createRow({ RoundNum: 7 })]} />);
    const link = screen.getByText('7').closest('a');
    expect(link).toHaveAttribute('href', '/allocation/7');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, DepositId: 100 + i }),
    );
    render(<RetrievedCSTAnchorDistributionsTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RetrievedCSTAnchorDistributionsTable list={[]} />);
    await checkA11y(container);
  });
});
