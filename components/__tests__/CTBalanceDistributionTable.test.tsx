import { CTBalanceDistributionTable } from '@/components/tokens/CTBalanceDistributionTable';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('CTBalanceDistributionTable', () => {
  test('with no records', () => {
    render(<CTBalanceDistributionTable list={[]} />);
    expect(screen.getByText('tables.empty.tokens')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        OwnerAid: 77430,
        OwnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        BalanceFloat: 3.100415642728686,
      },
    ];
    render(<CTBalanceDistributionTable list={mockData} />);
    // AddressLink shows the one short form (0x + 4 … 4) at every width.
    expect(screen.getByText('0x555e…\u20600e60')).toBeInTheDocument();
    // CST balances use the CST table precision: 2 fixed decimals.
    expect(screen.getByText('3.10')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CTBalanceDistributionTable list={[]} />);
    await checkA11y(container);
  });
});
