import {
  WHITE_PAPER_STRUCTURE,
  getWhitePaperContent,
  getWhitePaperEdition,
  whitePaperPdfPath,
  whitePaperContentEn,
  whitePaperContentZh,
  type WhitePaperContent,
  type WhitePaperSectionStructure,
} from '@/content/white-paper';
import { historicalV2ProtocolFacts } from '@/content/protocol-facts';
import { whitePaperV13Facts } from '@/content/protocol-facts';
import { getLandingContent } from '@/content/landing';

import { routing } from '@/i18n/routing';

const editionFacts = (locale: string) =>
  getWhitePaperEdition(locale).version === '1.3' ? whitePaperV13Facts : historicalV2ProtocolFacts;

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
    '%s: the §5.1 table uses its own edition percentages and the shared chart order',
    (locale) => {
      const table = getWhitePaperContent(locale)
        .sections.flatMap((section) => section.subsections ?? [])
        .find((subsection) => subsection.id === 'distribution-at-finalization')
        ?.blocks.find((block) => block.kind === 'table');
      expect(table?.kind).toBe('table');
      if (table?.kind !== 'table') return;
      // The figure draws the landing's bar (config/allocationTracks order) and
      // keys it with this table's first column, row by row.
      const tracks = getLandingContent(locale).tracks.eth;
      const facts = editionFacts(locale);
      const shares = [
        facts.mainEthPercentage,
        facts.chronoWarriorEthPercentage,
        facts.stellarSelectionEthPercentage,
        facts.anchorDistributionPercentage,
        facts.publicGoodsPercentage,
        facts.compoundingReservePercentage,
      ];
      expect(table.table.rows).toHaveLength(tracks.length);
      table.table.rows.forEach((row, index) => {
        expect(row[1]).toContain(String(shares[index]));
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
    const facts = editionFacts(locale);
    expect(formula.formula).toBe(facts.dynamicCstRewardFormula);
    expect(formula.notation).toBe(facts.participationCstNotation);
    expect(formula.legend?.map((entry) => entry.symbol)).toEqual(facts.participationCstSymbols);
    // The notation reads without the contract's identifiers.
    expect(formula.notation).not.toMatch(/bid|prize/i);
  });

  it('publishes English 1.3 while preserving each translated 1.0 edition', () => {
    expect(whitePaperContentEn.hero.versionLabel).toBe('Version 1.3');
    expect(whitePaperContentEn.hero.downloadHref).toBe(
      '/white-paper/cosmic-signature-white-paper-v1.3.pdf',
    );
    expect(getWhitePaperEdition('en').dateIso).toBe('2026-10-21');
    for (const locale of routing.locales.filter((value) => value !== routing.defaultLocale)) {
      expect(getWhitePaperEdition(locale)).toEqual({ version: '1.0', dateIso: '2026-08-24' });
      expect(whitePaperPdfPath(locale)).toContain(`-v1.0-${locale}.pdf`);
      expect(getWhitePaperContent(locale).citation).toContain('Version 1.0.');
    }
  });

  it('distinguishes V3 recognition recipients, units and conditional allocations', () => {
    const text = JSON.stringify(whitePaperContentEn);
    expect(text).toContain("Bob's transaction credits Alice");
    expect(text).toContain('Finalization does not settle additional Participation CST');
    expect(text).toContain('1,000 CST total and 3 NFTs');
    expect(text).toContain('26 Cosmic Signature NFTs and 27,000 CST');
    expect(text).toContain('undiscounted, premium-free ETH base cost');
    expect(text).toContain('7 days');
    expect(text).not.toContain('1 + 9');
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
