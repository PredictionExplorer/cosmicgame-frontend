import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { RewardBreakdown } from '../components/RewardBreakdown';

const rewardBreakdown = howItWorksContentEn.rewardBreakdown;

describe('RewardBreakdown', () => {
  it('renders the section heading and description', () => {
    render(<RewardBreakdown rewardBreakdown={rewardBreakdown} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'What a gesture can lead to' }),
    ).toBeInTheDocument();
    expect(screen.getByText(rewardBreakdown.subhead)).toBeInTheDocument();
  });

  it('lists the four outcomes with plain titles and the whole rule in the open (D073)', () => {
    render(<RewardBreakdown rewardBreakdown={rewardBreakdown} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    for (const item of rewardBreakdown.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses the palette tokens, not fixed hues or white alpha', () => {
    const { container } = render(<RewardBreakdown rewardBreakdown={rewardBreakdown} />);
    expect(container.innerHTML).not.toMatch(/(cyan|purple|amber|emerald)-\d|white\/\[/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardBreakdown rewardBreakdown={rewardBreakdown} />);
    await checkA11y(container);
  });
});
