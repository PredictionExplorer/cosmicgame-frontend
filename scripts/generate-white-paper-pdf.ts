#!/usr/bin/env tsx
/**
 * Generates the committed white paper PDFs from the content modules, so the
 * web pages at /white-paper and the PDFs can never drift apart.
 *
 *   npm run white-paper:pdf              # every locale
 *   npm run white-paper:pdf -- --locale zh
 *
 * Pipeline: content/white-paper (structure.ts + text.<locale>.ts) -> pandoc
 * markdown -> tectonic (XeLaTeX) ->
 * public/white-paper/cosmic-signature-white-paper-v<x>[-<locale>].pdf
 *
 * Requires `pandoc` and `tectonic` on PATH (both available via Homebrew).
 * Most non-Latin builds use macOS system fonts: the Chinese build sets Songti SC
 * and PingFang SC through xeCJK, the Ukrainian build sets Cyrillic-capable
 * Times New Roman / Helvetica Neue through fontspec (Latin Modern, pandoc's
 * default, has no Cyrillic glyphs). Japanese and Korean embed regular and bold
 * Noto Sans JP/KR subsets from the pinned Google Fonts source used by the OG font builder;
 * this avoids system CID fonts that some PDF readers cannot resolve.
 * Rerun after any change to a content module (each run records the digest
 * of its source in content/white-paper/pdf-manifest.json, and a test fails
 * while a PDF lags its content), and bump WHITE_PAPER_VERSION in
 * content/white-paper/types.ts for substantive revisions so older copies
 * stay citable. The markdown itself is built in white-paper-pdf-core.ts.
 */

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

import subsetFont from 'subset-font';

import {
  whitePaperContentEn,
  whitePaperContentJa,
  whitePaperContentKo,
  whitePaperContentUk,
  whitePaperContentVi,
  whitePaperContentZh,
  whitePaperContentZhHk,
  whitePaperContentZhTw,
} from '../content/white-paper';
import {
  WHITE_PAPER_DATE_DISPLAY,
  whitePaperPdfPath,
  type WhitePaperContent,
} from '../content/white-paper/types';
import { isAppLocale, type AppLocale, type LocaleRecord } from '../i18n/locale';
import { routing } from '../i18n/routing';

import { GOOGLE_FONTS_COMMIT, type FontSource } from './build-og-fonts-core';
import { uncoveredCharacters } from './font-cmap';
import {
  WHITE_PAPER_PDF_MANIFEST_PATH,
  paperSourceSha256,
  paperTitleMetadata,
  renderPaperBody,
  type WhitePaperPdfManifest,
  type WhitePaperPdfManifestEntry,
} from './white-paper-pdf-core';

const ROOT = resolve(process.cwd());

interface LocaleBuild {
  content: WhitePaperContent;
  dateDisplay: string;
  tocTitle: string;
  headerIncludes: readonly string[];
  /** An embeddable font, subset at body and heading weights from all of this paper's copy. */
  embeddedCjkFont?: FontSource;
  /** Width used by pandoc to choose whether table columns need wrapping. */
  markdownColumns?: number;
  /** pandoc `lang` metadata (polyglossia hyphenation + typography); omitted when unset. */
  lang?: string;
}

const BASE_HEADER_INCLUDES = [
  '\\usepackage{microtype}',
  '\\usepackage{etoolbox}',
  '\\AtBeginEnvironment{longtable}{\\small}',
  '\\setlength{\\emergencystretch}{3em}',
  '\\usepackage{needspace}',
  '\\pretocmd{\\section}{\\needspace{5\\baselineskip}}{}{}',
] as const;

