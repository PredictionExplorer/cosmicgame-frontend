import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { HOME_SEED_REVALIDATE_SECONDS } from '@/services/api/server';

/**
 * Rendering-policy contract for the high-traffic app routes.
 *
 * The app home is the busiest page in the project. It regressed to fully
 * dynamic rendering once before (a `headers()` call plus uncached axios
 * reads), which meant every pageview paid a serverless invocation and
 * multi-second TTFB on cold starts. These source-level assertions lock the
 * ISR setup so a well-meaning refactor cannot silently reintroduce that.
 */

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..');

function readSource(relPath: string): string {
  return readFileSync(resolve(REPO_ROOT, relPath), 'utf-8');
}

describe('app home rendering policy (ISR, no request state)', () => {
  const source = readSource('app/[locale]/(app)/page.tsx');

  it('never reads request state, which would force dynamic rendering', () => {
    expect(source).not.toContain('next/headers');
    expect(source).not.toMatch(/\bheaders\(\)/);
    expect(source).not.toMatch(/\bcookies\(\)/);
  });

  it('declares an ISR revalidation window in sync with the seed fetches', () => {
    expect(source).toMatch(
      new RegExp(`export const revalidate = ${HOME_SEED_REVALIDATE_SECONDS};`),
    );
    expect(source).not.toContain("dynamic = 'force-dynamic'");
  });

  it('reads its seed data through the cached server module, not axios', () => {
    expect(source).toContain("from '@/services/api/server'");
    expect(source).not.toMatch(/from 'axios'/);
  });

  it('never wraps the home page in Suspense — CSR bailouts must fail the build', () => {
    expect(source).not.toContain('<Suspense');
  });
});

describe('home page client component rendering policy', () => {
  const source = readSource('app/[locale]/(app)/HomePage.tsx');

  it('never uses useSearchParams, which bails static pages to client rendering', () => {
    // On a statically generated route, useSearchParams discards the entire
    // server-rendered HTML inside the nearest Suspense boundary — the exact
    // LCP/CLS regression the ISR migration fixed. Deep links read
    // window.location in an effect instead.
    expect(source).not.toContain('useSearchParams');
  });

  it('keeps the redesigned masthead clear of the fixed header', () => {
    expect(source).toContain('home-control-shell');
    // The exact gap may change during visual refinement. Preserve the
    // header-aware clearance; viewport geometry is exercised in browser tests.
    expect(source).toMatch(/pt-\[calc\(var\(--header-height\)\+[\d.]+rem\)\]/);
    expect(source).toMatch(/max-sm:pt-\[calc\(var\(--header-height\)\+[\d.]+rem\)\]/);
  });

  it('restores safe clearance when the maintenance banner is present', () => {
    const header = readSource('components/layout/Header.tsx');
    const globalCss = readSource('styles/global.css');

    expect(header).toContain('data-maintenance-banner');
    expect(globalCss).toContain('body:has([data-maintenance-banner]) .home-control-shell');
    expect(globalCss).toContain('calc(var(--header-height) + 3.75rem)');
  });
});

describe('server seed module policy', () => {
  const source = readSource('services/api/server.ts');

  it('uses fetch with next.revalidate so reads land in the Data Cache', () => {
    expect(source).toMatch(/next: \{ revalidate: /);
    expect(source).not.toMatch(/from 'axios'/);
  });

  it('dedupes per-render reads with React cache()', () => {
    expect(source).toMatch(/import \{ cache \} from 'react'/);
    expect(source).toMatch(/cache\(async/);
  });
});

describe('high-traffic detail routes stay cacheable', () => {
  const routes = [
    'app/[locale]/(app)/detail/[id]/page.tsx',
    'app/[locale]/(app)/gesture/[id]/page.tsx',
    'app/[locale]/(app)/allocation/[id]/page.tsx',
    'app/[locale]/(app)/user/[address]/page.tsx',
  ];

  it.each(routes)('%s exports a revalidate window and is not force-dynamic', (route) => {
    const source = readSource(route);
    expect(source).toMatch(/export const revalidate = \d+;/);
    expect(source).not.toContain("dynamic = 'force-dynamic'");
    expect(source).not.toContain('next/headers');
  });
});
