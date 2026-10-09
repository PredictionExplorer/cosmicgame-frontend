import { checkA11y, render, screen, within } from '@/test-utils';

import DonatedERC20Table from '../AttachedERC20Table';
import { attachedErc20Amount } from '../attachedErc20Amount';

const mockMetadata = jest.fn();
jest.mock('../useAttachedErc20Metadata', () => ({
  useAttachedErc20Metadata: (address: string) => mockMetadata(address),
}));

const TOKEN = '0x1111111111111111111111111111111111111111';
const RECIPIENT = '0x2222222222222222222222222222222222222222';

const createToken = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 1700000000,
  DateTime: '2023-11-14',
  RoundNum: 1,
  TokenAddr: TOKEN,
  AmountDonatedEth: 5.25,
  AmountClaimedEth: 1.5,
  WinnerAddr: RECIPIENT,
  Claimed: false,
  DonateClaimDiff: '3750000000000000000',
  DonateClaimDiffEth: '3.75',
  ...overrides,
});

const table = () => screen.getAllByRole('table')[0]!;

beforeEach(() => {
  jest.clearAllMocks();
  mockMetadata.mockReturnValue({ data: { symbol: 'GLXY', decimals: 18 } });
});

describe('attachedErc20Amount', () => {
  it('adds what was retrieved to what is still held in a Recipient read', () => {
    // The production record of a retrieved ARB attachment: 0 held, 2,000 retrieved.
    expect(
      attachedErc20Amount({ AmountDonated: '0', AmountDonatedEth: 0, AmountClaimedEth: 2000 }),
    ).toBe(2000);
    expect(
      attachedErc20Amount({
        AmountDonated: '2000000000000000000000',
        AmountDonatedEth: 2000,
        AmountClaimedEth: 0,
      }),
    ).toBe(2000);
  });

  it('reads the attached amount itself from a cycle read', () => {
    expect(
      attachedErc20Amount({ AmountEth: 2000, AmountDonatedEth: 2000, AmountClaimedEth: 0 }),
    ).toBe(2000);
  });

  it('falls back to base units when a read carries no display figures', () => {
    expect(attachedErc20Amount({ Amount: '2500000' }, 6)).toBe(2.5);
    expect(
      attachedErc20Amount({ AmountDonated: '0', AmountClaimed: '2000000000000000000000' }),
    ).toBe(2000);
  });

  it('is unknown when the read reports no amount', () => {
    expect(
      attachedErc20Amount({
        AmountDonatedEth: undefined as unknown as number,
        AmountClaimedEth: 0,
      }),
    ).toBeNull();
  });
});

describe('DonatedERC20Table', () => {
  it('says there is nothing attached instead of an empty ledger', () => {
    render(<DonatedERC20Table list={[]} />);
    expect(screen.getByText('tables.attachedAssets.erc20.empty')).toBeInTheDocument();
  });

  it('labels every column', () => {
    render(<DonatedERC20Table list={[createToken()]} />);
    for (const header of [
      'tables.attachedAssets.erc20.columns.datetime',
      'tables.attachedAssets.erc20.columns.cycle',
      'tables.attachedAssets.erc20.columns.tokenAddress',
      'tables.attachedAssets.erc20.columns.attachedAmount',
      'tables.attachedAssets.erc20.columns.retrievedAmount',
      'tables.attachedAssets.erc20.columns.recipient',
      'tables.attachedAssets.erc20.columns.retrieved',
    ]) {
      expect(within(table()).getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('names the token by its symbol, linked to its contract, and formats the amounts', () => {
    render(<DonatedERC20Table list={[createToken({ AmountEth: 5.25 })]} />);
    expect(within(table()).getByRole('link', { name: /GLXY/ })).toHaveAttribute(
      'href',
      expect.stringContaining(TOKEN),
    );
    expect(within(table()).getByText('5.25')).toBeInTheDocument();
    expect(within(table()).getByText('1.5')).toBeInTheDocument();
    expect(within(table()).getByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/allocation/1',
    );
    expect(within(table()).getByText('tables.attachedAssets.status.no')).toBeInTheDocument();
  });

  it('falls back to the short contract address without a symbol', () => {
    mockMetadata.mockReturnValue({ data: null });
    render(<DonatedERC20Table list={[createToken()]} />);
    expect(within(table()).getByRole('link', { name: /0x1111/ })).toBeInTheDocument();
  });

  it('shows an unknown amount as unavailable, never as 0', () => {
    render(<DonatedERC20Table list={[createToken({ AmountDonatedEth: undefined })]} />);
    expect(within(table()).getAllByText('tables.status.unavailable').length).toBeGreaterThan(0);
  });

  it('shows what a retrieved attachment was, not the 0 still held', () => {
    render(
      <DonatedERC20Table
        list={[
          createToken({
            AmountDonated: '0',
            AmountDonatedEth: 0,
            AmountClaimedEth: 2000,
            Claimed: true,
          }),
        ]}
      />,
    );
    // Attached and retrieved both read 2,000.
    expect(within(table()).getAllByText('2,000')).toHaveLength(2);
  });

  it('marks a retrieved token', () => {
    render(<DonatedERC20Table list={[createToken({ Claimed: true })]} />);
    expect(within(table()).getByText('tables.attachedAssets.status.yes')).toBeInTheDocument();
  });

  it('is read-only: retrieving lives in the winnings retrieval ledger', () => {
    render(<DonatedERC20Table list={[createToken()]} />);
    expect(screen.queryByTestId('Claim Button')).not.toBeInTheDocument();
  });

  it('pages a long list', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createToken({ EvtLogId: i + 1, RoundNum: i + 1 }),
    );
    render(<DonatedERC20Table list={list} />);
    expect(screen.getByRole('button', { name: 'tables.pagination.next' })).toBeInTheDocument();
  });

  it('includes a print-only PDF fallback in the DOM', () => {
    const { container } = render(<DonatedERC20Table list={[createToken()]} />);
    expect(container.querySelector('[data-attached-erc20-print]')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedERC20Table list={[createToken()]} />);
    await checkA11y(container);
  });
});
