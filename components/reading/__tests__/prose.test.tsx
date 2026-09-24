import { render, screen, within } from '@testing-library/react';

import { getWhitePaperContent, type WhitePaperBlock } from '@/content/white-paper';

import { routing } from '@/i18n/routing';
import {
  FormulaFigure,
  ReadingHeading,
  RunInList,
  splitRunIn,
  termLabel,
} from '@/components/reading/prose';
import { branchOf, findEntry, flattenContents } from '@/components/reading/contents';
import { readingMinutes } from '@/components/reading/readingTime';
import { fillTemplate, renderTemplate } from '@/components/reading/template';

/** The white paper's lists, by the section or subsection they sit in. */
function listsOf(locale: string): Record<string, readonly string[][]> {
  const lists: Record<string, string[][]> = {};
  const collect = (id: string, blocks: readonly WhitePaperBlock[]) => {
    for (const block of blocks) {
      if (block.kind === 'list') (lists[id] ??= []).push([...block.items]);
    }
  };
  for (const section of getWhitePaperContent(locale).sections) {
    collect(section.id, section.blocks);
    for (const subsection of section.subsections ?? []) collect(subsection.id, subsection.blocks);
  }
  return lists;
}

describe('run-in list terms', () => {
  it('splits a lead term at the first sentence or colon break, in every script', () => {
    expect(splitRunIn('Seed. At imprint time the contract derives a seed.')).toEqual({
      term: 'Seed.',
      text: 'At imprint time the contract derives a seed.',
    });
    expect(splitRunIn('Pull over push: allocations sit in escrow.')).toEqual({
      term: 'Pull over push:',
      text: 'allocations sit in escrow.',
    });
    expect(splitRunIn('确定性。作品由种子计算而来。')).toEqual({
      term: '确定性。',
      text: '作品由种子计算而来。',
    });
    expect(splitRunIn('プッシュよりプル：配分はエスクローに置かれます。').term).toBe(
      'プッシュよりプル：',
    );
  });

  it('keeps a plain sentence whole', () => {
    const sentence = 'Reentrancy guards protect every external entry point of the core contract.';
    expect(splitRunIn(sentence)).toEqual({ term: null, text: sentence });
    expect(splitRunIn('重入防护覆盖核心合约的每个外部入口。').term).toBeNull();
  });

  it('drops the closing mark from the label', () => {
    expect(termLabel('Seed.')).toBe('Seed');
    expect(termLabel('プッシュよりプル：')).toBe('プッシュよりプル');
  });

  it.each(routing.locales)('finds a short term on every run-in item of the %s paper', (locale) => {
    const lists = listsOf(locale);
    for (const id of ['introduction', 'art-pipeline', 'v2', 'risk-factors']) {
      for (const item of lists[id]!.flat()) {
        const { term } = splitRunIn(item);
        expect({ id, item, term: term !== null }).toEqual({ id, item, term: true });
      }
    }
    // §11.2 opens with a plain sentence; the rest lead with a term.
    const defensive = lists['defensive-design']!.flat().map((item) => splitRunIn(item).term);
    expect(defensive.slice(1).every((term) => term !== null)).toBe(true);
  });

  it('renders terms as a definition list, numbering a sequence', () => {
    render(<RunInList items={['Seed. First.', 'Simulation. Second.']} ordered />);
    const terms = screen.getAllByRole('term');
    expect(terms.map((term) => term.textContent)).toEqual(['01Seed', '02Simulation']);
    expect(screen.getAllByRole('definition').map((node) => node.textContent)).toEqual([
      'First.',
      'Second.',
    ]);
  });
});

describe('reading parts', () => {
  it('keeps the heading name to its number and title, with a labelled anchor beside it', () => {
    render(
      <ReadingHeading
        as="h2"
        sectionId="countdown"
        headingId="countdown-heading"
        number="3.2"
        anchorLabel="Link to this section: 3.2 The Countdown"
      >
        The Countdown
      </ReadingHeading>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('3.2 The Countdown');
    expect(
      screen.getByRole('link', { name: 'Link to this section: 3.2 The Countdown' }),
    ).toHaveAttribute('href', '#countdown');
  });

  it('leads a formula with its notation and keeps the contract expression folded', () => {
    render(
      <FormulaFigure
        label="Formula"
        formula="floor(sqrt(a * b / c))"
        notation="CST = ⌊√(Δt × m ÷ i)⌋"
        legend={[{ symbol: 'Δt', meaning: 'seconds since the previous gesture' }]}
        expressionLabel="The expression in the contract"
        caption="Participation CST imprinted by a gesture."
      />,
    );
    const figure = screen.getByRole('figure');
    expect(within(figure).getByText('CST = ⌊√(Δt × m ÷ i)⌋')).toBeVisible();
    expect(within(figure).getByText('seconds since the previous gesture')).toBeInTheDocument();
    const details = figure.querySelector('details');
    expect(details).not.toHaveAttribute('open');
    expect(details).toHaveTextContent('floor(sqrt(a * b / c))');
  });

  it('fills content templates and leaves unknown placeholders visible', () => {
    expect(fillTemplate('Figure {number}', { number: 2 })).toBe('Figure 2');
    expect(fillTemplate('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });

  it("renders element values in place, with the locale's own punctuation around them", () => {
    const { container } = render(
      <p>{renderTemplate('到達点：{rank}（{missing}）', { rank: <strong>観測者</strong> })}</p>,
    );
    expect(container.querySelector('p')?.innerHTML).toBe(
      '到達点：<strong>観測者</strong>（{missing}）',
    );
  });
});

describe('contents helpers', () => {
  const entries = [
    { id: 'one', label: 'One', number: '1' },
    {
      id: 'two',
      label: 'Two',
      number: '2',
      children: [{ id: 'two-a', label: 'Two A', number: '2.1' }],
    },
  ];

  it('flattens, finds and locates branches', () => {
    expect(flattenContents(entries)).toEqual(['one', 'two', 'two-a']);
    expect(branchOf(entries, 'two-a')).toBe('two');
    expect(branchOf(entries, null)).toBeNull();
    expect(findEntry(entries, 'two-a')?.label).toBe('Two A');
  });
});

describe('reading time', () => {
  it('counts words for spaced scripts and characters for Chinese and Japanese', () => {
    expect(readingMinutes(['word '.repeat(460)], 'en')).toBe(2);
    expect(readingMinutes(['字'.repeat(1000)], 'zh')).toBe(2);
    expect(readingMinutes(['文'.repeat(1500)], 'ja')).toBe(3);
    expect(readingMinutes(['단어 '.repeat(400)], 'ko')).toBe(2);
    expect(readingMinutes([''], 'uk')).toBe(1);
  });
});
