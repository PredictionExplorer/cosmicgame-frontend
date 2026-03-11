import DonatedNFTDistributionTable from '@/components/donations/DonatedNFTDistributionTable';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('DonatedNFTDistributionTable', () => {
  test('with no records', () => {
    render(<DonatedNFTDistributionTable list={[]} />);
    expect(screen.getByText('No donated tokens yet.')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        TokenAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NumDonations: 39,
      },
      {
        TokenAddr: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        NumDonations: 6,
      },
    ];
    render(<DonatedNFTDistributionTable list={mockData} />);
    expect(screen.getByText(mockData[0]!.TokenAddr)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.NumDonations)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DonatedNFTDistributionTable list={[]} />);
    await checkA11y(container);
  });
});
