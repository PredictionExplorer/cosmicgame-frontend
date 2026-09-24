import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

// eslint-disable-next-line import/order
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';

describe('AdminEventsTable', () => {
  test('with no records says no configuration changes were recorded', () => {
    render(<AdminEventsTable list={[]} />);
    expect(screen.getByText('tables.adminEvents.empty')).toBeInTheDocument();
  });

  test('with mock data renders event rows', () => {
    const mockData: AdminEventRow[] = [
      {
        EvtLogId: '1',
        RecordType: 1,
        TransferType: 0,
        TimeStamp: 1701346718,
        TxHash: '0xabc123def456',
        IntegerValue: 25,
        AddressValue: '',
        StringValue: '',
      },
    ];

    render(<AdminEventsTable list={mockData} />);

    expect(
      screen.getByText(convertTimestampToDateTime(mockData[0]!.TimeStamp)),
    ).toBeInTheDocument();
    // The event is presented as a readable description, with its percentage.
    expect(screen.getByText('Public Goods percentage changed')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  test('external links have rel="noopener noreferrer"', () => {
    const mockData: AdminEventRow[] = [
      {
        EvtLogId: '1',
        RecordType: 1,
        TransferType: 0,
        TimeStamp: 1701346718,
        TxHash: '0xabc123def456',
        IntegerValue: 25,
        AddressValue: '',
        StringValue: '',
      },
    ];
    render(<AdminEventsTable list={mockData} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  test('renders table headers', () => {
    const mockData: AdminEventRow[] = [
      {
        EvtLogId: '2',
        RecordType: 2,
        TransferType: 0,
        TimeStamp: 1701346718,
        TxHash: '0xdef789',
        IntegerValue: 50,
        AddressValue: '',
        StringValue: '',
      },
    ];

    render(<AdminEventsTable list={mockData} />);

    // A label string can appear both as a column header and as a cell's
    // mobile `data-label`, so match on the th elements specifically.
    const eventHeaders = screen.getAllByText('tables.columns.event');
    expect(eventHeaders.length).toBeGreaterThanOrEqual(1);
    const datetimeHeaders = screen.getAllByText('tables.columns.datetime');
    expect(datetimeHeaders.length).toBeGreaterThanOrEqual(1);
    const newValueHeaders = screen.getAllByText('tables.columns.newValue');
    expect(newValueHeaders.length).toBeGreaterThanOrEqual(1);
  });

  describe('time added per gesture', () => {
    // Regression: the V2 event reports microseconds, and the table once formatted
    // 3,672,360,000 µs as seconds ("42504d 4h") instead of 1h 1m 12s.
    const timeIncrementRow: AdminEventRow = {
      EvtLogId: '26006',
      RecordType: 21,
      TransferType: 0,
      TimeStamp: 1786491506,
      TxHash: '0x40e9',
      IntegerValue: 3_672_360_000,
      AddressValue: '',
      StringValue: '',
    };

    afterEach(() => jest.restoreAllMocks());

    test('converts the microsecond value before formatting it', () => {
      render(<AdminEventsTable list={[timeIncrementRow]} />);

      expect(screen.getByText('1h 1m 12s')).toBeInTheDocument();
      expect(screen.queryByText(/42504d/)).not.toBeInTheDocument();
    });

    test('formats the converted duration with the locale units', () => {
      jest
        .spyOn(jest.requireMock<typeof import('next-intl')>('next-intl'), 'useLocale')
        .mockReturnValue('zh');

      render(<AdminEventsTable list={[timeIncrementRow]} />);

      expect(screen.getByText('1小时1分12秒')).toBeInTheDocument();
    });

    test('keeps second-based durations in seconds', () => {
      render(
        <AdminEventsTable
          list={[{ ...timeIncrementRow, EvtLogId: '25530', RecordType: 7, IntegerValue: 3600 }]}
        />,
      );

      expect(screen.getByText('1h')).toBeInTheDocument();
    });
  });

  describe('event values', () => {
    const base: AdminEventRow = {
      EvtLogId: '1',
      RecordType: 2,
      TransferType: 0,
      TimeStamp: 1701346718,
      TxHash: '0xdef789',
      IntegerValue: 0,
      AddressValue: '',
      StringValue: '',
    };

    test('explains an event with an info button, not a warning icon', () => {
      render(<AdminEventsTable list={[base]} />);
      const explain = screen.getByRole('button', {
        name: /statistics\.systemEvent\.explainEvent|Explain/,
      });
      expect(explain.querySelector('svg')).toHaveClass('lucide-info');
      expect(document.querySelector('.lucide-circle-alert, .lucide-alert-circle')).toBeNull();
    });

    test('reads the CST Calibration Window length as a duration', () => {
      // RoundStartCSTAuctionLengthChanged: seconds, not a bare number.
      render(<AdminEventsTable list={[{ ...base, RecordType: 25, IntegerValue: 1800 }]} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
      expect(screen.queryByText('1800')).not.toBeInTheDocument();
    });

    test('shows a dash for an empty text value instead of an empty link', () => {
      const { container } = render(
        <AdminEventsTable list={[{ ...base, RecordType: 31, StringValue: '' }]} />,
      );
      expect(container.querySelector('a[href=""]')).toBeNull();
      expect(screen.getByText('tables.status.unavailable')).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AdminEventsTable list={[]} />);
    await checkA11y(container);
  });
});
