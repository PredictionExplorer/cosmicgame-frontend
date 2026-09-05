import { getGestureSubmitLabel, type GestureSubmitLabelInput } from '../gestureSubmitLabel';

const t = jest.fn((key: string, values?: Record<string, unknown>) =>
  JSON.stringify({ key, ...values }),
) as unknown as GestureSubmitLabelInput['t'];

const baseInput: GestureSubmitLabelInput = {
  t,
  gestureType: 'ETH',
  ethPrice: 0.01,
  gestureCostPlus: 2,
  rwlkId: -1,
  cstGestureData: { CSTPrice: 1.5, isFree: false, source: 'api' },
};

describe('getGestureSubmitLabel', () => {
  it.each([null, undefined, Number.NaN, -1])(
    'does not quote missing or invalid ETH as zero: %s',
    (ethPrice) => {
      expect(getGestureSubmitLabel({ ...baseInput, ethPrice })).toBe(
        JSON.stringify({ key: 'form.submit.generic', method: 'ETH' }),
      );
    },
  );

  it('keeps a confirmed zero ETH quote', () => {
    expect(getGestureSubmitLabel({ ...baseInput, ethPrice: 0 })).toBe(
      JSON.stringify({ key: 'form.submit.eth', cost: '0.00000' }),
    );
  });

  it('quotes the same buffer and RandomWalk reduction used by the form', () => {
    expect(getGestureSubmitLabel({ ...baseInput, gestureType: 'RandomWalk', rwlkId: 12 })).toBe(
      JSON.stringify({ key: 'form.submit.randomWalkWithToken', tokenId: '12', cost: '0.00510' }),
    );
  });

  it('withholds the CST quote when only its timing data is available', () => {
    expect(
      getGestureSubmitLabel({
        ...baseInput,
        gestureType: 'CST',
        cstGestureData: { CSTPrice: 0, isFree: false, source: 'empty' },
      }),
    ).toBe(JSON.stringify({ key: 'form.submit.generic', method: 'CST' }));
  });

  it('offers the free label for a confirmed zero CST quote', () => {
    expect(
      getGestureSubmitLabel({
        ...baseInput,
        gestureType: 'CST',
        cstGestureData: { CSTPrice: 0, isFree: true, source: 'contract' },
      }),
    ).toBe(JSON.stringify({ key: 'form.submit.cstFree' }));
  });
});
