import { aboutContentEn, aboutContentZh, getAboutContent } from '@/content/about';

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

  it('provides complete Chinese prose and metadata', () => {
    expect(aboutContentZh.heading).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.metadata.description).toMatch(/[\u3400-\u9fff]/);
    expect(aboutContentZh.body.paragraphs).toHaveLength(aboutContentEn.body.paragraphs.length);
    expect(aboutContentZh.body.denial).toMatch(/[\u3400-\u9fff]/);
  });
});
