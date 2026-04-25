import '@testing-library/jest-dom';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('../../../hooks/useStellarSelectionWalletContract', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: { get_current_time: jest.fn().mockResolvedValue(1700000000) },
}));

import DonatedERC20Table from '../AttachedERC20Table';

const createToken = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  RoundNum: 1,
  TokenAddr: '0xTokenAddr1234567890abcdef1234567890abcdef',
  AmountDonatedEth: 5.25,
  AmountClaimedEth: 1.5,
  WinnerAddr: '0xWinnerAddr1234567890abcdef1234567890abcdef',
  Claimed: false,
  DonateClaimDiffEth: '3.75',
  ...overrides,
});

describe('DonatedERC20Table', () => {
  it('renders empty state when list is empty', () => {
    render(<DonatedERC20Table list={[]} handleClaim={null} />);
    expect(screen.getByText('No attached ERC20 tokens yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<DonatedERC20Table list={[createToken()]} handleClaim={null} />);
    for (const header of [
      'Datetime',
      'Cycle #',
      'Token Address',
      'Attached Amount',
      'Retrieved Amount',
      'Recipient',
      'Retrieved',
      'Expiration Date',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders token data', () => {
    render(<DonatedERC20Table list={[createToken()]} handleClaim={null} />);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5.25')).toBeInTheDocument();
    expect(screen.getByText('1.50')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows Yes for claimed tokens', () => {
    render(<DonatedERC20Table list={[createToken({ Claimed: true })]} handleClaim={null} />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('does not render extra column when handleClaim is null', () => {
    render(<DonatedERC20Table list={[createToken()]} handleClaim={null} />);
    expect(screen.queryByTestId('Claim Button')).not.toBeInTheDocument();
  });

  it('paginates with perPage=5', () => {
    const list = Array.from({ length: 7 }, (_, i) =>
      createToken({ EvtLogId: i + 1, RoundNum: i + 1 }),
    );
    render(<DonatedERC20Table list={list} handleClaim={null} />);
    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedERC20Table list={[]} handleClaim={null} />);
    await checkA11y(container);
  });
});
