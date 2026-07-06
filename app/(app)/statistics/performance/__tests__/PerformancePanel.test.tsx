// lexicon-allow-start: test ids mirror internal analytics component names
import { render, screen, checkA11y } from '@/test-utils';

import PerformancePanel from '../PerformancePanel';

jest.mock('../../../../../components/statistics/RoiLeaderboardSection', () => ({
  RoiLeaderboardSection: () => <div data-testid="roi-leaderboard-section" />,
}));
jest.mock('../../../../../components/statistics/ClaimsByRoundSection', () => ({
  ClaimsByRoundSection: () => <div data-testid="claims-by-round-section" />,
}));

describe('PerformancePanel', () => {
  it('renders the leaderboard and claims sections with headings', () => {
    render(<PerformancePanel />);
    expect(screen.getByText('Participant Performance')).toBeInTheDocument();
    expect(screen.getByTestId('roi-leaderboard-section')).toBeInTheDocument();
    expect(screen.getByText('Allocation Claims by Cycle')).toBeInTheDocument();
    expect(screen.getByTestId('claims-by-round-section')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PerformancePanel />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
