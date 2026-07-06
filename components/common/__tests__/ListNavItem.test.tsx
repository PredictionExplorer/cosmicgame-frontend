import { Orbit, Sparkles } from 'lucide-react';
import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, within } from '@/test-utils';

import ListNavItem from '../ListNavItem';

describe('ListNavItem', () => {
  it('renders a simple nav link when no children', () => {
    const nav = { title: 'Gallery', route: '/gallery' };
    render(<ListNavItem nav={nav} />);
    const link = screen.getByRole('link', { name: 'Gallery' });
    expect(link).toHaveAttribute('href', '/gallery');
  });

  it('marks the pill active when the route matches the current path', () => {
    // jest.setup mocks usePathname() to '/', so the home route is active.
    render(<ListNavItem nav={{ title: 'Home', route: '/' }} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('bg-white/[0.08]');
  });

  it('leaves non-matching routes inactive', () => {
    render(<ListNavItem nav={{ title: 'Gallery', route: '/gallery' }} />);
    expect(screen.getByRole('link', { name: 'Gallery' })).not.toHaveClass('bg-white/[0.08]');
  });

  it('renders dropdown trigger when nav has children', () => {
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Allocations', route: '/allocation' },
        { title: 'Anchoring', route: '/anchoring' },
      ],
    };
    render(<ListNavItem nav={nav} />);
    expect(screen.getByRole('button', { name: 'Rewards' })).toBeInTheDocument();
  });

  it('shows child items after opening the dropdown', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Allocations', route: '/allocation' },
        { title: 'Anchoring', route: '/anchoring' },
      ],
    };
    render(<ListNavItem nav={nav} />);

    await user.click(screen.getByText('Rewards'));

    expect(screen.getByText('Allocations')).toBeInTheDocument();
    expect(screen.getByText('Anchoring')).toBeInTheDocument();
  });

  it('renders icon tiles and descriptions inside the panel', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Explore',
      route: '#',
      children: [
        {
          title: 'Current Cycle',
          route: '/current-cycle',
          description: 'Live cycle telemetry',
          icon: Orbit,
        },
      ],
    };
    render(<ListNavItem nav={nav} />);

    await user.click(screen.getByRole('button', { name: 'Explore' }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Live cycle telemetry')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /current cycle/i })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('renders external children as cross-host anchors', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Help',
      route: '#',
      children: [
        {
          title: 'Learn Hub',
          route: 'https://cosmicsignature.com/learn',
          external: true,
        },
      ],
    };
    render(<ListNavItem nav={nav} />);

    await user.click(screen.getByRole('button', { name: 'Help' }));

    const menu = await screen.findByRole('menu');
    const link = within(menu).getByRole('menuitem', { name: /learn hub/i });
    expect(link).toHaveAttribute('href', 'https://cosmicsignature.com/learn');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('renders featured children as a highlighted footer card', async () => {
    const user = userEvent.setup();
    const nav = {
      title: 'Help',
      route: '#',
      children: [
        { title: 'FAQ', route: '/faq' },
        {
          title: 'Discover Cosmic Signature',
          route: 'https://cosmicsignature.com',
          description: 'The art, the story, and the protocol',
          icon: Sparkles,
          external: true,
          featured: true,
        },
      ],
    };
    render(<ListNavItem nav={nav} />);

    await user.click(screen.getByRole('button', { name: 'Help' }));

    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    // The featured card is pinned after the regular rows.
    expect(items[items.length - 1]).toHaveAccessibleName(/discover cosmic signature/i);
    expect(items[items.length - 1]).toHaveAttribute('href', 'https://cosmicsignature.com');
  });

  it('marks the trigger active when a child route matches the current path', () => {
    // usePathname() is mocked to '/' — '/': startsWith matches every route,
    // so scope the check with an explicit child on the root path.
    const nav = {
      title: 'Explore',
      route: '#',
      children: [{ title: 'Home', route: '/' }],
    };
    render(<ListNavItem nav={nav} />);
    expect(screen.getByRole('button', { name: 'Explore' })).toHaveClass('bg-white/[0.08]');
  });

  it('has no accessibility violations', async () => {
    const nav = { title: 'Gallery', route: '/gallery' };
    const { container } = render(<ListNavItem nav={nav} />);
    await checkA11y(container);
  });
});
