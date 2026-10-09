import { OPTIMIZED_ART_WIDTHS, withOptimizedRenditions } from '@/lib/artRenditions';

const THUMB = { src: 'https://media.example/0xabc/thumb_card.webp', width: 640 };
const FULL = { src: 'https://media.example/0xabc/images/web/full.webp', width: 3456 };
const RATIO = 3456 / 2234;

describe('withOptimizedRenditions', () => {
  it('adds optimizer sizes between the published thumbnail and original', () => {
    const set = withOptimizedRenditions([FULL, THUMB], RATIO);
    expect(set.map((rendition) => rendition.width)).toEqual([640, 1200, 1920, 3456]);
    for (const rendition of set.slice(1, 3)) {
      const url = new URL(rendition.src, 'https://app.example');
      expect(url.pathname).toBe('/_next/image');
      expect(url.searchParams.get('url')).toBe(FULL.src);
      expect(url.searchParams.get('w')).toBe(String(rendition.width));
    }
    // The published files stay as they are, so no size is fetched twice.
    expect(set[0]).toEqual(THUMB);
    expect(set[3]).toEqual(FULL);
  });

  it('adds only the sizes that fall between the published files', () => {
    const small = { src: 'https://media.example/0xabc/small.webp', width: 1500 };
    const set = withOptimizedRenditions([THUMB, small], RATIO);
    expect(set.map((rendition) => rendition.width)).toEqual([640, 1200, 1500]);
    expect(OPTIMIZED_ART_WIDTHS).toEqual([1200, 1920]);
  });

  it('leaves a single file, or none, as it is', () => {
    expect(withOptimizedRenditions([FULL], RATIO)).toEqual([FULL]);
    expect(withOptimizedRenditions([{ src: '', width: 640 }], RATIO)).toEqual([]);
  });
});
