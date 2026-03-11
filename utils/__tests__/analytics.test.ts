import { GA_TRACKING_ID, pageview, event } from '../analytics';

describe('GA_TRACKING_ID', () => {
  it('reads from NEXT_PUBLIC_GA4_MEASUREMENT_ID env var', () => {
    expect(GA_TRACKING_ID).toBe(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
  });
});

describe('pageview', () => {
  const w = window as unknown as Record<string, unknown>;
  const originalGtag = w.gtag;

  afterEach(() => {
    w.gtag = originalGtag;
  });

  it('calls gtag config with correct params when gtag exists', () => {
    const mockGtag = jest.fn();
    w.gtag = mockGtag;

    pageview('/home');

    expect(mockGtag).toHaveBeenCalledWith('config', GA_TRACKING_ID, {
      page_path: '/home',
    });
  });

  it('does not throw when gtag is undefined', () => {
    delete w.gtag;
    expect(() => pageview('/home')).not.toThrow();
  });
});

describe('event', () => {
  const w = window as unknown as Record<string, unknown>;
  const originalGtag = w.gtag;

  afterEach(() => {
    w.gtag = originalGtag;
  });

  it('calls gtag event with all parameters', () => {
    const mockGtag = jest.fn();
    w.gtag = mockGtag;

    event({ action: 'click', category: 'button', label: 'submit', value: 1 });

    expect(mockGtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'button',
      event_label: 'submit',
      value: 1,
    });
  });

  it('passes undefined value when omitted', () => {
    const mockGtag = jest.fn();
    w.gtag = mockGtag;

    event({ action: 'view', category: 'page', label: 'home' });

    expect(mockGtag).toHaveBeenCalledWith('event', 'view', {
      event_category: 'page',
      event_label: 'home',
      value: undefined,
    });
  });

  it('does not throw when gtag is undefined', () => {
    delete w.gtag;
    expect(() => event({ action: 'click', category: 'button', label: 'submit' })).not.toThrow();
  });

  it('passes value=0 (falsy but valid) through to gtag', () => {
    const mockGtag = jest.fn();
    w.gtag = mockGtag;

    event({ action: 'purchase', category: 'shop', label: 'free_item', value: 0 });

    expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
      event_category: 'shop',
      event_label: 'free_item',
      value: 0,
    });
  });
});

describe('pageview sequential calls', () => {
  const w = window as unknown as Record<string, unknown>;
  const originalGtag = w.gtag;

  afterEach(() => {
    w.gtag = originalGtag;
  });

  it('tracks multiple sequential pageviews correctly', () => {
    const mockGtag = jest.fn();
    w.gtag = mockGtag;

    pageview('/page1');
    pageview('/page2');

    expect(mockGtag).toHaveBeenCalledTimes(2);
    expect(mockGtag).toHaveBeenNthCalledWith(1, 'config', GA_TRACKING_ID, { page_path: '/page1' });
    expect(mockGtag).toHaveBeenNthCalledWith(2, 'config', GA_TRACKING_ID, { page_path: '/page2' });
  });
});
