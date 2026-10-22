/**
 * @jest-environment node
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { historicalV2ProtocolFacts as protocolFacts } from '../../content/protocol-facts';
import {
  getWhitePaperContent,
  getWhitePaperEdition,
  whitePaperPdfPath,
} from '../../content/white-paper';
import { whitePaperV13Facts } from '../../content/protocol-facts';
import { routing } from '../../i18n/routing';
import {
  WHITE_PAPER_PDF_MANIFEST_PATH,
  notationLatex,
  paperSourceSha256,
  renderPaperBody,
  type WhitePaperPdfManifest,
} from '../white-paper-pdf-core';

const ROOT = join(__dirname, '..', '..');
const manifest = JSON.parse(
  readFileSync(join(ROOT, WHITE_PAPER_PDF_MANIFEST_PATH), 'utf8'),
) as WhitePaperPdfManifest;

describe('white paper PDFs (V043)', () => {
  it.each(routing.locales)(
    '%s: the committed PDF was built from the current content (else run `npm run white-paper:pdf`)',
    (locale) => {
      const entry = manifest[locale];
      expect(entry).toBeDefined();
      expect(entry.pdf).toBe(whitePaperPdfPath(locale));
      expect(existsSync(join(ROOT, 'public', entry.pdf))).toBe(true);
      expect(entry.sourceSha256).toBe(paperSourceSha256(getWhitePaperContent(locale)));
    },
  );

  it.each(routing.locales)('%s: typesets the formula notation and its legend', (locale) => {
    const body = renderPaperBody(getWhitePaperContent(locale));
    const facts =
      getWhitePaperEdition(locale).version === '1.3' ? whitePaperV13Facts : protocolFacts;
    expect(body).toContain(`$$${notationLatex(facts.participationCstNotation)}$$`);
    expect(body).toContain(
      facts.participationCstSymbols[0] === 't' ? '$t$ & ' : String.raw`$\Delta t$ & `,
    );
    expect(body).toContain(getWhitePaperContent(locale).reading.contractExpressionLabel);
    // The Unicode notation never reaches a text face that lacks its glyphs.
    expect(body).not.toContain(facts.participationCstNotation);
  });

  it('refuses a notation it cannot typeset', () => {
    expect(() => notationLatex('x = y')).toThrow(/NOTATION_LATEX/);
  });
});
