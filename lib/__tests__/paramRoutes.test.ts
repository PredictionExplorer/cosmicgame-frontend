import { generateStaticParams as learnParams } from '@/app/[locale]/(landing)/learn/[slug]/page';
import { generateStaticParams as quizParams } from '@/app/[locale]/(landing)/quiz/[tier]/page';

import { isAppOnlyPath } from '@/lib/hostRouting';
import {
  PAGE_ALIASES,
  canonicalParamPath,
  isRejectedParamPath,
  pageAliasTarget,
} from '@/lib/paramRoutes';

// The real address checks (the shared viem mock is lenient).
jest.mock('viem', () => jest.requireActual('viem'));

describe('isRejectedParamPath', () => {
  it.each([
    '/detail/abc',
    '/detail/-1',
    '/detail/1.5',
    '/detail/',
    '/detail/%E0%A4%A',
    '/gesture/abc',
    '/gesture/12abc',
    '/gesture/-3',
    '/gesture/1.5',
    '/allocation/abc',
    '/allocation/01',
    '/allocation/1e3',
    '/embed/endurance/abc',
    '/embed/endurance/-2',
    '/anchor-action/2/5',
    '/anchor-action/0/05',
    '/anchor-action/yes/5',
    '/distributions-by-token/0x12/45',
    '/distributions-by-token/0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c/045',
    '/distributions-by-token/0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c%3Fx%3D1/45',
    '/system-event/2/350/200',
    '/system-event/2/0200/350',
    '/system-event/-1/200/350',
    '/system-event/2/-2/350',
    '/system-event/abc/200/350',
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
    '/gesture/29434',
    '/allocation/0',
    '/allocation/12',
    '/embed/endurance/3',
    '/anchor-action/0/23',
    '/anchor-action/1/0',
    '/distributions-by-token/0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c/45',
    '/distributions-by-token/0x7406b34d25a9b7841cac133e3173919e0af6bc6c/0',
    '/system-event/2/200/350',
    // The first setup's window starts at the list's "from the beginning".
    '/system-event/0/-1/99',
    '/quiz/basic',
    // Pages under an id and neighbouring routes are their routes' business.
    '/detail/abc/opengraph-image',
    '/anchor-action/0',
    '/system-event/2/200',
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

  // The proxy turns away exactly the segments the routes turn away: a record route's own
  // parser decides, and the proxy's check never refuses a page the route would serve.
  it('agrees with the token distributions route on every address and token id', () => {
    const { parseTokenDistributionParams } = jest.requireActual<
      typeof import('@/app/[locale]/(app)/distributions-by-token/[address]/[tokenId]/params')
    >('@/app/[locale]/(app)/distributions-by-token/[address]/[tokenId]/params');
    const holder = '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c';
    for (const address of [holder, holder.toLowerCase(), holder.toUpperCase(), '0x12', 'abc']) {
      for (const tokenId of ['45', '0', '045', '4.5', '-1']) {
        const served = parseTokenDistributionParams(address, tokenId) !== null;
        expect(isRejectedParamPath(`/distributions-by-token/${address}/${tokenId}`)).toBe(!served);
      }
    }
  });
});

describe('canonicalParamPath', () => {
  it.each([
    ['/detail/025', '/detail/25'],
    ['/detail/0001', '/detail/1'],
    ['/detail/00', '/detail/0'],
  ])('gives the zero-padded Signature %s its one URL, %s', (path, canonical) => {
    expect(canonicalParamPath(path)).toBe(canonical);
    // The URL it moves to is one the route serves, and canonical itself.
    expect(isRejectedParamPath(canonical)).toBe(false);
    expect(canonicalParamPath(canonical)).toBeNull();
  });

  it.each([
    '/detail/25',
    '/detail/0',
    '/detail/abc',
    '/detail/025/opengraph-image',
    '/gesture/025',
    '/allocation/01',
    '/detail/99999999999999999999',
  ])('leaves %s to routing', (path) => {
    expect(canonicalParamPath(path)).toBeNull();
  });
});

describe('pageAliasTarget', () => {
  it('names the page an alias stands for', () => {
    expect(pageAliasTarget('/source-code')).toBe('/code');
  });

  it.each(['/code', '/source-code/extra', '/source-code/', '/', '/detail/025'])(
    'leaves %s to routing',
    (path) => {
      expect(pageAliasTarget(path)).toBeNull();
    },
  );

  it.each([...PAGE_ALIASES])(
    'keeps %s on the app host and points it at a page, never another alias',
    (alias, page) => {
      // The landing host sends app-only paths to the app host, alias resolved.
      expect(isAppOnlyPath(alias)).toBe(true);
      expect(isAppOnlyPath(page)).toBe(true);
      expect(pageAliasTarget(page)).toBeNull();
    },
  );
});
