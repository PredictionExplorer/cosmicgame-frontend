#!/usr/bin/env tsx
/**
 * Generates the committed white paper PDFs from the content modules, so the
 * web pages at /white-paper and the PDFs can never drift apart.
 *
 *   npm run white-paper:pdf              # both languages
 *   npm run white-paper:pdf -- --locale zh
 *
 * Pipeline: content/white-paper (structure.ts + text.<locale>.ts) -> pandoc
 * markdown -> tectonic (XeLaTeX) ->
 * public/white-paper/cosmic-signature-white-paper-v<x>[-zh].pdf
 *
 * Requires `pandoc` and `tectonic` on PATH (both available via Homebrew).
 * The Chinese build additionally uses the macOS system CJK fonts Songti SC
 * and PingFang SC through xeCJK. Rerun after any change to a content module,
 * and bump WHITE_PAPER_VERSION in content/white-paper/types.ts for
 * substantive revisions so older copies stay citable.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { whitePaperContentEn, whitePaperContentZh } from '../content/white-paper';
import {
  WHITE_PAPER_DATE_DISPLAY,
  WHITE_PAPER_PDF_PATH,
  WHITE_PAPER_PDF_PATH_ZH,
  type WhitePaperBlock,
  type WhitePaperContent,
  type WhitePaperSection,
} from '../content/white-paper/types';
import { isAppLocale, type AppLocale, type LocaleRecord } from '../i18n/locale';
import { routing } from '../i18n/routing';

const ROOT = resolve(process.cwd());

interface LocaleBuild {
  content: WhitePaperContent;
  outputPath: string;
  dateDisplay: string;
  tocTitle: string;
  headerIncludes: readonly string[];
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
// compile here until its PDF typography and output path are decided.
const BUILDS: LocaleRecord<LocaleBuild> = {
  en: {
    content: whitePaperContentEn,
    outputPath: join(ROOT, 'public', WHITE_PAPER_PDF_PATH),
    dateDisplay: WHITE_PAPER_DATE_DISPLAY,
    tocTitle: 'Contents',
    headerIncludes: BASE_HEADER_INCLUDES,
  },
  zh: {
    content: whitePaperContentZh,
    outputPath: join(ROOT, 'public', WHITE_PAPER_PDF_PATH_ZH),
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
};

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

function renderBlock(block: WhitePaperBlock): string {
  switch (block.kind) {
    case 'paragraph':
      return escapeMarkdown(block.text);
    case 'list':
      return block.items.map((item) => `- ${escapeMarkdown(item)}`).join('\n');
    case 'formula': {
      const code = `\`\`\`\n${wrapFormula(block.formula)}\n\`\`\``;
      return block.caption
        ? `${code}\n\n\\noindent {\\small \\emph{${latexEscape(block.caption)}}}`
        : code;
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
  parts.push(`# ${escapeMarkdown(title)}`);
  for (const block of section.blocks) parts.push(renderBlock(block));
  for (const subsection of section.subsections ?? []) {
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
  };

  const body: string[] = [];
  for (const section of content.sections) {
    body.push(renderSection(section));
  }

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

  const frontMatter = `---\n${JSON.stringify(metadata, null, 2)}\n---`;
  return `${frontMatter}\n\n${body.join('\n\n')}\n`;
}

function generate(locale: AppLocale): void {
  const build = BUILDS[locale];
  const markdown = buildMarkdown(build);
  const tempDir = mkdtempSync(join(tmpdir(), `cosmic-white-paper-${locale}-`));
  const markdownPath = join(tempDir, 'white-paper.md');
  writeFileSync(markdownPath, markdown, 'utf8');
  mkdirSync(dirname(build.outputPath), { recursive: true });

  try {
    execFileSync(
      'pandoc',
      [
        markdownPath,
        '--from',
        'markdown+smart',
        '--output',
        build.outputPath,
        '--pdf-engine',
        'tectonic',
        '--toc',
        '--toc-depth=2',
        '--columns=110',
      ],
      { stdio: 'inherit' },
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  const sizeKb = Math.round(statSync(build.outputPath).size / 1024);
  /* eslint-disable-next-line no-console -- CLI status output; this script
     runs via `npm run white-paper:pdf` and never ships to the browser. */
  console.log(`\u2705  wrote ${build.outputPath} (${sizeKb} KB)`);
}

function main(): void {
  const localeArgIndex = process.argv.indexOf('--locale');
  const requested = localeArgIndex === -1 ? 'all' : (process.argv[localeArgIndex + 1] ?? 'all');
  if (requested !== 'all' && !isAppLocale(requested)) {
    throw new Error(
      `unknown --locale value: ${requested} (expected ${routing.locales.join(', ')}, or all)`,
    );
  }
  const locales: readonly AppLocale[] = requested === 'all' ? routing.locales : [requested];
  for (const locale of locales) generate(locale);
}

main();
