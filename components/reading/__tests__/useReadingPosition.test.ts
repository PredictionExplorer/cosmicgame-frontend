import { activeSectionId } from '../useReadingPosition';

const sections = (tops: number[]) => tops.map((top, index) => ({ id: `s${index + 1}`, top }));

describe('activeSectionId', () => {
  it('is nothing before the first heading reaches the reading line', () => {
    expect(activeSectionId(sections([600, 1400]), 225, false)).toBeNull();
  });

  it('is the last section whose heading has passed the reading line', () => {
    expect(activeSectionId(sections([-800, 120, 700]), 225, false)).toBe('s2');
    expect(activeSectionId(sections([-800, -100, 225]), 225, false)).toBe('s3');
  });

  it('is the last section at the bottom of the page, however short it is', () => {
    // A closing section too short to reach the line would otherwise never be read.
    expect(activeSectionId(sections([-800, -100, 850]), 225, true)).toBe('s3');
  });

  it('is nothing without sections', () => {
    expect(activeSectionId([], 225, true)).toBeNull();
  });
});
