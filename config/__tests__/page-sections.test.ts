import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { locateSitePath } from '@/config/siteNav';

import {
  PUBLIC_DATA_ROUTES,
  publicDataRouteSection,
} from '../../app/[locale]/(app)/PublicDataRouteSeoSummary';

/**
 * Page headers name the page's section by hand (`<PageHeader section="…">`),
 * and the header navigation and the drawer find it from the taxonomy
 * (`locateSitePath`). The two must agree: /system-event once called itself a
 * Records page while the header and the drawer filed it under Explore.
 *
 * This walks every app route directory, reads the section literals its files
 * pass, and checks each against where the taxonomy places the route.
 */

const APP_GROUP = join(process.cwd(), 'app', '[locale]', '(app)');

/** Route directories whose pages are not in the public taxonomy. */
const OUTSIDE_TAXONOMY = new Set(['admin', 'internal', 'experimental-ui']);

/** Shared components that render a page header, and a route each one heads. */
const SHARED_HEADERS: Readonly<Record<string, string>> = {
  'components/UserStatisticsView.tsx': '/user/0x1',
  'components/tokens/AddressTransferHistory.tsx': '/cosmic-token-transfer/0x1',
  'components/winnings/StellarSelectionHeader.tsx': '/user/stellar-selection-eth/0x1',
  'components/legal/LegalDocument.tsx': '/terms',
};

const SECTION_LITERAL = /\bsection="([a-z]+)"/g;

function sectionLiterals(file: string): string[] {
  return [...readFileSync(file, 'utf8').matchAll(SECTION_LITERAL)].map((match) => match[1]!);
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx$/.test(entry.name) ? [path] : [];
  });
}

/** A public path for a route directory, with a sample value in each dynamic segment. */
function samplePath(file: string): string {
  const segments = relative(APP_GROUP, file).split(sep).slice(0, -1);
  const path = segments.map((segment) => (segment.startsWith('[') ? 'sample' : segment));
  return `/${path.join('/')}`;
}

const cases = sourceFiles(APP_GROUP)
  .filter((file) => !OUTSIDE_TAXONOMY.has(relative(APP_GROUP, file).split(sep)[0]!))
  .flatMap((file) =>
    sectionLiterals(file).map((section) => ({
      file: relative(process.cwd(), file),
      path: samplePath(file),
      section,
    })),
  );

describe('page header sections follow the navigation taxonomy', () => {
  it('finds the hand-written sections (sanity)', () => {
    expect(cases.length).toBeGreaterThan(30);
  });

  it.each(cases)('$file names $path in section "$section"', ({ path, section }) => {
    expect(locateSitePath(path).section).toBe(section);
  });

  it.each(Object.entries(SHARED_HEADERS))('%s heads %s in its taxonomy section', (file, path) => {
    const literals = sectionLiterals(join(process.cwd(), file));
    expect(literals.length).toBeGreaterThan(0);
    for (const section of literals) expect(locateSitePath(path).section).toBe(section);
  });

  it.each(PUBLIC_DATA_ROUTES)('the /%s header names its taxonomy section', (route) => {
    expect(locateSitePath(`/${route}`).section).toBe(publicDataRouteSection(route));
  });

  it('files a system event under Records, beside the coordination changes it belongs to', () => {
    expect(locateSitePath('/system-event/3/100/200')).toMatchObject({
      section: 'records',
      route: { id: 'coordinationChanges' },
      exact: false,
    });
  });
});
