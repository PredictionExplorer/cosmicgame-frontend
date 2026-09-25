import { render, screen } from '@testing-library/react';

import { getWhitePaperContent, type WhitePaperBlock } from '@/content/white-paper';

import { routing } from '@/i18n/routing';
import {
  referenceTargets,
  referenceText,
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

  it('links a number held to its measure word by a no-break space', () => {
    // The Chinese editions keep 第 5.2 节 on one line with U+00A0 before 节.
    expect(splitReferences('见第 5.2\u00A0节和第 12、13\u00A0节。', 'zh', targets)).toEqual([
      '见',
      { text: '第 5.2\u00A0节', id: 'endurance-and-chrono' },
      '和',
      { text: '第 12、13\u00A0节', id: targets.get('12') },
      '。',
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
    expect(screen.getByRole('link', { name: 'Section\u00a07.1' })).toHaveAttribute(
      'href',
      '#imprint-rules',
    );
  });

  it('keeps each number on the line of its word, so a link never breaks in two (V193)', () => {
    expect(referenceText('Section 11.3')).toBe('Section\u00a011.3');
    // A short range stays whole.
    expect(referenceText('Sections 3 through 5')).toBe('Sections\u00a03\u00a0through\u00a05');
    expect(referenceText('第 5.2 节')).toBe('第\u00a05.2\u00a0节');
    expect(referenceText('第3節')).toBe('第3節');
  });

  it('links the paper from another page by its path', () => {
    render(<p>{withReferences('Section 7.1 has the formula.', 'en', targets, '/white-paper')}</p>);
    expect(screen.getByRole('link', { name: 'Section\u00a07.1' })).toHaveAttribute(
      'href',
      '/white-paper#imprint-rules',
    );
  });

  it.each([
    ['en', 'Sections 3 through 5 specify cycles.', 'Sections 3 through 5'],
    ['en', 'Sections 12 and 13 record the history.', 'Sections 12 and 13'],
    ['zh', '第 3 至 5 节规定周期。', '第 3 至 5 节'],
    ['zh-TW', '第 12、13 節記錄歷史。', '第 12、13 節'],
    ['uk', 'Розділи 3–5 визначають цикли.', 'Розділи 3–5'],
    ['uk', 'у розділах 12 і 13', 'розділах 12 і 13'],
    ['ko', '3~5절은 사이클을 명세합니다.', '3~5절'],
    ['vi', 'Các mục 7 đến 10 nói về CST.', 'Các mục 7 đến 10'],
  ])('%s: links a range or pair to its first section as one link', (locale, text, linked) => {
    const localeTargets = referenceTargets(getWhitePaperContent(locale));
    const links = splitReferences(text, locale, localeTargets).filter(
      (part) => typeof part !== 'string',
    );
    expect(links).toHaveLength(1);
    expect(links[0]?.text).toBe(linked);
  });

  it('links the subsection range a figure caption names', () => {
    expect(
      splitReferences('Sections 3.1 through 3.3 give the exact rules.', 'en', targets).find(
        (part) => typeof part !== 'string',
      ),
    ).toEqual({ text: 'Sections 3.1 through 3.3', id: 'eth-calibration-window' });
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
