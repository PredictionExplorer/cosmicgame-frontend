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
 * Rerun after any change to a content
 * module, and bump WHITE_PAPER_VERSION in content/white-paper/types.ts for
 * substantive revisions so older copies stay citable.
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
  type WhitePaperBlock,
  type WhitePaperContent,
  type WhitePaperSection,
} from '../content/white-paper/types';
import { isAppLocale, type AppLocale, type LocaleRecord } from '../i18n/locale';
import { routing } from '../i18n/routing';

import { GOOGLE_FONTS_COMMIT, type FontSource } from './build-og-fonts-core';
import { uncoveredCharacters } from './font-cmap';

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
  const text = Array.from(
    new Set(
      `${JSON.stringify(build.content)}${build.dateDisplay}${build.tocTitle}${printableAscii}`,
    ),
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

/**
 * The papers' prose intentionally contains no markdown syntax, so escaping
 * every special character is safe. Formulas and addresses are emitted as
 * code spans and skip this path.
 */
function escapeMarkdown(text: string): string {
  return (
    text
      .replace(/[\\`*_{}[\]<>#+!|~^$]/g, (match) => `\\${match}`)
      // U+2212 (minus sign) is not guaranteed a glyph in Latin Modern.
      .replace(/\u2212/g, '-')
  );
}

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

function renderCell(cell: string): string {
  if (ADDRESS_PATTERN.test(cell)) return `\`${cell}\``;
  return escapeMarkdown(cell);
}

/** CJK codepoints render two columns wide; padding must match display width. */
function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    width += code > 0x2e7f ? 2 : 1;
  }
  return width;
}

/**
 * Emits a pipe table. Cell padding makes the source columns proportional to
 * their content, which pandoc turns into sensible relative column widths in
 * the PDF (long prose columns wrap instead of overflowing the page).
 */
function renderTable(block: Extract<WhitePaperBlock, { kind: 'table' }>): string {
  const { columns, rows, footnote } = block.table;
  const rendered = [columns.map(escapeMarkdown), ...rows.map((row) => row.map(renderCell))];
  const widths = columns.map((_, columnIndex) =>
    Math.max(...rendered.map((row) => displayWidth(row[columnIndex] ?? ''))),
  );
  const pad = (cell: string, columnIndex: number): string =>
    cell + ' '.repeat(Math.max(0, (widths[columnIndex] ?? 0) - displayWidth(cell)));

  const lines: string[] = [];
  lines.push(`| ${rendered[0]!.map(pad).join(' | ')} |`);
  lines.push(`|${widths.map((width) => '-'.repeat(width + 2)).join('|')}|`);
  for (const row of rendered.slice(1)) {
    lines.push(`| ${row.map(pad).join(' | ')} |`);
  }
  let table = lines.join('\n');
  if (footnote) {
    table += `\n\n\\noindent {\\small \\emph{${latexEscape(footnote)}}}`;
  }
  return table;
}

/** Escapes prose for the few spots emitted as raw LaTeX (table footnotes). */
function latexEscape(text: string): string {
  return text
    .replace(/[\\{}]/g, (match) => `\\${match === '\\' ? 'textbackslash ' : match}`)
    .replace(/[%$#_&]/g, (match) => `\\${match}`)
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ')
    .replace(/\u2212/g, '-');
}

/** Wraps long single-line formulas at operator boundaries for the code block. */
function wrapFormula(formula: string): string {
  if (formula.length <= 76) return formula;
  return formula.replace(/ \/ /g, '\n    / ');
}

/** Explicit raw blocks let pandoc still parse Markdown inside a LaTeX container. */
function rawLatex(value: string): string {
  return `\`\`\`{=latex}\n${value}\n\`\`\``;
}

function renderBlock(block: WhitePaperBlock): string {
  switch (block.kind) {
    case 'paragraph':
      return escapeMarkdown(block.text);
    case 'list':
      return block.items.map((item) => `- ${escapeMarkdown(item)}`).join('\n');
    case 'formula': {
      const code = `\`\`\`\n${wrapFormula(block.formula)}\n\`\`\``;
      const contents = block.caption
        ? `${code}\n\n\\noindent {\\small \\emph{${latexEscape(block.caption)}}}`
        : code;
      // A formula without its explanation on the same page is hard to read.
      // These compact blocks fit comfortably on a page at the existing size.
      return [
        rawLatex('\\noindent\\begin{minipage}{\\linewidth}'),
        contents,
        rawLatex('\\end{minipage}'),
      ].join('\n\n');
    }
    case 'note':
      return `> ${escapeMarkdown(block.text)}`;
    case 'table':
      return renderTable(block);
  }
}

function renderSection(section: WhitePaperSection): string {
  const parts: string[] = [];
  const title = /^\d+$/.test(section.number)
    ? `${section.number}. ${section.heading}`
    : section.heading;
  // longtable may start on the next page even when a heading itself fits.
  // Reserve room for the heading, table header, and initial rows together.
  if (section.blocks[0]?.kind === 'table') parts.push('\\needspace{8\\baselineskip}');
  parts.push(`# ${escapeMarkdown(title)}`);
  for (const block of section.blocks) parts.push(renderBlock(block));
  for (const subsection of section.subsections ?? []) {
    if (subsection.blocks[0]?.kind === 'table') parts.push('\\needspace{8\\baselineskip}');
    parts.push(`## ${subsection.number} ${escapeMarkdown(subsection.heading)}`);
    for (const block of subsection.blocks) parts.push(renderBlock(block));
  }
  return parts.join('\n\n');
}

function buildMarkdown(build: LocaleBuild): string {
  const { content } = build;
  const metadata = {
    title: content.hero.title,
    subtitle: content.hero.subtitle,
    author: `${content.hero.authorName} \\hspace{0.4em} \\texttt{\\small ${content.hero.authorEmail}}`,
    date: `${content.hero.versionLabel} \\textperiodcentered\\ ${build.dateDisplay}`,
    abstract: content.abstract.paragraphs.join('\n\n'),
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

  const body: string[] = [];
  for (const section of content.sections) {
    body.push(renderSection(section));
  }

  // References and the closing citation form one short block. A page break
  // before the block is preferable to a final page containing only a license.
  body.push(rawLatex('\\noindent\\begin{minipage}{\\linewidth}'));
  body.push(`# ${escapeMarkdown(content.references.heading)}`);
  body.push(
    content.references.items
      .map(
        (reference, index) =>
          `${index + 1}. ${escapeMarkdown(reference.label)}. <${reference.href}>`,
      )
      .join('\n'),
  );

  body.push('\\vspace{1.5em}\\noindent\\hrulefill\n');
  body.push(
    `\\noindent {\\small ${latexEscape(content.citation)}\\par\\smallskip\\noindent ${latexEscape(content.licenseNote)}}`,
  );
  body.push(rawLatex('\\end{minipage}'));

  const frontMatter = `---\n${JSON.stringify(metadata, null, 2)}\n---`;
  return `${frontMatter}\n\n${body.join('\n\n')}\n`;
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
