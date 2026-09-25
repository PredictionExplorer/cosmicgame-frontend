import '@testing-library/jest-dom';

import { protocolFacts } from '@/content/protocol-facts';

import CharityWithdrawalTable from '@/components/tables/CharityWithdrawalTable';

import { render, screen, checkA11y } from '@/test-utils';

describe('CharityWithdrawalTable', () => {
  test('with no records', () => {
    render(<CharityWithdrawalTable list={[]} />);
    expect(screen.getByText('tables.empty.retrievals')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        EvtLogId: '5621730',
        BlockNum: 1737504,
        TxId: 895134,
        TxHash: '0xb1cf0f7147701aeb2d8b4645f84add966b2bee1d098e899eaf1aa1548dff04e0',
        TimeStamp: 1701346718,
        DateTime: '2023-11-30T12:18:38Z',
        DestinationAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        AmountEth: 0.10041564272868614,
      },
    ];
    render(<CharityWithdrawalTable list={mockData} />);
    expect(screen.getByText('Nov 30, 2023, 12:18')).toBeInTheDocument();
    expect(screen.getByText('0x555e…\u20600e60')).toBeInTheDocument();
    // ETH reads at the ledger precision, with the exact value on hover.
    const amount = screen.getByText('0.1004');
    expect(amount).toHaveAttribute('title', expect.stringContaining('0.10041564272868614'));
  });

  test('names the documented beneficiary, as the page header does', () => {
    // Regression: the header said "Protocol Guild" and the column said 0xdddd…cf79.
    const { name, address } = protocolFacts.publicGoodsBeneficiary;
    render(
      <CharityWithdrawalTable
        list={[
          {
            EvtLogId: '1',
            BlockNum: 1,
            TxId: 1,
            TxHash: `0x${'1'.repeat(64)}`,
            TimeStamp: 1701346718,
            DateTime: '2023-11-30T12:18:38Z',
            DestinationAddr: address.toLowerCase(),
            AmountEth: 1,
          },
        ]}
      />,
    );
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByTitle(`${name} · ${address}`)).toBeInTheDocument();
  });

  test('external links have rel="noopener noreferrer"', () => {
    const mockData = [
      {
        EvtLogId: '5621730',
        BlockNum: 1737504,
        TxId: 895134,
        TxHash: '0xb1cf0f7147701aeb2d8b4645f84add966b2bee1d098e899eaf1aa1548dff04e0',
        TimeStamp: 1701346718,
        DateTime: '2023-11-30T12:18:38Z',
        DestinationAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        AmountEth: 0.10041564272868614,
      },
    ];
    render(<CharityWithdrawalTable list={mockData} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharityWithdrawalTable list={[]} />);
    await checkA11y(container);
  });
});
