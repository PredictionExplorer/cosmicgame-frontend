/**
 * The pure half of the white paper PDF build (scripts/generate-white-paper-pdf.ts):
 * the content modules rendered as pandoc markdown, and the digest of that
 * source which the generator records per locale in the PDF manifest. A test
 * (scripts/__tests__/white-paper-pdf-core.test.ts) recomputes each digest from
 * the content, so a change to a paper that is not followed by
 * `npm run white-paper:pdf` fails CI instead of shipping a stale PDF.
 */

import { createHash } from 'node:crypto';

import { protocolFacts } from '../content/protocol-facts';
import type {
  WhitePaperBlock,
  WhitePaperContent,
  WhitePaperReadingCopy,
  WhitePaperSection,
} from '../content/white-paper/types';
import type { LocaleRecord } from '../i18n/locale';

/** Where the generator records what each committed PDF was built from. */
export const WHITE_PAPER_PDF_MANIFEST_PATH = 'content/white-paper/pdf-manifest.json';

export interface WhitePaperPdfManifestEntry {
  /** The PDF's public path (whitePaperPdfPath). */
  readonly pdf: string;
  /** SHA-256 of the markdown the PDF was built from (paperSourceSha256). */
  readonly sourceSha256: string;
}

export type WhitePaperPdfManifest = LocaleRecord<WhitePaperPdfManifestEntry>;

/**
 * The papers' prose intentionally contains no markdown syntax, so escaping
 * every special character is safe. Formulas and addresses are emitted as
 * code spans and skip this path.
 */
