import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { NOT_FOUND_ROUTE_IDS, getSiteRoute } from '@/config/siteNav';
import { OPEN_SITE_SEARCH_EVENT } from '@/components/layout/siteSearchEvents';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';

import { render, screen, checkA11y, within } from '@/test-utils';

import { generateMetadata } from '../[...notFound]/page';
import NotFound from '../not-found';
import * as landingNotFoundModule from '../../(landing)/landing-site/not-found';

const LandingNotFound = landingNotFoundModule.default;

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

  it('names the tab after the error from the catch-all page, which knows the locale', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metadata.title).toEqual({ absolute: 'errors.notFound.title · Cosmic Signature' });
    expect(metadata.description).toBe('errors.notFound.description');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('exports no metadata from the not-found file, which would read the locale from headers', async () => {
    const appModule = await import('../not-found');
    expect('generateMetadata' in appModule).toBe(false);
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

  it('exports no metadata either: the Learn and Quiz pages name the tab for a missing slug', () => {
    expect('generateMetadata' in landingNotFoundModule).toBe(false);
  });
});
