import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { NOT_FOUND_ROUTE_IDS, getSiteRoute } from '@/config/siteNav';
import { OPEN_SITE_SEARCH_EVENT } from '@/components/layout/siteSearchEvents';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';

import { render, screen, checkA11y, within } from '@/test-utils';

import NotFound, { generateMetadata } from '../not-found';
import LandingNotFound, {
  generateMetadata as generateLandingMetadata,
} from '../../(landing)/landing-site/not-found';

jest.mock('../../../../components/ui/page-shell', () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe('app 404 page', () => {
  it('names the error in an eyebrow above a plain heading', () => {
    render(<NotFound />);
    expect(screen.getByText('errors.notFound.code')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('errors.notFound.title');
    expect(screen.getByText('errors.notFound.description')).toBeInTheDocument();
  });

  it('offers the Observatory and the Gallery first', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: 'errors.notFound.primaryCta' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'errors.notFound.secondaryCta' })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });

  it('suggests useful destinations with their descriptions', () => {
    render(<NotFound />);
    const suggestions = screen.getByRole('navigation', { name: 'errors.notFound.suggestedPages' });
    for (const id of NOT_FOUND_ROUTE_IDS) {
      expect(
        within(suggestions).getByRole('link', { name: new RegExp(`nav\\.routes\\.${id}\\.label`) }),
      ).toHaveAttribute('href', getSiteRoute(id).path);
    }
    expect(within(suggestions).queryByRole('link', { name: /routes\.observatory/ })).toBeNull();
  });

  it('opens the command palette from its search button', async () => {
    const listener = jest.fn();
    window.addEventListener(OPEN_SITE_SEARCH_EVENT, listener);
    render(<NotFound />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'nav.search.triggerLabel' }));
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_SITE_SEARCH_EVENT, listener);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NotFound />);
    await checkA11y(container);
  });

  it('names the tab after the error instead of the site default', async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toEqual({ absolute: 'errors.notFound.title · Cosmic Signature' });
    expect(metadata.description).toBe('errors.notFound.description');
  });
});

describe('landing 404 page', () => {
  it('shares the design and sends app destinations to the app host', () => {
    render(<LandingNotFound />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('errors.notFound.title');
    expect(screen.getByRole('link', { name: 'errors.notFound.primaryCta' })).toHaveAttribute(
      'href',
      localeHref(APP_ORIGIN, '/', 'en'),
    );
    expect(screen.queryByRole('button', { name: 'nav.search.triggerLabel' })).toBeNull();
  });

  it('uses the same absolute tab title as the app, outside the landing title template', async () => {
    expect(await generateLandingMetadata()).toEqual(await generateMetadata());
  });
});
