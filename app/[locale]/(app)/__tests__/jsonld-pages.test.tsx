import { APP_ORIGIN } from '@/lib/hostRouting';

import { render } from '@/test-utils';

import CodePage from '../code/page';
import ContractsPage from '../contracts/page';
import GalleryPage from '../gallery/page';
import HowItWorksPage from '../how-it-works/page';
import SiteMapRoutePage from '../site-map/page';

jest.mock('../how-it-works/HowToPlayPage', () => ({
  __esModule: true,
  default: () => <div data-testid="page-body" />,
}));
jest.mock('../gallery/GalleryPage', () => ({
  __esModule: true,
  default: () => <div data-testid="page-body" />,
}));
jest.mock('../gallery/GallerySeoSummary', () => ({
  GallerySeoSummary: () => <div data-testid="seo-summary" />,
}));
jest.mock('../contracts/Contracts', () => ({
  __esModule: true,
  default: () => <div data-testid="page-body" />,
}));
jest.mock('../contracts/ContractsSeoSummary', () => ({
  ContractsSeoSummary: () => <div data-testid="seo-summary" />,
}));
jest.mock('../code/CodeViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="page-body" />,
}));
jest.mock('../code/CodeSeoSummary', () => ({
  CodeSeoSummary: () => <div data-testid="seo-summary" />,
}));
jest.mock('../site-map/SiteMapPage', () => ({
  __esModule: true,
  default: () => <div data-testid="page-body" />,
}));

/**
 * Structured-data contract for the content pages that gained page-level
 * JSON-LD in the SEO upgrade. Heavy page bodies are stubbed; the assertions
 * target exactly what crawlers read — the ld+json script payloads.
 */

interface JsonLdNode {
  '@type'?: string;
  name?: string;
  description?: string;
  inLanguage?: string;
  url?: string;
  itemListElement?: Array<{ item?: string }>;
}

function renderJsonLd(ui: React.ReactElement): JsonLdNode[] {
  const { container, unmount } = render(ui);
  const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
  const nodes = scripts.flatMap((script) => {
    const parsed = JSON.parse(script.textContent ?? '') as JsonLdNode | JsonLdNode[];
    return Array.isArray(parsed) ? parsed : [parsed];
  });
  unmount();
  return nodes;
}

/**
 * Locale-aware pages (Sprint 3) export async components that take `params`;
 * pre-i18n pages still render synchronously. Each case provides a factory so
 * both shapes share the assertions.
 */
const cases: Array<{
  name: string;
  renderPage: (locale?: string) => Promise<React.ReactElement> | React.ReactElement;
  expectedType: string;
  expectedUrl: string;
}> = [
  {
    name: 'how-it-works',
    renderPage: (locale = 'en') => HowItWorksPage({ params: Promise.resolve({ locale }) }),
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/how-it-works`,
  },
  {
    name: 'gallery',
    renderPage: (locale = 'en') => GalleryPage({ params: Promise.resolve({ locale }) }),
    expectedType: 'CollectionPage',
    expectedUrl: `${APP_ORIGIN}/gallery`,
  },
  {
    name: 'contracts',
    renderPage: (locale = 'en') => ContractsPage({ params: Promise.resolve({ locale }) }),
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/contracts`,
  },
  {
    name: 'code',
    renderPage: (locale = 'en') => CodePage({ params: Promise.resolve({ locale }) }),
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/code`,
  },
];

describe.each(cases)('$name page JSON-LD', ({ renderPage, expectedType, expectedUrl }) => {
  it(`emits ${expectedType} pointing at its canonical URL`, async () => {
    const nodes = renderJsonLd(await renderPage());
    const pageNode = nodes.find((node) => node['@type'] === expectedType);
    expect(pageNode).toBeDefined();
    expect(pageNode!.url).toBe(expectedUrl);
  });

  it('emits a BreadcrumbList that starts at the app home', async () => {
    const nodes = renderJsonLd(await renderPage());
    const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb!.itemListElement?.[0]?.item).toBe(`${APP_ORIGIN}/`);
    expect(breadcrumb!.itemListElement?.[1]?.item).toBe(expectedUrl);
  });

  it('renders the page body alongside the structured data', async () => {
    const { getByTestId, unmount } = render(await renderPage());
    expect(getByTestId('page-body')).toBeInTheDocument();
    unmount();
  });

  it('emits Chinese copy, language, and locale-correct URLs', async () => {
    const nodes = renderJsonLd(await renderPage('zh'));
    const pageNode = nodes.find((node) => node['@type'] === expectedType);
    const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    const zhUrl = expectedUrl.replace(APP_ORIGIN, `${APP_ORIGIN}/zh`);

    expect(pageNode).toEqual(
      expect.objectContaining({
        inLanguage: 'zh-Hans',
        url: zhUrl,
      }),
    );
    expect(`${pageNode?.name ?? ''}${pageNode?.description ?? ''}`).toMatch(/[\u3400-\u9fff]/);
    expect(breadcrumb).not.toHaveProperty('inLanguage');
    expect(breadcrumb?.itemListElement?.[0]?.item).toBe(`${APP_ORIGIN}/zh/`);
    expect(breadcrumb?.itemListElement?.at(-1)?.item).toBe(zhUrl);
  });
});

describe('site-map page JSON-LD', () => {
  async function renderSiteMap(locale = 'en') {
    const page = await SiteMapRoutePage({
      params: Promise.resolve({ locale }),
    });
    return { page, nodes: renderJsonLd(page) };
  }

  it('emits a WebPage pointing at its canonical URL', async () => {
    const { nodes } = await renderSiteMap();
    const pageNode = nodes.find((node) => node['@type'] === 'WebPage');
    expect(pageNode?.url).toBe(`${APP_ORIGIN}/site-map`);
  });

  it('emits a BreadcrumbList that starts at the app home', async () => {
    const { nodes } = await renderSiteMap();
    const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    expect(breadcrumb?.itemListElement?.[0]?.item).toBe(`${APP_ORIGIN}/`);
    expect(breadcrumb?.itemListElement?.[1]?.item).toBe(`${APP_ORIGIN}/site-map`);
  });

  it('renders the page body alongside the structured data', async () => {
    const { page } = await renderSiteMap();
    const { getByTestId } = render(page);
    expect(getByTestId('page-body')).toBeInTheDocument();
  });

  it('localizes the site-map schema for Chinese', async () => {
    const { nodes } = await renderSiteMap('zh');
    const pageNode = nodes.find((node) => node['@type'] === 'WebPage');
    const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    expect(pageNode).toEqual(
      expect.objectContaining({
        inLanguage: 'zh-Hans',
        url: `${APP_ORIGIN}/zh/site-map`,
      }),
    );
    expect(`${pageNode?.name ?? ''}${pageNode?.description ?? ''}`).toMatch(/[\u3400-\u9fff]/);
    expect(breadcrumb).not.toHaveProperty('inLanguage');
    expect(breadcrumb?.itemListElement?.[1]?.item).toBe(`${APP_ORIGIN}/zh/site-map`);
  });
});
