import { readFile } from 'node:fs/promises';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

/**
 * Faces the share cards embed. Satori (next/og) renders only the fonts it is
 * handed, so every card loads the site's own faces: Clash Display for Latin
 * titles, Inter for everything else, JetBrains Mono for token numbers and
 * addresses, and the companion face each script needs (Onest for Cyrillic
 * and Vietnamese titles, the regional Noto Sans CJK cut for Chinese, Korean
 * and Japanese), at the weights the site sets them in.
 *
 * Subsets (`source: 'subset'`) are cut by `npm run og:fonts`
 * (scripts/build-og-fonts.ts) from pinned google/fonts sources, covering the
 * OG copy of `messages/<locale>/seo.json` (and its uppercase forms); Clash
 * Display ships unmodified from public/fonts (`source: 'verbatim'`).
 * lib/og/__tests__/og-localization.test.ts fails when a locale's stacks stop
 * covering its copy. Licenses: THIRD_PARTY_NOTICES.md.
 */
export interface OgFontFile {
  /** Family name the card's CSS refers to. */
  readonly family: string;
  readonly weight: 400 | 500 | 700;
  readonly file: URL;
  /**
   * Repository path of the license text shipped with the file (Clash
   * Display's terms are in THIRD_PARTY_NOTICES.md).
   */
  readonly license: string | null;
  /** `subset`: cut by `npm run og:fonts`; `verbatim`: the vendor's file, unmodified. */
  readonly source: 'subset' | 'verbatim';
}

/**
 * Where a line may break.
 *   - `anywhere`: between any two characters (Chinese; Latin at spaces).
 *   - `words`: only at spaces, never inside a word (Korean, like the site's
 *     `word-break: keep-all`).
 *   - `phrases`: only between phrases (Japanese titles, like the site's
 *     `word-break: auto-phrase`).
 */
export type OgLineBreak = 'anywhere' | 'words' | 'phrases';

export interface OgTypography {
  /** Title stack in fallback order: the Latin face first, then the script face. */
  readonly display: readonly OgFontFile[];
  /** Title weight: the site's heading weight for the script. */
  readonly displayWeight: 500 | 700;
  /** Eyebrow, subhead, fact line and footer stack. */
  readonly body: readonly OgFontFile[];
  /**
   * Han, Hangul or kana: no uppercase, no tracking, no negative title
   * letter-spacing (the site's `html:lang(zh|ko|ja)` heading rules).
   */
  readonly cjk: boolean;
  readonly titleBreak: OgLineBreak;
  readonly subheadBreak: OgLineBreak;
}

/*
 * Every file is addressed by a literal `new URL('…', import.meta.url)`: the
 * bundler emits exactly that file next to the server code. A URL built from a
 * template (`${name}`) makes Turbopack resolve a whole directory to a single
 * guessed file, so the cards would read the wrong face (or an .eot).
 */

const subset = (
  family: string,
  weight: OgFontFile['weight'],
  file: URL,
  license: string,
): OgFontFile => ({ family, weight, file, license: `assets/fonts/${license}`, source: 'subset' });

const NOTO_CJK_LICENSE = 'OFL-NotoSansCJK.txt';

/** The site's display face (styles/typography.css `type-display-*`: Clash Display 500). */
export const CLASH_DISPLAY_500: OgFontFile = {
  family: 'Clash Display',
  weight: 500,
  file: new URL('../../public/fonts/ClashDisplay/fonts/ClashDisplay-Medium.ttf', import.meta.url),
  license: null,
  source: 'verbatim',
};

/** Latin runs inside CJK titles, which the site sets at 700 (styles/global.css). */
export const CLASH_DISPLAY_700: OgFontFile = {
  family: 'Clash Display',
  weight: 700,
  file: new URL('../../public/fonts/ClashDisplay/fonts/ClashDisplay-Bold.ttf', import.meta.url),
  license: null,
  source: 'verbatim',
};

/** Body face in every locale: Latin, Cyrillic and Vietnamese (lib/fonts.ts `inter`). */
export const INTER_400 = subset(
  'Inter',
  400,
  new URL('../../assets/fonts/Inter-400.subset.ttf', import.meta.url),
  'OFL-Inter.txt',
);
export const INTER_500 = subset(
  'Inter',
  500,
  new URL('../../assets/fonts/Inter-500.subset.ttf', import.meta.url),
  'OFL-Inter.txt',
);

/** Token numbers and addresses. */
export const JETBRAINS_MONO_500 = subset(
  'JetBrains Mono',
  500,
  new URL('../../assets/fonts/JetBrainsMono-500.subset.ttf', import.meta.url),
  'OFL-JetBrainsMono.txt',
);

/**
 * Ukrainian and Vietnamese titles: Clash Display has no Cyrillic and few
 * Vietnamese letters, so the whole display stack is Onest, as on the site.
 */
export const ONEST_500 = subset(
  'Onest',
  500,
  new URL('../../assets/fonts/Onest-500.subset.ttf', import.meta.url),
  'OFL-Onest.txt',
);

