import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

jest.mock('../../../hooks/useStellarSelectionWalletContract', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    read: { roundTimeoutTimesToWithdrawPrizes: jest.fn().mockResolvedValue(BigInt(0)) },
  })),
}));

// eslint-disable-next-line import/order
import StellarSelectionRecipientTable from '@/components/tables/StellarSelectionRecipientTable';

const createDeposit = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  WinnerAddr: '0x1111111111111111111111111111111111111111',
  RoundNum: 5,
  Amount: 0.5,
  IsStaker: false,
  IsRwalk: false,
  TokenId: null,
  Tx: { EvtLogId: 1 },
  ...overrides,
});

const createNFTRecipient = (overrides = {}) => ({
  EvtLogId: 100,
  TxHash: '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4',
  TimeStamp: 1701346718,
  WinnerAddr: '0x2222222222222222222222222222222222222222',
  RoundNum: 5,
  Amount: 0,
  IsStaker: true,
  IsRwalk: false,
  TokenId: 42,
  Tx: { EvtLogId: 100 },
  ...overrides,
});

describe('StellarSelectionRecipientTable', () => {
  it('renders empty state when no deposits or NFT recipients', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[createDeposit()]}
        RaffleNFTWinners={[]}
      />,
    );
    expect(screen.getByText('No recipients yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[createDeposit(), createDeposit({ EvtLogId: 2, Tx: { EvtLogId: 2 } })]}
        RaffleNFTWinners={[]}
      />,
    );
    expect(screen.getAllByText('Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Recipient').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Type').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "ETH Deposit" type for entries with Amount', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[
          createDeposit({ Amount: 1.0 }),
          createDeposit({ EvtLogId: 99, Tx: { EvtLogId: 99 } }),
        ]}
        RaffleNFTWinners={[]}
      />,
    );
    expect(screen.getAllByText('ETH Deposit').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Cosmic Signature Anchor Stellar Selection Token" for IsStaker && !IsRwalk', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[createDeposit()]}
        RaffleNFTWinners={[createNFTRecipient({ IsStaker: true, IsRwalk: false, Amount: 0 })]}
      />,
    );
    expect(
      screen.getAllByText('Cosmic Signature Anchor Stellar Selection Token').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows "Random Walk Anchor Stellar Selection Token" for IsStaker && IsRwalk', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[createDeposit()]}
        RaffleNFTWinners={[createNFTRecipient({ IsStaker: true, IsRwalk: true, Amount: 0 })]}
      />,
    );
    expect(
      screen.getAllByText('Random Walk Anchor Stellar Selection Token').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders TokenId as link to detail page', () => {
    render(
      <StellarSelectionRecipientTable
        RaffleETHDeposits={[createDeposit()]}
        RaffleNFTWinners={[createNFTRecipient({ TokenId: 42 })]}
      />,
    );
    const tokenLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/detail/42');
    expect(tokenLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('excludes last ETH deposit (depositsExcludingLast)', () => {
    const deposits = [
      createDeposit({ EvtLogId: 1, Tx: { EvtLogId: 1 }, Amount: 0.5 }),
      createDeposit({ EvtLogId: 2, Tx: { EvtLogId: 2 }, Amount: 0.3 }),
    ];
    render(<StellarSelectionRecipientTable RaffleETHDeposits={deposits} RaffleNFTWinners={[]} />);
    expect(screen.getByText('0.5000 ETH')).toBeInTheDocument();
    expect(screen.queryByText('0.3000 ETH')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StellarSelectionRecipientTable RaffleETHDeposits={[]} RaffleNFTWinners={[]} />,
    );
    await checkA11y(container);
  });
});
