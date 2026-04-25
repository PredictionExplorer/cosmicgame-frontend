import '@testing-library/jest-dom';

import { checkA11y, render, screen } from '@/test-utils';

const mockSpecialRecipients = {
  EnduranceChampionAddress: '0x1111111111111111111111111111111111111111',
  EnduranceChampionDuration: 3600,
  LastCstBidderAddress: '0x2222222222222222222222222222222222222222',
};

const mockUseCurrentSpecialRecipients = jest.fn(() => ({
  data: mockSpecialRecipients as typeof mockSpecialRecipients | undefined,
}));
jest.mock('../../../hooks/useApiQuery', () => ({
  useCurrentSpecialRecipients: () => mockUseCurrentSpecialRecipients(),
}));

// eslint-disable-next-line import/order
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';

describe('SpecialAllocationRecipients', () => {
  it('renders section heading', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByTestId('special-allocation-heading')).toHaveTextContent(
      'Special Allocation Leaders',
    );
  });

  it('renders all three allocation category labels', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByText('Endurance Champion')).toBeInTheDocument();
    expect(screen.getByText('Chrono-Warrior')).toBeInTheDocument();
    expect(screen.getByText('Final CST Gesture')).toBeInTheDocument();
  });

  it('renders recipient addresses as links', () => {
    render(<SpecialAllocationRecipients />);
    const links = screen.getAllByRole('link');
    const championLink = links.find((l) =>
      l.getAttribute('href')?.includes(mockSpecialRecipients.EnduranceChampionAddress),
    );
    expect(championLink).toBeInTheDocument();
    const cstLink = links.find((l) =>
      l.getAttribute('href')?.includes(mockSpecialRecipients.LastCstBidderAddress),
    );
    expect(cstLink).toBeInTheDocument();
  });

  it('shows duration when EnduranceChampionDuration > 0', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getAllByText(/Held for/).length).toBeGreaterThanOrEqual(1);
  });

  it('hides duration when EnduranceChampionDuration is 0', () => {
    mockUseCurrentSpecialRecipients.mockReturnValue({
      data: { ...mockSpecialRecipients, EnduranceChampionDuration: 0 },
    });
    render(<SpecialAllocationRecipients />);
    expect(screen.queryByText(/Held for/)).not.toBeInTheDocument();
  });

  it('renders without data (undefined specialWinners)', () => {
    mockUseCurrentSpecialRecipients.mockReturnValue({ data: undefined });
    render(<SpecialAllocationRecipients />);
    expect(screen.getByTestId('special-allocation-heading')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SpecialAllocationRecipients />);
    await checkA11y(container);
  });
});
