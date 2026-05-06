import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';
import {
  TEST_STAKING_CST_LABEL,
  TEST_STAKING_RWALK_LABEL,
} from '@/test-utils/contractAddressesFixture';

import { ZERO_ADDRESS } from '@/config/misc';
import { TransferHistoryTable } from '@/components/tables/TransferHistoryTable';

import { checkA11y, render, screen } from '@/test-utils';

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

describe('TransferHistoryTable', () => {
  it('renders table headers', () => {
    render(<TransferHistoryTable list={[createRecord()]} />);
    expect(screen.getAllByText('DateTime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('From').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('To').length).toBeGreaterThanOrEqual(1);
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

  it('shows Cosmic Signature NFT anchoring wallet label for CST anchoring address', () => {
    render(<TransferHistoryTable list={[createRecord({ FromAddr: TEST_STAKING_CST_LABEL })]} />);
    expect(screen.getByText('Cosmic Signature NFT Anchoring Wallet')).toBeInTheDocument();
  });

  it('shows RandomWalk NFT anchoring wallet label for RWLK anchoring address', () => {
    render(<TransferHistoryTable list={[createRecord({ FromAddr: TEST_STAKING_RWALK_LABEL })]} />);
    expect(screen.getByText('RandomWalk NFT Anchoring Wallet')).toBeInTheDocument();
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

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRecord({ EvtLogId: i, TimeStamp: 1701346718 + i * 86400 }),
    );
    render(<TransferHistoryTable list={list} />);
    expect(screen.getByText(convertTimestampToDateTime(list[4]!.TimeStamp))).toBeInTheDocument();
    expect(
      screen.queryByText(convertTimestampToDateTime(list[5]!.TimeStamp)),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransferHistoryTable list={[]} />);
    await checkA11y(container);
  });
});