// One build per app locale: adding a locale to routing.locales fails to
// compile here until its PDF typography is decided. Output paths derive from
// the locale (whitePaperPdfPath), so only typography needs a decision.
const BUILDS: LocaleRecord<LocaleBuild> = {
  en: {
    content: whitePaperContentEn,
    dateDisplay: WHITE_PAPER_DATE_DISPLAY,
    tocTitle: 'Contents',
    headerIncludes: BASE_HEADER_INCLUDES,
  },
  zh: {
    content: whitePaperContentZh,
    dateDisplay: '2026\u5e748\u6708',
    tocTitle: '\u76ee\u5f55',
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // macOS system CJK fonts; xeCJK owns CJK line breaking and punctuation.
      '\\usepackage{xeCJK}',
      '\\setCJKmainfont{Songti SC}',
      '\\setCJKsansfont{PingFang SC}',
      '\\setCJKmonofont{PingFang SC}',
      '\\renewcommand{\\abstractname}{\u6458\u8981}',
    ],
  },
  'zh-TW': {
    content: whitePaperContentZhTw,
    dateDisplay: '2026\u5e748\u6708',
    tocTitle: '\u76ee\u9304',
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // Taiwan glyph standard: the TC cuts of the macOS system CJK fonts.
      '\\usepackage{xeCJK}',
      '\\setCJKmainfont{Songti TC}',
      '\\setCJKsansfont{PingFang TC}',
      '\\setCJKmonofont{PingFang TC}',
      '\\renewcommand{\\abstractname}{\u6458\u8981}',
    ],
  },
  'zh-HK': {
    content: whitePaperContentZhHk,
    dateDisplay: '2026\u5e748\u6708',
    tocTitle: '\u76ee\u9304',
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // Hong Kong glyph standard for sans (PingFang HK); Songti ships no HK
      // cut, so body serif falls back to the Traditional (TC) forms.
      '\\usepackage{xeCJK}',
      '\\setCJKmainfont{Songti TC}',
      '\\setCJKsansfont{PingFang HK}',
      '\\setCJKmonofont{PingFang HK}',
      '\\renewcommand{\\abstractname}{\u6458\u8981}',
    ],
  },
  uk: {
    content: whitePaperContentUk,
    dateDisplay: '\u0441\u0435\u0440\u043f\u0435\u043d\u044c 2026',
    tocTitle: '\u0417\u043c\u0456\u0441\u0442',
    lang: 'uk',
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // macOS system fonts with full Cyrillic coverage; Latin Modern has none.
      // Formula blocks are typeset as code, so the mono face needs Cyrillic too
      // («де T = 20 хвилин»).
      '\\setmainfont{Times New Roman}',
      '\\setsansfont{Helvetica Neue}',
      '\\setmonofont[Scale=MatchLowercase]{Menlo}',
      '\\renewcommand{\\abstractname}{\u0410\u043d\u043e\u0442\u0430\u0446\u0456\u044f}',
    ],
  },
  ko: {
    content: whitePaperContentKo,
    dateDisplay: '2026\ub144 8\uc6d4',
    tocTitle: '\ubaa9\ucc28',
    embeddedCjkFont: { path: 'ofl/notosanskr/NotoSansKR[wght].ttf' },
    markdownColumns: 80,
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // Korean separates words with
      // spaces, which xeCJK must be told to keep (CJKspace); its punctuation
      // handling stays plain because Korean uses ASCII marks; and the
      // automatic CJK–Latin glue is switched off, because Korean counters
      // attach to digits (10개, 2026년) and Latin tokens already carry real
      // spaces in the copy.
      '\\usepackage{xeCJK}',
      '\\xeCJKsetup{CJKspace=true, PunctStyle=plain, CJKecglue={}}',
      '\\renewcommand{\\abstractname}{\uc694\uc57d}',
    ],
  },
  ja: {
    content: whitePaperContentJa,
    dateDisplay: '2026\u5e748\u6708',
    tocTitle: '\u76ee\u6b21',
    embeddedCjkFont: { path: 'ofl/notosansjp/NotoSansJP[wght].ttf' },
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // The regular and bold fonts are prepared from this paper's full copy.
      // CJK–Latin glue stays off because Japanese and Latin tokens run
      // together without spaces (style-guide-ja §4).
      '\\usepackage{xeCJK}',
      '\\xeCJKsetup{CJKecglue={}}',
      '\\renewcommand{\\abstractname}{\u6982\u8981}',
    ],
  },
  vi: {
    content: whitePaperContentVi,
    dateDisplay: 'th\u00e1ng 8 n\u0103m 2026',
    tocTitle: 'M\u1ee5c l\u1ee5c',
    lang: 'vi',
    headerIncludes: [
      ...BASE_HEADER_INCLUDES,
      // macOS system fonts with full Vietnamese coverage (stacked diacritics,
      // horned Ơ/Ư); Latin Modern has none. The same faces as the Ukrainian
      // build, so the two alphabetic papers share one typographic voice.
      '\\setmainfont{Times New Roman}',
      '\\setsansfont{Helvetica Neue}',
      '\\setmonofont[Scale=MatchLowercase]{Menlo}',
      '\\renewcommand{\\abstractname}{T\u00f3m t\u1eaft}',
    ],
  },
};

/**
 * Embed static TrueType subsets rather than relying on a reader's CJK language
 * packs. The small OG subsets are unsuitable here: body copy needs many more
 * glyphs, and the paper uses both regular and bold text.
 */