const NOTO_SC_700 = subset(
  'Noto Sans SC',
  700,
  new URL('../../assets/fonts/NotoSansSC-700.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_SC_400 = subset(
  'Noto Sans SC',
  400,
  new URL('../../assets/fonts/NotoSansSC-400.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_TC_700 = subset(
  'Noto Sans TC',
  700,
  new URL('../../assets/fonts/NotoSansTC-700.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_TC_400 = subset(
  'Noto Sans TC',
  400,
  new URL('../../assets/fonts/NotoSansTC-400.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_HK_700 = subset(
  'Noto Sans HK',
  700,
  new URL('../../assets/fonts/NotoSansHK-700.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_HK_400 = subset(
  'Noto Sans HK',
  400,
  new URL('../../assets/fonts/NotoSansHK-400.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_KR_700 = subset(
  'Noto Sans KR',
  700,
  new URL('../../assets/fonts/NotoSansKR-700.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_KR_400 = subset(
  'Noto Sans KR',
  400,
  new URL('../../assets/fonts/NotoSansKR-400.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_JP_700 = subset(
  'Noto Sans JP',
  700,
  new URL('../../assets/fonts/NotoSansJP-700.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);
const NOTO_JP_400 = subset(
  'Noto Sans JP',
  400,
  new URL('../../assets/fonts/NotoSansJP-400.subset.ttf', import.meta.url),
  NOTO_CJK_LICENSE,
);

const BODY_LATIN = [INTER_400, INTER_500] as const;

/**
 * A CJK locale: Latin runs in Clash Display / Inter like the site, the rest in
 * the regional Noto Sans cut whose glyph forms match the locale's standard.
 */
const cjk = (
  notoBold: OgFontFile,
  notoRegular: OgFontFile,
  breaks: Pick<OgTypography, 'titleBreak' | 'subheadBreak'>,
): OgTypography => ({
  display: [CLASH_DISPLAY_700, notoBold],
  displayWeight: 700,
  body: [...BODY_LATIN, notoRegular],
  cjk: true,
  ...breaks,
});

const alphabetic = (...display: OgFontFile[]): OgTypography => ({
  display,
  displayWeight: 500,
  body: BODY_LATIN,
  cjk: false,
  titleBreak: 'anywhere',
  subheadBreak: 'anywhere',
});

/**
 * One entry per locale: adding a locale to routing.locales fails to compile
 * here until its share-card typography is decided.
 */
export const OG_TYPOGRAPHY: LocaleRecord<OgTypography> = {
  // Inter backs Clash Display for the few ASCII marks it lacks (the backtick)
  // and for any letter a token name brings from another script.
  en: alphabetic(CLASH_DISPLAY_500, INTER_500),
  // Chinese breaks between any two characters, on the site and here.
  zh: cjk(NOTO_SC_700, NOTO_SC_400, { titleBreak: 'anywhere', subheadBreak: 'anywhere' }),
  'zh-TW': cjk(NOTO_TC_700, NOTO_TC_400, { titleBreak: 'anywhere', subheadBreak: 'anywhere' }),
  'zh-HK': cjk(NOTO_HK_700, NOTO_HK_400, { titleBreak: 'anywhere', subheadBreak: 'anywhere' }),
  uk: alphabetic(ONEST_500),
  // Korean is space-delimited: a word never splits between syllables.
  ko: cjk(NOTO_KR_700, NOTO_KR_400, { titleBreak: 'words', subheadBreak: 'words' }),
  // Japanese titles break between phrases; running text keeps per-character breaking.
  ja: cjk(NOTO_JP_700, NOTO_JP_400, { titleBreak: 'phrases', subheadBreak: 'anywhere' }),
  vi: alphabetic(ONEST_500),
};

/**
 * Faces every locale loads regardless of script: the wordmark (the brand is
 * written in Latin letters everywhere) and the mono face.
 */
export const OG_SHARED_FONTS: readonly OgFontFile[] = [CLASH_DISPLAY_500, JETBRAINS_MONO_500];

/** OG typography for a locale. */
export function getOgTypography(locale: string | undefined): OgTypography {
  return pickByLocale(OG_TYPOGRAPHY, locale);
}

/** CSS `font-family` value for a stack. */
export function fontFamily(stack: readonly OgFontFile[]): string {
  return Array.from(new Set(stack.map(({ family }) => `'${family}'`))).join(', ');
}

/** Every distinct file a locale's cards embed. */
export function ogFontFiles(locale: string | undefined): OgFontFile[] {
  const { display, body } = getOgTypography(locale);
  const byPath = new Map<string, OgFontFile>();
  for (const font of [...display, ...body, ...OG_SHARED_FONTS]) byPath.set(font.file.href, font);
  return Array.from(byPath.values());
}

const fontData = new Map<string, Promise<ArrayBuffer>>();

function loadFont(font: OgFontFile): Promise<ArrayBuffer> {
  let data = fontData.get(font.file.href);
  if (!data) {
    data = readFile(font.file).then(
      (buffer) =>
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer,
    );
    // A failed read must not poison the cache for the next render.
    data.catch(() => fontData.delete(font.file.href));
    fontData.set(font.file.href, data);
  }
  return data;
}

export interface OgFontConfig {
  name: string;
  data: ArrayBuffer;
  weight: OgFontFile['weight'];
  style: 'normal';
}

/** `ImageResponse` font config for the locale. */
export async function getOgFontConfig(locale: string | undefined): Promise<OgFontConfig[]> {
  return Promise.all(
    ogFontFiles(locale).map(async (font) => ({
      name: font.family,
      data: await loadFont(font),
      weight: font.weight,
      style: 'normal' as const,
    })),
  );
}
