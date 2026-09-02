import {
  WHITE_PAPER_STRUCTURE,
  getWhitePaperContent,
  whitePaperContentEn,
  whitePaperContentZh,
  type WhitePaperContent,
  type WhitePaperSectionStructure,
} from '@/content/white-paper';

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