async function prepareCjkFonts(build: LocaleBuild, tempDir: string): Promise<LocaleBuild> {
  const source = build.embeddedCjkFont;
  if (!source) return build;

  const cacheDir = join(ROOT, 'node_modules', '.cache', 'og-fonts', GOOGLE_FONTS_COMMIT);
  const cachePath = join(cacheDir, basename(source.path));
  let font: Buffer;
  if (existsSync(cachePath)) {
    font = readFileSync(cachePath);
  } else {
    const url = `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/${encodeURI(source.path)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Font download failed: ${response.status} (${url})`);
    font = Buffer.from(await response.arrayBuffer());
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, font);
  }

  const printableAscii = Array.from({ length: 95 }, (_, index) =>
    String.fromCharCode(index + 32),
  ).join('');
  // A formula's notation and its legend symbols are typeset as math
  // (white-paper-pdf-core.ts), in the math font, never in this face.
  const copy = JSON.stringify(build.content, (key: string, value: unknown) =>
    key === 'notation' || key === 'symbol' ? undefined : value,
  );
  const text = Array.from(
    new Set(`${copy}${build.dateDisplay}${build.tocTitle}${printableAscii}`),
  ).join('');
  for (const [style, weight] of [
    ['regular', 400],
    ['bold', 700],
  ] as const) {
    const subset = await subsetFont(font, text, {
      targetFormat: 'sfnt',
      variationAxes: { wght: weight },
    });
    const missing = uncoveredCharacters(subset, text);
    if (missing.length) throw new Error(`PDF font lacks glyphs: ${missing.join(' ')}`);
    writeFileSync(join(tempDir, `paper-cjk-${style}.ttf`), subset);
  }

  const options = `Path={${tempDir}/},BoldFont=paper-cjk-bold.ttf,ItalicFont=paper-cjk-regular.ttf,BoldItalicFont=paper-cjk-bold.ttf`;
  return {
    ...build,
    headerIncludes: [
      ...build.headerIncludes,
      `\\setCJKmainfont[${options}]{paper-cjk-regular.ttf}`,
      `\\setCJKsansfont[${options}]{paper-cjk-regular.ttf}`,
      `\\setCJKmonofont[${options}]{paper-cjk-regular.ttf}`,
    ],
  };
}

function buildMarkdown(build: LocaleBuild): string {
  const metadata = {
    ...paperTitleMetadata(build.content),
    date: `${build.content.hero.versionLabel} \\textperiodcentered\\ ${build.dateDisplay}`,
    'toc-title': build.tocTitle,
    fontsize: '11pt',
    papersize: 'letter',
    geometry: 'margin=1.1in',
    colorlinks: true,
    linkcolor: 'black',
    urlcolor: 'blue',
    toccolor: 'black',
    'link-citations': true,
    'header-includes': build.headerIncludes,
    ...(build.lang ? { lang: build.lang } : {}),
  };

  const frontMatter = `---\n${JSON.stringify(metadata, null, 2)}\n---`;
  return `${frontMatter}\n\n${renderPaperBody(build.content)}\n`;
}

/** Records what a locale's committed PDF was built from (WHITE_PAPER_PDF_MANIFEST_PATH). */
function recordInManifest(locale: AppLocale, content: WhitePaperContent): void {
  const manifestPath = join(ROOT, WHITE_PAPER_PDF_MANIFEST_PATH);
  const previous: Partial<WhitePaperPdfManifest> = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Partial<WhitePaperPdfManifest>)
    : {};
  const next: Partial<Record<AppLocale, WhitePaperPdfManifestEntry>> = {};
  for (const entryLocale of routing.locales) {
    const entry =
      entryLocale === locale
        ? { pdf: whitePaperPdfPath(locale), sourceSha256: paperSourceSha256(content) }
        : previous[entryLocale];
    if (entry) next[entryLocale] = entry;
  }
  writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

async function generate(locale: AppLocale): Promise<void> {
  const outputPath = join(ROOT, 'public', whitePaperPdfPath(locale));
  const tempDir = mkdtempSync(join(tmpdir(), `cosmic-white-paper-${locale}-`));

  try {
    const build = await prepareCjkFonts(BUILDS[locale], tempDir);
    const markdown = buildMarkdown(build);
    const markdownPath = join(tempDir, 'white-paper.md');
    writeFileSync(markdownPath, markdown, 'utf8');
    mkdirSync(dirname(outputPath), { recursive: true });
    execFileSync(
      'pandoc',
      [
        markdownPath,
        '--from',
        'markdown+smart',
        '--output',
        outputPath,
        '--pdf-engine',
        'tectonic',
        '--toc',
        '--toc-depth=2',
        `--columns=${build.markdownColumns ?? 110}`,
      ],
      { stdio: 'inherit' },
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  recordInManifest(locale, BUILDS[locale].content);
  const sizeKb = Math.round(statSync(outputPath).size / 1024);
  /* eslint-disable-next-line no-console -- CLI status output; this script
     runs via `npm run white-paper:pdf` and never ships to the browser. */
  console.log(`\u2705  wrote ${outputPath} (${sizeKb} KB)`);
}

async function main(): Promise<void> {
  const localeArgIndex = process.argv.indexOf('--locale');
  const requested = localeArgIndex === -1 ? 'all' : (process.argv[localeArgIndex + 1] ?? 'all');
  if (requested !== 'all' && !isAppLocale(requested)) {
    throw new Error(
      `unknown --locale value: ${requested} (expected ${routing.locales.join(', ')}, or all)`,
    );
  }
  const locales: readonly AppLocale[] = requested === 'all' ? routing.locales : [requested];
  for (const locale of locales) await generate(locale);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
