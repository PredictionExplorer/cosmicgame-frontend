import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test-utils';

import ListNavItem from '../ListNavItem';

describe('ListNavItem', () => {
  it('renders a simple nav link when no children', () => {
    const nav = { title: 'Gallery', route: '/gallery' };
    render(<ListNavItem nav={nav} />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('renders dropdown trigger when nav has children', () => {
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Prizes', route: '/prize' },
        { title: 'Staking', route: '/staking' },
      ],
    };
    render(<ListNavItem nav={nav} />);
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('shows child items after opening the dropdown', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Prizes', route: '/prize' },
        { title: 'Staking', route: '/staking' },
      ],
    };
    render(<ListNavItem nav={nav} />);

    await user.click(screen.getByText('Rewards'));

    expect(screen.getByText('Prizes')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
  });
});
