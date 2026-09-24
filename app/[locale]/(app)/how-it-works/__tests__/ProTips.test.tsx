import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { ProTips } from '../components/ProTips';

const proTips = howItWorksContentEn.proTips;

describe('ProTips', () => {
  it('renders the section heading', () => {
    render(<ProTips proTips={proTips} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tips and strategy' }),
    ).toBeInTheDocument();
  });

  it('shows each tip with its reasoning in the open, not behind a tooltip', () => {
    render(<ProTips proTips={proTips} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    for (const tip of proTips.tips) {
      expect(screen.getByRole('heading', { level: 3, name: tip.title })).toBeInTheDocument();
      expect(screen.getByText(tip.body)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('never advises stacking entries', () => {
    render(<ProTips proTips={proTips} />);
    expect(screen.queryByText(/Stack/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProTips proTips={proTips} />);
    await checkA11y(container);
  });
});
