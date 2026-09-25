import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(process.cwd(), 'app');

/** Every page.tsx under `dir`. */
function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return pages(full);
    return entry === 'page.tsx' ? [full] : [];
  });
}

/** A page rendered on demand for the cache: params it does not know at build time, and ISR. */
const isOnDemandIsr = (source: string) =>
  /export function generateStaticParams\(\)\s*{\s*return \[\];?\s*}/.test(source) &&
  /export const revalidate\s*=/.test(source);

/** The loading boundaries that wrap a page: its own segment's and every parent segment's. */
function loadingBoundaries(page: string): string[] {
  const out: string[] = [];
  for (let dir = path.dirname(page); dir.startsWith(APP_DIR); dir = path.dirname(dir)) {
    const loading = path.join(dir, 'loading.tsx');
    if (existsSync(loading)) out.push(loading);
    if (dir === APP_DIR) break;
  }
  return out;
}

describe('on-demand ISR routes', () => {
  // Regression: /user/[address] opted into ISR while its loading.tsx translated its copy. A
  // loading boundary gets no params, so next-intl read the locale from the request headers,
  // which a cached render cannot do: every profile answered 500 (DYNAMIC_SERVER_USAGE).
  const routes = pages(APP_DIR).filter((page) => isOnDemandIsr(readFileSync(page, 'utf8')));

  it('finds the profile among them', () => {
    expect(routes.some((page) => page.includes(path.join('user', '[address]')))).toBe(true);
  });

  it.each(routes.map((page) => [path.relative(process.cwd(), page), page]))(
    '%s has no loading boundary that reads the request locale',
    (_name, page) => {
      for (const loading of loadingBoundaries(page)) {
        expect({ loading, source: readFileSync(loading, 'utf8') }).not.toEqual(
          expect.objectContaining({ source: expect.stringMatching(/from 'next-intl/) }),
        );
      }
    },
  );
});
