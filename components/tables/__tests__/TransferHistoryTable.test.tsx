import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';
import {
  TEST_STAKING_CST_LABEL,
  TEST_STAKING_RWALK_LABEL,
} from '@/test-utils/contractAddressesFixture';

import { ZERO_ADDRESS } from '@/config/misc';
import { TransferHistoryTable } from '@/components/tables/TransferHistoryTable';

import { checkA11y, render, screen } from '@/test-utils';

let mockPhone = false;
jest.mock('../../../components/ui/data-table/use-page-size', () => ({
  ...jest.requireActual('../../../components/ui/data-table/use-page-size'),
  usePhoneLayout: () => mockPhone,
}));

beforeEach(() => {
  mockPhone = false;
});

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({
    stakingCst: TEST_STAKING_CST_LABEL,
    stakingRwalk: TEST_STAKING_RWALK_LABEL,
    randomWalkNft: '',
    cosmicGame: '',
    cosmicSignature: '',
    cosmicToken: '',
    cosmicDao: '',
    charity: '',
    prizesWallet: '',
    marketing: '',
    implementation: '',
  }),
}));

const createRecord = (overrides = {}) => ({
  EvtLogId: 1,
  BlockNum: 100,
  TxId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  TokenId: 42,
  FromAddr: '0x1111111111111111111111111111111111111111',
  ToAddr: '0x2222222222222222222222222222222222222222',
  ...overrides,
});

describe('TransferHistoryTable on a phone', () => {
  it('stays a table of one line per transfer: the date, then From → To', () => {
    mockPhone = true;
    const { container } = render(<TransferHistoryTable list={[createRecord()]} />);
    expect(screen.getByRole('table')).toHaveAttribute('data-layout', 'compact');
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      'tables.columns.dateTimeCompact',
      'tables.columns.from → tables.columns.to',
    ]);
    const route = container.querySelectorAll('tbody td')[1];
    // Both addresses link to their participant pages, and a screen reader
    // hears "From … To …" rather than an arrow.
    const links = [...(route?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      '/user/0x1111111111111111111111111111111111111111',
      '/user/0x2222222222222222222222222222222222222222',
    ]);
    const spoken = [...(route?.querySelectorAll('.sr-only:not([role])') ?? [])].map(
      (node) => node.textContent,
    );
    expect(spoken).toEqual(['tables.columns.from', 'tables.columns.to']);
  });
});

describe('TransferHistoryTable', () => {
  it('renders table headers', () => {
    render(<TransferHistoryTable list={[createRecord()]} />);
    expect(screen.getAllByText('tables.columns.dateTimeCompact').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.from').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.to').length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as explorer link with rel attrs', () => {
    const record = createRecord();
    render(<TransferHistoryTable list={[record]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(record.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides rows where FromAddr is ZERO_ADDRESS', () => {
    render(
      <TransferHistoryTable
        list={[
          createRecord({ EvtLogId: 1, FromAddr: ZERO_ADDRESS }),
          createRecord({ EvtLogId: 2 }),
        ]}
      />,
    );
    const datetimes = screen.getAllByText(convertTimestampToDateTime(1701346718));
    expect(datetimes).toHaveLength(1);
  });

  it('names the Cosmic Signature NFT anchoring wallet instead of showing hex', () => {
    render(<TransferHistoryTable list={[createRecord({ FromAddr: TEST_STAKING_CST_LABEL })]} />);
    expect(screen.getByText('formats.address.known.cosmicAnchor')).toBeInTheDocument();
  });

  it('names the Random Walk NFT anchoring wallet instead of showing hex', () => {
    render(<TransferHistoryTable list={[createRecord({ FromAddr: TEST_STAKING_RWALK_LABEL })]} />);
    expect(screen.getByText('formats.address.known.rwalkAnchor')).toBeInTheDocument();
  });

  it('shows shortened hex for regular addresses', () => {
    const addr = '0x1111111111111111111111111111111111111111';
    render(<TransferHistoryTable list={[createRecord({ FromAddr: addr })]} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
  });

  it('renders From and To as links to user pages', () => {
    const from = '0x1111111111111111111111111111111111111111';
    const to = '0x2222222222222222222222222222222222222222';
    render(<TransferHistoryTable list={[createRecord({ FromAddr: from, ToAddr: to })]} />);
    const links = screen.getAllByRole('link');
    const userLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createRecord({ EvtLogId: i, TimeStamp: 1701346718 + i * 86400 }),
    );
    const { container } = render(<TransferHistoryTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransferHistoryTable list={[]} />);
    await checkA11y(container);
  });
});
