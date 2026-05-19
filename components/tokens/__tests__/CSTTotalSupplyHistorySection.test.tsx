import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CSTTotalSupplyHistorySection } from '../CSTTotalSupplyHistorySection';

jest.mock('../CSTTotalSupplyHistoryChart', () => ({
  CSTTotalSupplyHistoryChart: () => <div data-testid="cst-total-supply-history-chart" />,
}));

jest.mock('../CSTTotalSupplyHistoryByBidChart', () => ({
  CSTTotalSupplyHistoryByBidChart: () => (
    <div data-testid="cst-total-supply-history-by-bid-chart" />
  ),
}));

describe('CSTTotalSupplyHistorySection', () => {
  it('renders tabs and shows only the date chart by default', () => {
    render(<CSTTotalSupplyHistorySection />);
    expect(screen.getByTestId('cst-total-supply-history-section')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /by date/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /by bid/i })).toBeInTheDocument();
    expect(screen.getByTestId('cst-total-supply-history-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('cst-total-supply-history-by-bid-chart')).not.toBeInTheDocument();
  });

  it('shows only the bid chart when By bid tab is selected', async () => {
    const user = userEvent.setup();
    render(<CSTTotalSupplyHistorySection />);
    await user.click(screen.getByRole('tab', { name: /by bid/i }));
    expect(screen.queryByTestId('cst-total-supply-history-chart')).not.toBeInTheDocument();
    expect(screen.getByTestId('cst-total-supply-history-by-bid-chart')).toBeInTheDocument();
  });
});
