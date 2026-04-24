import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import NestedListItem from '../ListItemButton';

describe('NestedListItem', () => {
  it('renders nav title for items with children', () => {
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [{ title: 'Prizes', route: '/prize' }],
    };
    render(<NestedListItem nav={nav} />);
    expect(screen.getByText('Rewards')).toBeInTheDocument();
  });

  it('renders nav link for items without children', () => {
    const nav = { title: 'Gallery', route: '/gallery' };
    render(<NestedListItem nav={nav} />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('toggles expanded state on click', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [{ title: 'Prizes', route: '/prize' }],
    };
    render(<NestedListItem nav={nav} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on Enter key press', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [{ title: 'Prizes', route: '/prize' }],
    };
    render(<NestedListItem nav={nav} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on Space key press', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [{ title: 'Prizes', route: '/prize' }],
    };
    render(<NestedListItem nav={nav} />);

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard(' ');

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders child items', () => {
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Prizes', route: '/prize' },
        { title: 'Staking', route: '/anchoring' },
      ],
    };
    render(<NestedListItem nav={nav} />);
    expect(screen.getByText('Prizes')).toBeInTheDocument();
    expect(screen.getByText('Staking')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [{ title: 'Prizes', route: '/prize' }],
    };
    const { container } = render(<NestedListItem nav={nav} />);
    await checkA11y(container);
  });
});
