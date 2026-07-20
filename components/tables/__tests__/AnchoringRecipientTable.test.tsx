import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { checkA11y, render, screen } from '@/test-utils';

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

// eslint-disable-next-line import/order
import AnchoringRecipientTable from '@/components/tables/AnchoringRecipientTable';

const createRecipient = (overrides = {}) => ({
  EvtLogId: 1,
  RoundNum: 1,
  TokenId: 0,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  StakerNumStakedNFTs: 3,
  StakerAmountEth: 0.5,
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('AnchoringRecipientTable', () => {
  it('renders custom empty message when list is empty', () => {
    render(<AnchoringRecipientTable list={[]} />);
    expect(screen.getByText('tables.anchoringRecipient.empty')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<AnchoringRecipientTable list={[createRecipient()]} />);
    expect(screen.getAllByText('tables.columns.datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.anchorHolder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.numberOfNfts').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('tables.columns.distributionAmountEth').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as explorer link', () => {
    const recipient = createRecipient();
    render(<AnchoringRecipientTable list={[recipient]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(recipient.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(recipient.TimeStamp, false, 'en');
  });

  it('renders shortened anchorHolder address with link', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<AnchoringRecipientTable list={[createRecipient({ StakerAddr: addr })]} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
    const addrLink = screen.getByText(shortenHex(addr, 6)).closest('a');
    expect(addrLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('renders NFT count and reward amount', () => {
    render(
      <AnchoringRecipientTable
        list={[createRecipient({ StakerNumStakedNFTs: 5, StakerAmountEth: 1.2345 })]}
      />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1.2345')).toBeInTheDocument();
  });

  it('formats StakerAmountEth to 4 decimal places', () => {
    render(<AnchoringRecipientTable list={[createRecipient({ StakerAmountEth: 0.1 })]} />);
    expect(screen.getByText('0.1000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRecipient({
        StakerAddr: `0x${String(i).padStart(40, '0')}`,
        StakerNumStakedNFTs: 100 + i,
      }),
    );
    render(<AnchoringRecipientTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringRecipientTable list={[]} />);
    await checkA11y(container);
  });
});
