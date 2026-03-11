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
});
