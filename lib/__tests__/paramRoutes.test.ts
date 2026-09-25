import { generateStaticParams as learnParams } from '@/app/[locale]/(landing)/learn/[slug]/page';
import { generateStaticParams as quizParams } from '@/app/[locale]/(landing)/quiz/[tier]/page';

import { isRejectedParamPath } from '@/lib/paramRoutes';

describe('isRejectedParamPath', () => {
  it.each([
    '/detail/abc',
    '/detail/-1',
    '/detail/1.5',
    '/detail/',
    '/detail/%E0%A4%A',
    '/allocation/abc',
    '/allocation/01',
    '/allocation/1e3',
    '/embed/endurance/abc',
    '/embed/endurance/-2',
    '/learn/no-such-guide',
    '/quiz/expert',
    '/quiz/',
  ])('turns %s away', (path) => {
    expect(isRejectedParamPath(path)).toBe(true);
  });

  it.each([
    '/detail/25',
    // Token ids print zero-padded, and the token page reads them that way.
    '/detail/000025',
    '/detail/25/',
    '/detail/%32%35',
    '/allocation/0',
    '/allocation/12',
    '/embed/endurance/3',
    '/quiz/basic',
    // Pages under an id and neighbouring routes are their routes' business.
    '/detail/abc/opengraph-image',
    '/allocation-finalized',
    '/allocation',
    '/learn',
    '/quiz',
    '/gallery',
    '/',
  ])('leaves %s to its route', (path) => {
    expect(isRejectedParamPath(path)).toBe(false);
  });

  // The guides and quiz tiers are prerendered with `dynamicParams = false`:
  // the proxy must serve exactly the pages the build generates.
  it('serves every guide and quiz tier the build prerenders', () => {
    for (const { slug } of learnParams()) {
      expect(isRejectedParamPath(`/learn/${slug}`)).toBe(false);
    }
    for (const { tier } of quizParams()) {
      expect(isRejectedParamPath(`/quiz/${tier}`)).toBe(false);
    }
  });
});
