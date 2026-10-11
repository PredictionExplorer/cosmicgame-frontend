import { routing } from '@/i18n/routing';

import { inkViewHref, parseInkView, type InkView } from '../inkLinks';

describe('ink artwork links', () => {
  it.each<InkView>(['image', 'short', 'medium', 'slow'])('recognizes %s', (view) => {
    expect(parseInkView(view)).toBe(view);
  });

  it.each([null, '', 'Medium', 'MEDIUM', ' medium ', '30', '2m', 'image.png', '../medium'])(
    'rejects a missing or unrecognized view: %p',
    (view) => {
      expect(parseInkView(view)).toBeNull();
    },
  );

  it.each(routing.locales)('shares each view on the canonical %s detail route', (locale) => {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    for (const view of ['image', 'short', 'medium', 'slow'] as const) {
      expect(inkViewHref(48, locale, view)).toBe(`${prefix}/detail/48?ink=${view}`);
    }
  });

  it('normalizes locale aliases without losing Traditional Chinese regions', () => {
    expect(inkViewHref(0, 'ZH_tw', 'image')).toBe('/zh-TW/detail/0?ink=image');
    expect(inkViewHref(71, 'zh-Hant-HK', 'slow')).toBe('/zh-HK/detail/71?ink=slow');
    expect(inkViewHref(48, 'en-US', 'medium')).toBe('/detail/48?ink=medium');
  });
});
