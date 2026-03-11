import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen } from '@/test-utils';

import { GlobalStakedTokensTable } from '../GlobalStakedTokensTable';

const createRow = (overrides = {}) => ({
  StakeEvtLogId: 1,
  StakeTimeStamp: 1701346718,
  StakeActionId: 10,
  StakedTokenId: 42,
  UserAddr: '0x1234567890abcdef1234567890abcdef12345678',
  TokenInfo: { TokenId: 99 },
  ...overrides,
});

describe('GlobalStakedTokensTable', () => {
  it('renders empty state message', () => {
    render(<GlobalStakedTokensTable list={[]} IsRWLK={false} />);
    expect(screen.getByText('No tokens yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalStakedTokensTable list={[createRow()]} IsRWLK={false} />);
    for (const header of ['Stake Datetime', 'Action ID', 'Token ID', 'Staker Address']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', () => {
    render(<GlobalStakedTokensTable list={[createRow()]} IsRWLK={false} />);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CST token link for non-RWLK', () => {
    render(<GlobalStakedTokensTable list={[createRow()]} IsRWLK={false} />);
    const tokenLink = screen.getByText('99').closest('a');
    expect(tokenLink).toHaveAttribute('href', '/detail/99');
  });

  it('renders RWLK token link when IsRWLK is true', () => {
    render(<GlobalStakedTokensTable list={[createRow({ StakedTokenId: 55 })]} IsRWLK={true} />);
    const link = screen.getByText('55').closest('a');
    expect(link).toHaveAttribute('href', 'https://randomwalknft.com/detail/55');
  });

  it('renders action ID as link', () => {
    render(<GlobalStakedTokensTable list={[createRow({ StakeActionId: 20 })]} IsRWLK={false} />);
    const link = screen.getByText('20').closest('a');
    expect(link).toHaveAttribute('href', '/staking-action/0/20');
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ StakeEvtLogId: i, StakeActionId: 100 + i }),
    );
    render(<GlobalStakedTokensTable list={list} IsRWLK={false} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });
});
