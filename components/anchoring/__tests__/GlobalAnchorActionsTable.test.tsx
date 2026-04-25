import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

import { GlobalAnchorActionsTable } from '../GlobalAnchorActionsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  ActionId: 10,
  TimeStamp: 1701346718,
  ActionType: 0,
  TokenId: 42,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakedNFTs: 5,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('GlobalAnchorActionsTable', () => {
  it('renders empty state message', () => {
    render(<GlobalAnchorActionsTable list={[]} IsRWLK={false} />);
    expect(screen.getByText('No actions yet.')).toBeInTheDocument();
  });

  it('renders empty state for null list', () => {
    render(<GlobalAnchorActionsTable list={null as unknown as never[]} IsRWLK={false} />);
    expect(screen.getByText('No actions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalAnchorActionsTable list={[createRow()]} IsRWLK={false} />);
    for (const header of [
      'Anchor Datetime',
      'Action Type',
      'Token ID',
      'Anchor-holder Address',
      'Number of NFTs',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<GlobalAnchorActionsTable list={[createRow()]} IsRWLK={false} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Anchor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Unstake for ActionType 1', () => {
    render(<GlobalAnchorActionsTable list={[createRow({ ActionType: 1 })]} IsRWLK={false} />);
    expect(screen.getAllByText('Release').length).toBeGreaterThanOrEqual(1);
  });

  it('shows shortened anchorHolder address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<GlobalAnchorActionsTable list={[createRow({ StakerAddr: addr })]} IsRWLK={false} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, ActionId: i, NumStakedNFTs: 100 + i }),
    );
    render(<GlobalAnchorActionsTable list={list} IsRWLK={false} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('navigates to anchor action page on row click', () => {
    render(<GlobalAnchorActionsTable list={[createRow({ ActionId: 7 })]} IsRWLK={false} />);
    const row = screen.getAllByText('Anchor')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/anchor-action/0/7');
  });

  it('uses RWLK flag in navigation', () => {
    render(<GlobalAnchorActionsTable list={[createRow({ ActionId: 3 })]} IsRWLK={true} />);
    const row = screen.getAllByText('Anchor')[0]!.closest('tr');
    fireEvent.click(row!);
    expect(mockPush).toHaveBeenCalledWith('/anchor-action/1/3');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchorActionsTable list={[]} IsRWLK={false} />);
    await checkA11y(container);
  });
});
