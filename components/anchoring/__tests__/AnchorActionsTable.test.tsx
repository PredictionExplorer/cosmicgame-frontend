import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

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

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

import AnchorActionsTable from '../AnchorActionsTable';

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

describe('AnchorActionsTable', () => {
  it('renders empty state message', () => {
    render(<AnchorActionsTable list={[]} IsRwalk={false} />);
    expect(screen.getByText('anchoring.common.empty.actions')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<AnchorActionsTable list={[createRow()]} IsRwalk={false} />);
    for (const header of [
      'anchoring.tables.anchorActions.columns.datetime',
      'anchoring.tables.anchorActions.columns.type',
      'anchoring.tables.anchorActions.columns.tokenId',
      'anchoring.tables.anchorActions.columns.nftCount',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<AnchorActionsTable list={[createRow()]} IsRwalk={false} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1701346718, false, 'en');
    expect(screen.getAllByText('anchoring.common.anchor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Unstake for ActionType 1', () => {
    render(<AnchorActionsTable list={[createRow({ ActionType: 1 })]} IsRwalk={false} />);
    expect(screen.getAllByText('anchoring.common.release').length).toBeGreaterThanOrEqual(1);
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, ActionId: i, NumStakedNFTs: 100 + i }),
    );
    render(<AnchorActionsTable list={list} IsRwalk={false} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('navigates to anchor action on row click (CST)', () => {
    render(<AnchorActionsTable list={[createRow({ ActionId: 7 })]} IsRwalk={false} />);
    const row = screen.getAllByText('anchoring.common.anchor')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/anchor-action/0/7');
  });

  it('navigates with IsRwalk=1 flag on row click', () => {
    render(<AnchorActionsTable list={[createRow({ ActionId: 3 })]} IsRwalk={true} />);
    const row = screen.getAllByText('anchoring.common.anchor')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/anchor-action/1/3');
  });

  it('renders RWLK token link when IsRwalk', () => {
    render(<AnchorActionsTable list={[createRow({ TokenId: 99 })]} IsRwalk={true} />);
    const link = screen.getByText('99').closest('a');
    expect(link).toHaveAttribute('href', 'https://randomwalknft.com/detail/99');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchorActionsTable list={[]} IsRwalk={false} />);
    await checkA11y(container);
  });
});
