import zhMeta from '@/messages/zh/meta.json';

import { APP_ORIGIN } from '@/lib/hostRouting';

import { render } from '@/test-utils';

import Page, { generateMetadata } from '../page';

jest.mock('../SiteMapPage', () => ({
  __esModule: true,
  default: () => <div data-testid="site-map-body" />,
}));

describe('localized site-map route', () => {
  it('activates Chinese canonical and hreflang metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'zh' }),
    });

    expect(metadata.title).toBe(zhMeta.siteMap.title);
    expect(metadata.description).toBe(zhMeta.siteMap.description);
    expect(metadata.alternates).toEqual({
      canonical: `${APP_ORIGIN}/zh/site-map`,
      languages: {
        en: `${APP_ORIGIN}/site-map`,
        zh: `${APP_ORIGIN}/zh/site-map`,
        'x-default': `${APP_ORIGIN}/site-map`,
      },
    });
  });

  it('uses locale-correct URLs in Chinese structured data', async () => {
    const ui = await Page({
      params: Promise.resolve({ locale: 'zh' }),
    });
    const { container } = render(ui);
    const script = container.querySelector('script[type="application/ld+json"]');
    const nodes = JSON.parse(script?.textContent ?? '[]') as Array<{
      '@type'?: string;
      url?: string;
      itemListElement?: Array<{ item?: string }>;
    }>;

    expect(nodes.find((node) => node['@type'] === 'WebPage')?.url).toBe(
      `${APP_ORIGIN}/zh/site-map`,
    );
    expect(nodes.find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: `${APP_ORIGIN}/zh/` }),
        expect.objectContaining({ item: `${APP_ORIGIN}/zh/site-map` }),
      ]),
    );
  });
});
