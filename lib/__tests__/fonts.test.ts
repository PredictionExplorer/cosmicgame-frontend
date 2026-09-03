import { routing } from '@/i18n/routing';
import {
  clashDisplay,
  FONT_VARIABLE_CLASS_NAMES,
  inter,
  LOCALE_COMPANION_FONTS,
} from '@/lib/fonts';

describe('locale companion fonts', () => {
  it('records a decision for every routing locale', () => {
    expect(Object.keys(LOCALE_COMPANION_FONTS).sort()).toEqual([...routing.locales].sort());
    // The default locale is Latin-script: Clash Display and Inter cover it.
    expect(LOCALE_COMPANION_FONTS[routing.defaultLocale]).toBeNull();
  });

  it('puts every face the document may need on <html>', () => {
    const classes = FONT_VARIABLE_CLASS_NAMES.split(' ');
    expect(classes).toContain(clashDisplay.variable);
    expect(classes).toContain(inter.variable);
    for (const font of Object.values(LOCALE_COMPANION_FONTS)) {
      if (font) expect(classes).toContain(font.variable);
    }
    expect(new Set(classes).size).toBe(classes.length);
  });
});