export function escapeMarkdown(text: string): string {
  return (
    text
      .replace(/[\\`*_{}[\]<>#+!|~^$]/g, (match) => `\\${match}`)
      // U+2212 (minus sign) is not guaranteed a glyph in Latin Modern.
      .replace(/−/g, '-')
  );
}

/** Escapes prose for the few spots emitted as raw LaTeX (captions, footnotes). */
export function latexEscape(text: string): string {
  return text
    .replace(/[\\{}]/g, (match) => `\\${match === '\\' ? 'textbackslash ' : match}`)
    .replace(/[%$#_&]/g, (match) => `\\${match}`)
    .replace(/~/g, '\\textasciitilde ')
    .replace(/\^/g, '\\textasciicircum ')
    .replace(/−/g, '-');
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

/** Wraps long single-line formulas at operator boundaries for the code block. */
function wrapFormula(formula: string): string {
  if (formula.length <= 76) return formula;
  return formula.replace(/ \/ /g, '\n    / ');
}

/** Explicit raw blocks let pandoc still parse Markdown inside a LaTeX container. */
function rawLatex(value: string): string {
  return `\`\`\`{=latex}\n${value}\n\`\`\``;
}

/**
 * Each plain notation the papers use, typeset as TeX math: the PDF's
 * counterpart of the web edition's NOTATION_MATH (components/reading/prose.tsx).
 * The PDF typesets it rather than printing the Unicode string, because the
 * code faces have no ⌊ ⌋ √ Δ.
 */
const NOTATION_LATEX: Readonly<Record<string, string>> = {
  [protocolFacts.participationCstNotation]: String.raw`\mathrm{CST} = \left\lfloor \sqrt{\Delta t \times m \div i} \right\rfloor`,
};

/** The notation's symbols, as they appear in its legend. */
const SYMBOL_LATEX: Readonly<Record<string, string>> = {
  [protocolFacts.participationCstSymbols[0]]: String.raw`\Delta t`,
  [protocolFacts.participationCstSymbols[1]]: 'm',
  [protocolFacts.participationCstSymbols[2]]: 'i',
};

/** A notation as TeX math; a notation the PDF cannot typeset fails the build. */
export function notationLatex(notation: string): string {
  const math = NOTATION_LATEX[notation];
  if (math === undefined) {
    throw new Error(`No TeX for the notation "${notation}": add it to NOTATION_LATEX`);
  }
  return math;
}

function symbolLatex(symbol: string): string {
  const math = SYMBOL_LATEX[symbol];
  if (math === undefined) {
    throw new Error(`No TeX for the symbol "${symbol}": add it to SYMBOL_LATEX`);
  }
  return math;
}

/**
 * A formula as the web edition shows it: the plain notation first, typeset,
 * then what each symbol stands for, then the expression as the contracts
 * write it (under its label) and the caption, held on one page.
 */
function renderFormula(
  block: Extract<WhitePaperBlock, { kind: 'formula' }>,
  reading: WhitePaperReadingCopy,
): string {
  const parts: string[] = [];
  if (block.notation) {
    parts.push(`$$${notationLatex(block.notation)}$$`);
    if (block.legend?.length) {
      // What each symbol stands for: the symbol in math, its meaning beside it.
      parts.push(
        rawLatex(
          [
            '\\noindent\\begin{tabular}{@{}l@{\\hspace{1.5em}}p{0.8\\linewidth}@{}}',
            ...block.legend.map(
              (entry) => `$${symbolLatex(entry.symbol)}$ & ${latexEscape(entry.meaning)} \\\\`,
            ),
            '\\end{tabular}',
          ].join('\n'),
        ),
      );
    }
    parts.push(
      rawLatex(`\\medskip\\noindent {\\small ${latexEscape(reading.contractExpressionLabel)}}`),
    );
  }
  parts.push(`\`\`\`\n${wrapFormula(block.formula)}\n\`\`\``);
  if (block.caption) {
    parts.push(`\\noindent {\\small \\emph{${latexEscape(block.caption)}}}`);
  }
  // A formula without its explanation on the same page is hard to read.
  // These compact blocks fit comfortably on a page at the existing size.
  return [
    rawLatex('\\noindent\\begin{minipage}{\\linewidth}'),
    ...parts,
    rawLatex('\\end{minipage}'),
  ].join('\n\n');
}

function renderBlock(block: WhitePaperBlock, reading: WhitePaperReadingCopy): string {
  switch (block.kind) {
    case 'paragraph':
      return escapeMarkdown(block.text);
    case 'list':
      return block.items.map((item) => `- ${escapeMarkdown(item)}`).join('\n');
    case 'formula':
      return renderFormula(block, reading);
    case 'note':
      return `> ${escapeMarkdown(block.text)}`;
    case 'table':
      return renderTable(block);
  }
}

function renderSection(section: WhitePaperSection, reading: WhitePaperReadingCopy): string {
  const parts: string[] = [];
  const title = /^\d+$/.test(section.number)
    ? `${section.number}. ${section.heading}`
    : section.heading;
  // longtable may start on the next page even when a heading itself fits.
  // Reserve room for the heading, table header, and initial rows together.
  if (section.blocks[0]?.kind === 'table') parts.push('\\needspace{8\\baselineskip}');
  parts.push(`# ${escapeMarkdown(title)}`);
  for (const block of section.blocks) parts.push(renderBlock(block, reading));
  for (const subsection of section.subsections ?? []) {
    if (subsection.blocks[0]?.kind === 'table') parts.push('\\needspace{8\\baselineskip}');
    parts.push(`## ${subsection.number} ${escapeMarkdown(subsection.heading)}`);
    for (const block of subsection.blocks) parts.push(renderBlock(block, reading));
  }
  return parts.join('\n\n');
}

/** The title block's copy, as pandoc metadata (the author line is raw LaTeX). */
export function paperTitleMetadata(content: WhitePaperContent) {
  return {
    title: content.hero.title,
    subtitle: content.hero.subtitle,
    author: `${content.hero.authorName} \\hspace{0.4em} \\texttt{\\small ${content.hero.authorEmail}}`,
    abstract: content.abstract.paragraphs.join('\n\n'),
  };
}

/** The paper's body as pandoc markdown: every section, the references and the citation. */
export function renderPaperBody(content: WhitePaperContent): string {
  const body: string[] = [];
  for (const section of content.sections) {
    body.push(renderSection(section, content.reading));
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
  return body.join('\n\n');
}

/**
 * SHA-256 of everything a paper's PDF prints from its content module: the
 * title block and the rendered body. The generator records it per locale;
 * the test recomputes it, so a stale PDF fails CI.
 */
export function paperSourceSha256(content: WhitePaperContent): string {
  return createHash('sha256')
    .update(JSON.stringify(paperTitleMetadata(content)))
    .update('\n')
    .update(renderPaperBody(content))
    .digest('hex');
}
