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

const cases: Array<{
  name: string;
  page: React.ReactElement;
  expectedType: string;
  expectedUrl: string;
}> = [
  {
    name: 'how-it-works',
    page: <HowItWorksPage />,
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/how-it-works`,
  },
  {
    name: 'gallery',
    page: <GalleryPage />,
    expectedType: 'CollectionPage',
    expectedUrl: `${APP_ORIGIN}/gallery`,
  },
  {
    name: 'contracts',
    page: <ContractsPage />,
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/contracts`,
  },
  {
    name: 'code',
    page: <CodePage />,
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/code`,
  },
  {
    name: 'site-map',
    page: <SiteMapRoutePage />,
    expectedType: 'WebPage',
    expectedUrl: `${APP_ORIGIN}/site-map`,
  },
];

describe.each(cases)('$name page JSON-LD', ({ page, expectedType, expectedUrl }) => {
  it(`emits ${expectedType} pointing at its canonical URL`, () => {
    const nodes = renderJsonLd(page);
    const pageNode = nodes.find((node) => node['@type'] === expectedType);
    expect(pageNode).toBeDefined();
    expect(pageNode!.url).toBe(expectedUrl);
  });

  it('emits a BreadcrumbList that starts at the app home', () => {
    const nodes = renderJsonLd(page);
    const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb!.itemListElement?.[0]?.item).toBe(`${APP_ORIGIN}/`);
    expect(breadcrumb!.itemListElement?.[1]?.item).toBe(expectedUrl);
  });

  it('renders the page body alongside the structured data', () => {
    const { getByTestId, unmount } = render(page);
    expect(getByTestId('page-body')).toBeInTheDocument();
    unmount();
  });
});
