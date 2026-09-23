import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { SCRIPT_PATTERNS } from '@/test-utils/locale-expectations';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, TRANSLATED_LOCALES } from '@/i18n/routing';
import { SITE_NAME, SITE_SHORT_NAME } from '@/utils/seo';

import { buildWebManifest, webManifestPath } from '../build-manifest';

describe('web app manifest', () => {
  it('is linked per locale at the physical [locale] path', () => {
    expect(webManifestPath('en')).toBe('/en/manifest.webmanifest');
    expect(webManifestPath('zh-TW')).toBe('/zh-TW/manifest.webmanifest');
  });

  it.each(routing.locales)('%s installs as one app, in its own language', async (locale) => {
    const manifest = await buildWebManifest(locale);
    const config = getLocaleConfig(locale);
    expect(manifest).toEqual(
      expect.objectContaining({
        id: '/',
        name: SITE_NAME,
        short_name: SITE_SHORT_NAME,
        lang: config.jsonLdInLanguage,
        dir: config.textDirection,
        scope: '/',
        display: 'standalone',
        start_url: locale === routing.defaultLocale ? '/' : `/${locale}`,
      }),
    );
  });

  it.each(TRANSLATED_LOCALES)('%s describes the app in its own script', async (locale) => {
    const { description } = await buildWebManifest(locale);
    expect(description).toMatch(SCRIPT_PATTERNS[locale]);
  });

  // F312: the old manifest splashed a Classic-Blue navy and a cyan toolbar.
  it('opens on the Midnight ground', async () => {
    const manifest = await buildWebManifest('en');
    expect(manifest.background_color).toBe('#090A11');
    expect(manifest.theme_color).toBe('#090A11');
  });

  it('keeps the short name within what a launcher shows', () => {
    expect(SITE_SHORT_NAME.length).toBeLessThanOrEqual(12);
  });

  it('lists PNG install icons, a maskable one, and files that exist', async () => {
    const { icons = [] } = await buildWebManifest('en');
    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: '192x192', type: 'image/png', purpose: 'any' }),
        expect.objectContaining({ sizes: '512x512', type: 'image/png', purpose: 'any' }),
        expect.objectContaining({ sizes: '512x512', type: 'image/png', purpose: 'maskable' }),
      ]),
    );
    for (const { src } of icons) {
      expect(existsSync(join(process.cwd(), 'public', src))).toBe(true);
    }
  });
});
