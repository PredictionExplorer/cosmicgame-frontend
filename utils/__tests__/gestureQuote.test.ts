import { parseEther } from 'viem';

import {
  IMPRINT_COST_BUFFER_PERCENT,
  MAX_COLLISION_BUFFER_PERCENT,
  clampCollisionBufferPercent,
  ethGestureBaseCost,
  ethGestureSendAmount,
  formatEthQuote,
  imprintSendValueWei,
} from '../gestureQuote';

describe('formatEthQuote', () => {
  it('keeps five significant digits instead of rounding to two decimals', () => {
    // Regression: the submit label once rounded 0.10415 ETH to "0.10".
    expect(formatEthQuote(0.10210695701197195)).toBe('0.10211');
    expect(formatEthQuote(0.104152)).toBe('0.10415');
    expect(formatEthQuote(0.0090123)).toBe('0.0090123');
    expect(formatEthQuote(12.345678)).toBe('12.346');
  });

  it('shows a confirmed zero as zero', () => {
    expect(formatEthQuote(0)).toBe('0');
  });

  it('never groups digits', () => {
    expect(formatEthQuote(12345.6)).toBe('12346');
  });
});

describe('gesture cost quotes', () => {
  it('halves the ETH price for a RandomWalk gesture', () => {
    expect(ethGestureBaseCost(0.1, 'ETH')).toBe(0.1);
    expect(ethGestureBaseCost(0.1, 'RandomWalk')).toBeCloseTo(0.05);
  });

  it('adds the collision buffer to the amount sent', () => {
    expect(ethGestureSendAmount(0.10211, 'ETH', 2)).toBeCloseTo(0.1041522);
    expect(ethGestureSendAmount(0.1, 'RandomWalk', 2)).toBeCloseTo(0.051);
  });
});

describe('clampCollisionBufferPercent', () => {
  it.each([
    [2, 2],
    [0, 0],
    [-5, 0],
    ['', 0],
    ['abc', 0],
    [Number.NaN, 0],
    [12.7, 12],
    [80, MAX_COLLISION_BUFFER_PERCENT],
  ])('clamps %p to %p', (input, expected) => {
    expect(clampCollisionBufferPercent(input)).toBe(expected);
  });
});

describe('imprintSendValueWei', () => {
  it('adds exactly the imprint buffer to the contract cost', () => {
    const cost = parseEther('0.0913');
    expect(imprintSendValueWei(cost)).toBe(
      (cost * BigInt(100 + IMPRINT_COST_BUFFER_PERCENT)) / 100n,
    );
    expect(imprintSendValueWei(parseEther('1'))).toBe(parseEther('1.01'));
  });
});
