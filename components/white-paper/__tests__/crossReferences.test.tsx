import { render, screen } from '@testing-library/react';

import { getWhitePaperContent, type WhitePaperBlock } from '@/content/white-paper';

import { routing } from '@/i18n/routing';
import {
  referenceTargets,
  splitReferences,
  withReferences,
} from '@/components/white-paper/crossReferences';

function blockTexts(block: WhitePaperBlock): string[] {
  switch (block.kind) {
    case 'paragraph':
    case 'note':
      return [block.text];
    case 'list':
      return [...block.items];
    case 'table':
      return [...block.table.rows.flat(), block.table.footnote ?? ''];
    case 'formula':
      return [];
  }
}

function paperTexts(locale: string): string[] {
  return getWhitePaperContent(locale).sections.flatMap((section) => [
    ...section.blocks.flatMap(blockTexts),
    ...(section.subsections ?? []).flatMap((subsection) => subsection.blocks.flatMap(blockTexts)),
  ]);
}

describe('white paper cross-references', () => {
  const targets = referenceTargets(getWhitePaperContent('en'));

  it('links a section, a subsection and an appendix, keeping the wording', () => {
    expect(splitReferences('See Section 5.2, Section 13 and Appendix A.', 'en', targets)).toEqual([
      'See ',
      { text: 'Section 5.2', id: 'endurance-and-chrono' },
      ', ',
      { text: 'Section 13', id: 'decentralization' },
      ' and ',
      { text: 'Appendix A', id: 'appendix-a' },
      '.',
    ]);
  });

  it('leaves text without references, and unknown numbers, untouched', () => {
    expect(splitReferences('No references here.', 'en', targets)).toEqual(['No references here.']);
    expect(splitReferences('Section 99 does not exist.', 'en', targets)).toEqual([
      'Section 99 does not exist.',
    ]);
  });

  it('renders references as in-page links', () => {
    render(<p>{withReferences('Section 7.1 has the formula.', 'en', targets)}</p>);
    expect(screen.getByRole('link', { name: 'Section 7.1' })).toHaveAttribute(
      'href',
      '#imprint-rules',
    );
  });

  it.each(routing.locales)('%s: finds the paper’s references in its own wording', (locale) => {
    const localeTargets = referenceTargets(getWhitePaperContent(locale));
    const links = paperTexts(locale)
      .flatMap((text) => splitReferences(text, locale, localeTargets))
      .filter((part) => typeof part !== 'string');
    // The English paper names about thirty sections; every translation keeps them.
    expect(links.length).toBeGreaterThanOrEqual(25);
    const ids = new Set(localeTargets.values());
    for (const link of links) expect(ids.has(link.id)).toBe(true);
  });
});
