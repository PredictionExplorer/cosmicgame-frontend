import '@testing-library/jest-dom';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import type { CSTTokenInfo } from '@/services/api';

import { render, screen } from '@/test-utils';

jest.mock('react-super-responsive-table/dist/SuperResponsiveTableStyle.css', () => ({}));

// eslint-disable-next-line import/order
import { CSTTable } from '@/components/tokens/CSTTable';

describe('CSTTable', () => {
  test('with no records shows "No tokens yet."', () => {
    render(<CSTTable list={[]} />);
    expect(screen.getByText('No tokens yet.')).toBeInTheDocument();
  });

  test('with mock data renders token rows', () => {
    const mockData: CSTTokenInfo[] = [
      {
        EvtLogId: 100,
        BlockNum: 0,
        TxId: 0,
        TxHash: '0xabc123def456789',
        TimeStamp: 1701346718,
        DateTime: '',
        Seed: 'deadbeef',
        TokenId: 42,
        TokenName: 'CosmicToken#42',
        RoundNum: 5,
        WinnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        Staked: true,
        WasUnstaked: false,
        RecordType: 1,
      },
    ];

    render(<CSTTable list={mockData} />);

    expect(
      screen.getByText(convertTimestampToDateTime(mockData[0]!.TimeStamp)),
    ).toBeInTheDocument();
    expect(screen.getByText(String(mockData[0]!.TokenId))).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.TokenName!)).toBeInTheDocument();
    expect(screen.getByText(String(mockData[0]!.RoundNum))).toBeInTheDocument();
    expect(screen.getByText(shortenHex(mockData[0]!.WinnerAddr ?? '', 6))).toBeInTheDocument();
  });

  test('renders staked status correctly', () => {
    const mockData: CSTTokenInfo[] = [
      {
        EvtLogId: 101,
        BlockNum: 0,
        TxId: 0,
        TxHash: '0xdef',
        TimeStamp: 1701346718,
        DateTime: '',
        Seed: 'cafebabe',
        TokenId: 43,
        TokenName: undefined,
        RoundNum: 6,
        WinnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        Staked: false,
        WasUnstaked: true,
        RecordType: 3,
      },
    ];

    render(<CSTTable list={mockData} />);

    // Staked = false => "No", WasUnstaked = true => "Yes"
    const noElements = screen.getAllByText('No');
    const yesElements = screen.getAllByText('Yes');
    expect(noElements.length).toBeGreaterThanOrEqual(1);
    expect(yesElements.length).toBeGreaterThanOrEqual(1);
  });

  test('renders RecordType labels', () => {
    const mockData: CSTTokenInfo[] = [
      {
        EvtLogId: 102,
        BlockNum: 0,
        TxId: 0,
        TxHash: '0x111',
        TimeStamp: 1701346718,
        DateTime: '',
        Seed: 'aaa',
        TokenId: 44,
        TokenName: undefined,
        RoundNum: 7,
        WinnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        Staked: false,
        WasUnstaked: false,
        RecordType: 1,
      },
    ];

    render(<CSTTable list={mockData} />);

    expect(screen.getByText('Raffle NFT Token')).toBeInTheDocument();
  });

  test('renders table headers', () => {
    const mockData: CSTTokenInfo[] = [
      {
        EvtLogId: 103,
        BlockNum: 0,
        TxId: 0,
        TxHash: '0x222',
        TimeStamp: 1701346718,
        DateTime: '',
        Seed: 'bbb',
        TokenId: 45,
        TokenName: undefined,
        RoundNum: 8,
        WinnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        Staked: false,
        WasUnstaked: false,
        RecordType: 2,
      },
    ];

    render(<CSTTable list={mockData} />);

    // react-super-responsive-table duplicates header text in tdBefore divs,
    // so we use getAllByText and check at least one match exists
    expect(screen.getAllByText('Token ID').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Token Name').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Round').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Winner Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Prize Type').length).toBeGreaterThanOrEqual(1);
  });
});
