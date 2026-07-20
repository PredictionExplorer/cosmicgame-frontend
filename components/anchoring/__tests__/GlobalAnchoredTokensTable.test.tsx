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

import { GlobalAnchoredTokensTable } from '../GlobalAnchoredTokensTable';

const createRow = (overrides = {}) => ({
  StakeEvtLogId: 1,
  StakeTimeStamp: 1701346718,
  StakeActionId: 10,
  StakedTokenId: 42,
  UserAddr: '0x1234567890abcdef1234567890abcdef12345678',
  TokenInfo: { TokenId: 99 },
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('GlobalAnchoredTokensTable', () => {
  it('renders empty state message', () => {
    render(<GlobalAnchoredTokensTable list={[]} IsRWLK={false} />);
    expect(screen.getByText('anchoring.common.empty.tokens')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalAnchoredTokensTable list={[createRow()]} IsRWLK={false} />);
    for (const header of [
      'anchoring.tables.globalAnchoredTokens.headers.anchorDatetime.desktop',
      'anchoring.tables.globalAnchoredTokens.headers.actionId.desktop',
      'anchoring.tables.globalAnchoredTokens.headers.tokenId.desktop',
      'anchoring.tables.globalAnchoredTokens.headers.holderAddress.desktop',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<GlobalAnchoredTokensTable list={[createRow()]} IsRWLK={false} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1701346718, false, 'en');
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CST token link for non-RWLK', () => {
    render(<GlobalAnchoredTokensTable list={[createRow()]} IsRWLK={false} />);
    const tokenLink = screen.getByText('99').closest('a');
    expect(tokenLink).toHaveAttribute('href', '/detail/99');
  });

  it('renders RWLK token link when IsRWLK is true', () => {
    render(<GlobalAnchoredTokensTable list={[createRow({ StakedTokenId: 55 })]} IsRWLK={true} />);
    const link = screen.getByText('55').closest('a');
    expect(link).toHaveAttribute('href', 'https://randomwalknft.com/detail/55');
  });

  it('renders action ID as link', () => {
    render(<GlobalAnchoredTokensTable list={[createRow({ StakeActionId: 20 })]} IsRWLK={false} />);
    const link = screen.getByText('20').closest('a');
    expect(link).toHaveAttribute('href', '/anchor-action/0/20');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ StakeEvtLogId: i, StakeActionId: 100 + i }),
    );
    render(<GlobalAnchoredTokensTable list={list} IsRWLK={false} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchoredTokensTable list={[]} IsRWLK={false} />);
    await checkA11y(container);
  });
});
