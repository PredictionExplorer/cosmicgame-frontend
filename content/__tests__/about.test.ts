import {
  ABOUT_MILESTONE_IDS,
  ABOUT_RESOURCE_HREFS,
  ABOUT_RESOURCE_IDS,
  aboutContentEn,
  aboutContentZh,
  getAboutContent,
} from '@/content/about';
import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { routing } from '@/i18n/routing';

describe('about content', () => {
  it('selects the requested locale', () => {
    expect(getAboutContent('en')).toBe(aboutContentEn);
    expect(getAboutContent('zh-Hans')).toBe(aboutContentZh);
  });

  it('keeps routing and resource destinations locale-invariant', () => {
    expect(aboutContentZh.metadata.path).toBe(aboutContentEn.metadata.path);
    expect(aboutContentZh.officialResources.links.map(({ id, href }) => ({ id, href }))).toEqual(
      aboutContentEn.officialResources.links.map(({ id, href }) => ({ id, href })),
    );
  });

  it.each(routing.locales)('%s: lists every resource the page renders, once', (locale) => {
    const content = getAboutContent(locale);
    // V049: no translated link, group heading or disambiguation the page never renders.
    expect(content.officialResources.links.map(({ id }) => id)).toEqual([...ABOUT_RESOURCE_IDS]);
    for (const link of content.officialResources.links) {
      expect(link.href).toBe(ABOUT_RESOURCE_HREFS[link.id]);
    }
    expect(content.body.lede.trim()).not.toBe('');
    expect(content.facts.publicGoodsTemplate).toContain('{percent}');
  });

  it.each(routing.locales)('%s: opens on a statement, not the page name again (V180)', (locale) => {
    const content = getAboutContent(locale);
    expect(content.heading).not.toBe(content.eyebrow);
    expect(content.heading).not.toContain(content.breadcrumbLabel);
    // Who designed it, from the white paper's own byline.
    expect(content.origin.paragraphs[0]).toContain(WHITE_PAPER_SHARED.authorName);
    for (const id of ABOUT_MILESTONE_IDS) {
      const milestone = content.milestones.items[id];
      expect([milestone.label, milestone.status, milestone.text].every((text) => text.trim())).toBe(
        true,
      );
    }
  });

  it('provides complete Chinese prose and metadata', () => {
    expect(aboutContentZh.heading).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.metadata.description).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.origin.paragraphs).toHaveLength(aboutContentEn.origin.paragraphs.length);
    expect(aboutContentZh.body.denial).toMatch(/[\u3400-\u9fff]/);
  });
});
