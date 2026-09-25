import { hasMalformedRouteId } from '@/lib/idRoutes';

describe('hasMalformedRouteId', () => {
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
  ])('turns %s away', (path) => {
    expect(hasMalformedRouteId(path)).toBe(true);
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
    // Pages under an id and neighbouring routes are their routes' business.
    '/detail/abc/opengraph-image',
    '/allocation-finalized',
    '/allocation',
    '/gallery',
    '/',
  ])('leaves %s to its route', (path) => {
    expect(hasMalformedRouteId(path)).toBe(false);
  });
});
