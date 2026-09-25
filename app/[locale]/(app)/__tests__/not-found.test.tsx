import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { NOT_FOUND_ROUTE_IDS, getSiteRoute } from '@/config/siteNav';
import { OPEN_SITE_SEARCH_EVENT } from '@/components/layout/siteSearchEvents';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';

import { render, screen, checkA11y, within } from '@/test-utils';

import GlobalNotFound, { generateMetadata } from '../../../global-not-found';
import NotFound from '../not-found';
import { AppChrome } from '../app-chrome';
import { LandingChrome } from '../../(landing)/landing-chrome';
import * as landingNotFoundModule from '../../(landing)/landing-site/not-found';

const LandingNotFound = landingNotFoundModule.default;

jest.mock('../../../../components/ui/page-shell', () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

// The global 404 reads the host from the request; the chrome modules pull the
// wallet stack and the landing content, which these tests do not render.
let mockHost = 'app.cosmicsignature.com';
jest.mock('next/headers', () => ({
  headers: async () => new Headers({ host: mockHost }),
}));
jest.mock('../app-chrome', () => ({ AppChrome: () => null }));
jest.mock('../../(landing)/landing-chrome', () => ({ LandingChrome: () => null }));
jest.mock('../../../root-document', () => ({
  RootDocument: ({ children }: { children: React.ReactNode }) => children,
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

  it('opens the plate with the error code and the heading after it', () => {
    render(<NotFound />);
    const plate = screen.getByTestId('not-found-plate');
    expect(plate).toHaveTextContent('errors.notFound.code');
    expect(
      plate.compareDocumentPosition(screen.getByRole('heading', { level: 1 })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('heads every 404 from the not-found files, with the locale from params, never headers', async () => {
    const intl = await import('next-intl/server');
    const getLocale = jest.spyOn(intl, 'getLocale');
    const appModule = await import('../not-found');
    const landingModule = await import('../../(landing)/not-found');
    // Whatever calls notFound() (a segment layout rejecting an id included),
    // this is the head crawlers get: the error's title and noindex, follow.
    for (const generate of [appModule.generateMetadata, landingModule.generateMetadata]) {
      const metadata = await generate({ params: Promise.resolve({ locale: 'ja' }) });
      expect(metadata.title).toEqual({ absolute: 'errors.notFound.title · Cosmic Signature' });
      expect(metadata.robots).toEqual({ index: false, follow: true });
    }
    // An unknown or missing locale falls back to the default instead of throwing.
    const fallback = await appModule.generateMetadata({ params: Promise.resolve({}) });
    expect(fallback.robots).toEqual({ index: false, follow: true });
    expect(getLocale).not.toHaveBeenCalled();
    getLocale.mockRestore();
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

  it('shares the head of the landing 404 with the route-group not-found file', () => {
    expect(landingNotFoundModule.generateMetadata).toBeInstanceOf(Function);
  });
});

describe('global 404 (every URL no route matches)', () => {
  afterEach(() => {
    mockHost = 'app.cosmicsignature.com';
  });

  it('names the tab after the error, keeps it out of the index and claims no canonical', async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toEqual({ absolute: 'errors.notFound.title · Cosmic Signature' });
    expect(metadata.description).toBe('errors.notFound.description');
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toBeNull();
    expect(metadata.metadataBase).toEqual(new URL(APP_ORIGIN));
    expect(metadata.icons).toBeDefined();
  });

  it('frames an unknown app URL with the app chrome', async () => {
    const tree = await GlobalNotFound();
    expect(tree.props.children.type).toBe(AppChrome);
  });

  it('frames an unknown landing URL with the landing chrome, never the wallet stack', async () => {
    mockHost = 'cosmicsignature.com';
    const tree = await GlobalNotFound();
    expect(tree.props.children.type).toBe(LandingChrome);
    const metadata = await generateMetadata();
    expect(metadata.manifest).toBeUndefined();
  });
});
