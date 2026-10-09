import { render, screen, checkA11y } from '@/test-utils';

import PerformancePanel from '../PerformancePanel';

jest.mock('../../../../../../components/statistics/ParticipantOutcomesSection', () => ({
  ParticipantOutcomesSection: () => <div data-testid="participant-outcomes-section" />,
}));
jest.mock('../../../../../../components/statistics/ClaimsByRoundSection', () => ({
  ClaimsByRoundSection: () => <div data-testid="claims-by-round-section" />,
}));

describe('PerformancePanel', () => {
  it('renders the outcomes and retrievals sections under H2 headings', () => {
    render(<PerformancePanel />);
    expect(screen.getByRole('heading', { level: 2, name: 'Spent and received' })).toBeVisible();
    expect(screen.getByTestId('participant-outcomes-section')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Retrievals by cycle' })).toBeVisible();
    expect(screen.getByTestId('claims-by-round-section')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PerformancePanel />);
    await checkA11y(container);
  });
});
