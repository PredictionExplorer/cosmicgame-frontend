import { CSTokenDistributionTable } from '@/components/tokens/CSTokenDistributionTable';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('CSTokenDistributionTable', () => {
  test('with no records', () => {
    render(<CSTokenDistributionTable list={[]} />);
    expect(screen.getByText('No tokens yet.')).toBeInTheDocument();
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
    // AddressLink shows full address on desktop or shortened (0x555ece....310e60) on mobile
    const addressEl =
      screen.queryByText(mockData[0]!.OwnerAddr) || screen.queryByText(/0x555ece.*310e60/);
    expect(addressEl).toBeTruthy();
    expect(addressEl).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.NumTokens)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTokenDistributionTable list={[]} />);
    await checkA11y(container);
  });
});
