#!/usr/bin/env tsx
/**
 * Generates the committed white paper PDF from the content module, so the
 * web page at /white-paper and the PDF can never drift apart.
 *
 *   npm run white-paper:pdf
 *
 * Pipeline: content/white-paper/en.ts -> pandoc markdown -> tectonic
 * (XeLaTeX) -> public/white-paper/cosmic-signature-white-paper-v<x>.pdf
 *
 * Requires `pandoc` and `tectonic` on PATH (both available via Homebrew).
 * Rerun after any change to the content module, and bump
 * WHITE_PAPER_VERSION in content/white-paper/types.ts for substantive
 * revisions so older copies stay citable.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { whitePaperContentEn } from '../content/white-paper/en';
import {
  WHITE_PAPER_DATE_DISPLAY,
  WHITE_PAPER_PDF_PATH,
  WHITE_PAPER_VERSION,
  type WhitePaperBlock,
  type WhitePaperSection,
} from '../content/white-paper/types';

const ROOT = resolve(process.cwd());
const OUTPUT_PATH = join(ROOT, 'public', WHITE_PAPER_PDF_PATH);

/**
 * The paper's prose intentionally contains no markdown syntax, so escaping
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

/**
 * Emits a pipe table. Cell padding makes the source columns proportional to
 * their content, which pandoc turns into sensible relative column widths in
 * the PDF (long prose columns wrap instead of overflowing the page).
 */
function renderTable(block: Extract<WhitePaperBlock, { kind: 'table' }>): string {
  const { columns, rows, footnote } = block.table;
  const rendered = [columns.map(escapeMarkdown), ...rows.map((row) => row.map(renderCell))];
  const widths = columns.map((_, columnIndex) =>
    Math.max(...rendered.map((row) => row[columnIndex]?.length ?? 0)),
  );
  const pad = (cell: string, columnIndex: number): string =>
    cell.padEnd(widths[columnIndex] ?? cell.length, ' ');

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

function buildMarkdown(): string {
  const content = whitePaperContentEn;
  const metadata = {
    title: content.hero.title,
    subtitle: content.hero.subtitle,
    author: `${content.hero.authorName} \\hspace{0.4em} \\texttt{\\small ${content.hero.authorEmail}}`,
    date: `Version ${WHITE_PAPER_VERSION} \\textperiodcentered\\ ${WHITE_PAPER_DATE_DISPLAY}`,
    abstract: content.abstract.paragraphs.join('\n\n'),
    lang: 'en',
    fontsize: '11pt',
    papersize: 'letter',
    geometry: 'margin=1.1in',
    colorlinks: true,
    linkcolor: 'black',
    urlcolor: 'blue',
    toccolor: 'black',
    'link-citations': true,
    'header-includes': [
      '\\usepackage{microtype}',
      '\\usepackage{etoolbox}',
      '\\AtBeginEnvironment{longtable}{\\small}',
      '\\setlength{\\emergencystretch}{3em}',
      '\\usepackage{needspace}',
      '\\pretocmd{\\section}{\\needspace{5\\baselineskip}}{}{}',
    ],
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

function main(): void {
  const markdown = buildMarkdown();
  const tempDir = mkdtempSync(join(tmpdir(), 'cosmic-white-paper-'));
  const markdownPath = join(tempDir, 'white-paper.md');
  writeFileSync(markdownPath, markdown, 'utf8');
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  try {
    execFileSync(
      'pandoc',
      [
        markdownPath,
        '--from',
        'markdown+smart',
        '--output',
        OUTPUT_PATH,
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

  const sizeKb = Math.round(statSync(OUTPUT_PATH).size / 1024);
  /* eslint-disable-next-line no-console -- CLI status output; this script
     runs via `npm run white-paper:pdf` and never ships to the browser. */
  console.log(`\u2705  wrote ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main();
