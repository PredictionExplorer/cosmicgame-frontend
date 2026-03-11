import '@testing-library/jest-dom';

import type { CSTTokenInfo } from '@/services/api/types';

import { render, screen } from '@/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

 
import { CSTokensTable } from '../CSTokensTable';

const createToken = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc123',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  TokenId: 1,
  TokenName: 'CosmicToken',
  RoundNum: 5,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  Staked: false,
  ...overrides,
});

const defaultProps = {
  list: [] as (CSTTokenInfo & { Staked?: boolean })[],
  handleStake: jest.fn().mockResolvedValue(undefined),
  handleStakeMany: jest.fn().mockResolvedValue(undefined),
};

describe('CSTokensTable', () => {
  it('renders empty state when list is empty', () => {
    render(<CSTokensTable {...defaultProps} />);
    expect(screen.getByText('No available tokens.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CSTokensTable {...defaultProps} list={[createToken()]} />);
    for (const header of ['Mint Datetime', 'Token ID', 'Token Name', 'Round', 'Winner Address']) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders token data', () => {
    const token = createToken({ TokenId: 42, TokenName: 'MyCST', RoundNum: 7 });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('MyCST').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);
  });

  it('displays token name or space when empty', () => {
    const token = createToken({ TokenName: '' });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.queryByText('CosmicToken')).not.toBeInTheDocument();
  });

  it('renders Stake button for unstaked tokens', () => {
    const token = createToken({ Staked: false });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.getByText('Stake')).toBeInTheDocument();
  });

  it('does not render Stake button for staked tokens', () => {
    const token = createToken({ Staked: true });
    render(<CSTokensTable {...defaultProps} list={[token]} />);
    expect(screen.queryByText('Stake')).not.toBeInTheDocument();
  });

  it('paginates with perPage=5', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createToken({ TokenId: i + 1, EvtLogId: i + 1 }),
    );
    render(<CSTokensTable {...defaultProps} list={list} />);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });
});
