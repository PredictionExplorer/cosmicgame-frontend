import { render, screen } from '@/test-utils';
import '@testing-library/jest-dom';
import { convertTimestampToDateTime } from '@/utils';
import { AdminEventsTable, type AdminEventRow } from '@/components/tables/AdminEventsTable';

jest.mock('react-super-responsive-table/dist/SuperResponsiveTableStyle.css', () => ({}));

describe('AdminEventsTable', () => {
  test('with no records shows "No events yet."', () => {
    render(<AdminEventsTable list={[]} />);
    expect(screen.getByText('No events yet.')).toBeInTheDocument();
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
    // RecordType 1 is 'CharityPercentageChanged' with type 'percentage'
    expect(screen.getByText('CharityPercentageChanged')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
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

    // react-super-responsive-table duplicates header text in tdBefore divs,
    // so we use getAllByText and check the th elements
    const eventHeaders = screen.getAllByText('Event');
    expect(eventHeaders.length).toBeGreaterThanOrEqual(1);
    const datetimeHeaders = screen.getAllByText('Datetime');
    expect(datetimeHeaders.length).toBeGreaterThanOrEqual(1);
    const newValueHeaders = screen.getAllByText('New Value');
    expect(newValueHeaders.length).toBeGreaterThanOrEqual(1);
  });
});
