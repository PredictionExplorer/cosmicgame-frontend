import {
  WHITE_PAPER_STRUCTURE,
  getWhitePaperContent,
  whitePaperContentEn,
  whitePaperContentZh,
  type WhitePaperContent,
  type WhitePaperSectionStructure,
} from '@/content/white-paper';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';
import { ALLOCATION_SPLIT_TRACKS } from '@/components/white-paper/AllocationSplit';

/**
 * Structural guard for the white paper.
 *
 * Section and subsection IDs are public URL anchors (`/white-paper#<id>`)
 * referenced by the quiz and by external backlinks, and both locales must
 * render the same document skeleton: same sections, same numbering, and the
 * same block kinds in the same order, so the en and zh papers can never
 * drift apart structurally.
 */

interface SectionSkeleton {
  readonly id: string;
  readonly number: string;
  readonly blocks: readonly string[];
  readonly subsections: readonly {
    readonly id: string;
    readonly number: string;
    readonly blocks: readonly string[];
  }[];
}

function skeleton(content: WhitePaperContent): SectionSkeleton[] {
  return content.sections.map((section) => ({
    id: section.id,
    number: section.number,
    blocks: section.blocks.map((block) => block.kind),
    subsections: (section.subsections ?? []).map((subsection) => ({
      id: subsection.id,
      number: subsection.number,
      blocks: subsection.blocks.map((block) => block.kind),
    })),
  }));
}

describe('localized white-paper content', () => {
  it('selects complete locale content without fallback', () => {
    expect(getWhitePaperContent('en-US')).toBe(whitePaperContentEn);
    expect(getWhitePaperContent('zh-Hans')).toBe(whitePaperContentZh);
    expect(getWhitePaperContent('zh')).toBe(whitePaperContentZh);
  });

  it('keeps section IDs, numbers, and block-kind sequences identical across locales', () => {
    expect(skeleton(whitePaperContentZh)).toEqual(skeleton(whitePaperContentEn));
  });

  it('renders exactly the declared skeleton in both locales', () => {
    const declared: readonly WhitePaperSectionStructure[] = WHITE_PAPER_STRUCTURE;
    const expected: SectionSkeleton[] = declared.map((section) => ({
      id: section.id,
      number: section.number,
      blocks: [...section.blocks],
      subsections: (section.subsections ?? []).map((subsection) => ({
        id: subsection.id,
        number: subsection.number,
        blocks: [...subsection.blocks],
      })),
    }));

    expect(skeleton(whitePaperContentEn)).toEqual(expected);
    expect(skeleton(whitePaperContentZh)).toEqual(expected);
  });

  it('keeps the references anchor identical across locales', () => {
    expect(whitePaperContentZh.references.id).toBe(whitePaperContentEn.references.id);
  });
});

describe('web edition of the white paper', () => {
  it.each(routing.locales)(
    '%s: the §5.1 table lists the ETH tracks in the figure order',
    (locale) => {
      const table = getWhitePaperContent(locale)
        .sections.flatMap((section) => section.subsections ?? [])
        .find((subsection) => subsection.id === 'distribution-at-finalization')
        ?.blocks.find((block) => block.kind === 'table');
      expect(table?.kind).toBe('table');
      if (table?.kind !== 'table') return;
      // The figure takes its track names from this table's first column, row by row.
      expect(table.table.rows).toHaveLength(ALLOCATION_SPLIT_TRACKS.length);
      table.table.rows.forEach((row, index) => {
        expect(row[1]).toContain(String(ALLOCATION_SPLIT_TRACKS[index]!.share));
      });
    },
  );

  it.each(routing.locales)('%s: the §7.1 formula has plain notation and a legend', (locale) => {
    const formula = getWhitePaperContent(locale)
      .sections.flatMap((section) => section.subsections ?? [])
      .find((subsection) => subsection.id === 'imprint-rules')
      ?.blocks.find((block) => block.kind === 'formula');
    expect(formula?.kind).toBe('formula');
    if (formula?.kind !== 'formula') return;
    expect(formula.formula).toBe(protocolFacts.dynamicCstRewardFormula);
    expect(formula.notation).toBe(protocolFacts.participationCstNotation);
    expect(formula.legend?.map((entry) => entry.symbol)).toEqual(['Δt', 'm', 'i']);
    // The notation reads without the contract's identifiers.
    expect(formula.notation).not.toMatch(/bid|prize/i);
  });

  it.each(routing.locales)('%s: the figure and reading copy is complete', (locale) => {
    const { figures, reading } = getWhitePaperContent(locale);
    expect(figures.cycle.steps).toHaveLength(5);
    for (const value of [
      ...Object.values(reading),
      figures.cycle.title,
      figures.allocation.title,
      figures.art.title,
      ...figures.cycle.steps.flatMap((step) => [step.label, step.detail]),
    ]) {
      expect(value.trim()).not.toBe('');
    }
    expect(reading.headingLinkTemplate).toContain('{title}');
    expect(reading.figureTemplate).toContain('{number}');
    expect(reading.readingTimeTemplate).toContain('{minutes}');
  });
});
