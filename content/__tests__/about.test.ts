import {
  ABOUT_RESOURCE_GROUPS,
  aboutContentEn,
  aboutContentZh,
  getAboutContent,
} from '@/content/about';

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

  it.each(routing.locales)('%s: groups every official resource exactly once', (locale) => {
    const content = getAboutContent(locale);
    const grouped = Object.values(ABOUT_RESOURCE_GROUPS).flat();
    expect([...grouped].sort()).toEqual(content.officialResources.links.map(({ id }) => id).sort());
    for (const heading of Object.values(content.officialResources.groups)) {
      expect(heading.trim()).not.toBe('');
    }
    expect(content.body.lede.trim()).not.toBe('');
    expect(content.body.disambiguation).toMatch(/COSMIC/);
    expect(content.facts.publicGoodsTemplate).toContain('{percent}');
  });

  it('provides complete Chinese prose and metadata', () => {
    expect(aboutContentZh.heading).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.metadata.description).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.body.paragraphs).toHaveLength(aboutContentEn.body.paragraphs.length);
    expect(aboutContentZh.body.denial).toMatch(/[\u3400-\u9fff]/);
  });
});
