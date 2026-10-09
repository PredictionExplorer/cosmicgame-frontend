import { routing } from '@/i18n/routing';
import {
  clashDisplay,
  FONT_VARIABLE_CLASS_NAMES,
  inter,
  jetbrainsMono,
  LOCALE_COMPANION_FONTS,
} from '@/lib/fonts';

describe('locale companion fonts', () => {
  it('records a decision for every routing locale', () => {
    expect(Object.keys(LOCALE_COMPANION_FONTS).sort()).toEqual([...routing.locales].sort());
    // The default locale is Latin-script: Clash Display and Inter cover it.
    expect(LOCALE_COMPANION_FONTS[routing.defaultLocale]).toBeNull();
  });

  it('gives each companion face one family, variable and module', () => {
    const faces = Object.values(LOCALE_COMPANION_FONTS).filter((face) => face !== null);
    const byId = new Map(faces.map((face) => [face.id, face]));
    // A face shared by two locales (Onest) is the same descriptor object.
    for (const face of faces) expect(byId.get(face.id)).toBe(face);
    const variables = [...byId.values()].map((face) => face.variable);
    expect(new Set(variables).size).toBe(variables.length);
    for (const face of byId.values()) expect(face.variable).toMatch(/^--font-[a-z-]+$/);
  });

  it('puts only the faces every page loads on <html>', () => {
    // Companion faces need no class: styles/global.css names their families,
    // and their @font-face rules load on their own locale's pages only.
    expect(FONT_VARIABLE_CLASS_NAMES.split(' ')).toEqual([
      clashDisplay.variable,
      inter.variable,
      jetbrainsMono.variable,
    ]);
  });
});
