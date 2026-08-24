import AttachedNFTDistributionTable from '@/components/attachments/AttachedNFTDistributionTable';

import { render, screen, checkA11y } from '@/test-utils';
import '@testing-library/jest-dom';

describe('AttachedNFTDistributionTable', () => {
  test('with no records', () => {
    render(<AttachedNFTDistributionTable list={[]} />);
    expect(screen.getByText('tables.empty.attachedTokens')).toBeInTheDocument();
  });

  test('with mock data', () => {
    const mockData = [
      {
        ContractAddr: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
        NumDonatedTokens: 39,
      },
      {
        ContractAddr: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
        NumDonatedTokens: 6,
      },
    ];
    render(<AttachedNFTDistributionTable list={mockData} />);
    expect(screen.getByText(mockData[0]!.ContractAddr)).toBeInTheDocument();
    expect(screen.getByText(mockData[0]!.NumDonatedTokens)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttachedNFTDistributionTable list={[]} />);
    await checkA11y(container);
  });
});
