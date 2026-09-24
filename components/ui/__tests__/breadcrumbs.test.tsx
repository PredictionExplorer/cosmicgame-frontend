import { Breadcrumbs } from '@/components/ui/breadcrumbs';

import { render, screen, within } from '@/test-utils';

describe('Breadcrumbs', () => {
  it('renders an ordered trail in a labelled nav, the current page marked', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Records', href: '/site-map' },
          { label: 'Cycle #2' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(within(nav).getByRole('link', { name: 'Records' })).toHaveAttribute('href', '/site-map');
    expect(within(nav).getByText('Cycle #2')).toHaveAttribute('aria-current', 'page');
  });

  it('sets an identifier crumb in mono', () => {
    render(<Breadcrumbs items={[{ label: '0xA169…⁠63B6', href: '/user/0xA169', mono: true }]} />);
    expect(screen.getByRole('link', { name: '0xA169…⁠63B6' })).toHaveClass('font-mono');
  });

  it('renders nothing for an empty trail', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
