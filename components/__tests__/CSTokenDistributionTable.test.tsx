import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('CSTokenDistributionTable', () => {
  test('with no records', () => {
    render(<CSTokenDistributionTable list={[]} />);
    expect(screen.getByText('tables.empty.tokens')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        OwnerAid: 77430,
        OwnerAddr: '0x555eced709352759Ed0f1317dfC0a5FEf1310e60',
        NumTokens: 3,
      },
    ];
    render(<CSTokenDistributionTable list={mockData} />);
    // AddressLink shows the one short form (0x + 4 … 4) at every width.
    expect(screen.getByText('0x555e…\u20600e60')).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.NumTokens)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTokenDistributionTable list={[]} />);
    await checkA11y(container);
  });
});
