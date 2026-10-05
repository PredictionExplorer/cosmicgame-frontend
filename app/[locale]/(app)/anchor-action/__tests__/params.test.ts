import { parseAnchorActionParams } from '@/utils/routeParams';

describe('parseAnchorActionParams', () => {
  it('reads the collection flag and a canonical action id', () => {
    expect(parseAnchorActionParams('0', '23')).toEqual({ isRwalk: 0, actionId: 23 });
    expect(parseAnchorActionParams('1', '0')).toEqual({ isRwalk: 1, actionId: 0 });
  });

  it('rejects any other collection flag', () => {
    for (const flag of ['2', '-1', '01', 'yes', '']) {
      expect(parseAnchorActionParams(flag, '23')).toBeNull();
    }
  });

  it('rejects an action id that is not canonical', () => {
    for (const id of ['abc', '023', '2.5', '-1', '']) {
      expect(parseAnchorActionParams('0', id)).toBeNull();
    }
  });
});
