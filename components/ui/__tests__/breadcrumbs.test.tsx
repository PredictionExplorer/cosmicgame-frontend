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

  it('renders nothing for an empty trail', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
