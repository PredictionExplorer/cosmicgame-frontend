import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { ProTips } from '../components/ProTips';

const proTips = howItWorksContentEn.proTips;

describe('ProTips', () => {
  it('renders the section heading', () => {
    render(<ProTips proTips={proTips} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Good to know' })).toBeInTheDocument();
  });

  it('shows each detail as a term and its plain fact, not behind a tooltip', () => {
    render(<ProTips proTips={proTips} />);
    expect(screen.getAllByRole('term')).toHaveLength(3);
    for (const tip of proTips.tips) {
      expect(screen.getByText(tip.title).tagName).toBe('DT');
      expect(screen.getByText(tip.body)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('never advises stacking entries or timing gestures', () => {
    render(<ProTips proTips={proTips} />);
    expect(screen.queryByText(/Stack/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/maximi[sz]e|wisely|strategy/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProTips proTips={proTips} />);
    await checkA11y(container);
  });
});
