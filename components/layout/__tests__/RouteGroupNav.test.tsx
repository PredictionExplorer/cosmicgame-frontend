import '@testing-library/jest-dom';

import { SITE_ROUTE_GROUPS, getSiteRoute } from '@/config/siteNav';

import { checkA11y, render, screen, within } from '@/test-utils';

import { RouteGroupNav } from '../RouteGroupNav';

describe('RouteGroupNav', () => {
  it('links every sibling of the group by its short name, under the group label', () => {
    render(<RouteGroupNav group="publicGoods" current="publicGoodsVoluntary" />);
    const nav = screen.getByRole('navigation', { name: 'nav.groups.publicGoods.label' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      SITE_ROUTE_GROUPS.publicGoods.map((id) => getSiteRoute(id).path),
    );
    expect(links.map((link) => link.textContent)).toEqual(
      SITE_ROUTE_GROUPS.publicGoods.map((id) => `nav.routes.${id}.short`),
    );
  });

  it('marks only the current page', () => {
    render(<RouteGroupNav group="publicGoods" current="publicGoodsVoluntary" />);
    expect(
      screen.getByRole('link', { name: 'nav.routes.publicGoodsVoluntary.short' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: 'nav.routes.publicGoodsProtocol.short' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RouteGroupNav group="publicGoods" current="publicGoodsRetrievals" />,
    );
    await checkA11y(container);
  });
});
