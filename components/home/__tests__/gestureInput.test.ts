import { protocolFacts } from '@/content/protocol-facts';

import {
  GESTURE_MESSAGE_MAX_BYTES,
  fitGestureMessage,
  gestureMessageBytes,
  parseTokenId,
  readRandomWalkLink,
} from '../gestureInput';

describe('gesture message cap', () => {
  it('defaults to the documented contract cap', () => {
    expect(GESTURE_MESSAGE_MAX_BYTES).toBe(protocolFacts.gestureMessageMaxLength);
  });

  it('counts UTF-8 bytes, as the contract does', () => {
    expect(gestureMessageBytes('gm')).toBe(2);
    expect(gestureMessageBytes('落笔')).toBe(6);
    expect(gestureMessageBytes('한글')).toBe(6);
    expect(gestureMessageBytes('😀')).toBe(4);
    expect(gestureMessageBytes('Việt')).toBe(6);
  });

  it('keeps a message that fits exactly as typed', () => {
    const message = 'a'.repeat(GESTURE_MESSAGE_MAX_BYTES);
    expect(fitGestureMessage(message, GESTURE_MESSAGE_MAX_BYTES)).toBe(message);
  });

  it('cuts a 100-character Chinese message at the last whole character under 280 bytes', () => {
    const fitted = fitGestureMessage('落'.repeat(100), 280);
    expect(fitted).toBe('落'.repeat(93));
    expect(gestureMessageBytes(fitted)).toBe(279);
  });

  it('never leaves half of a combined character at the cut', () => {
    // A flag is two code points (8 bytes): it goes whole or not at all.
    expect(fitGestureMessage('ab🇺🇦', 6)).toBe('ab');
  });
});

describe('Random Walk deep link', () => {
  it('reads the method and a valid token', () => {
    expect(readRandomWalkLink('?randomwalk=1&tokenId=12')).toEqual({ tokenId: 12 });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=0')).toEqual({ tokenId: 0 });
  });

  it('chooses the method but no token when the link names none, or a bad one', () => {
    expect(readRandomWalkLink('?randomwalk=1')).toEqual({ tokenId: null });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=abc')).toEqual({ tokenId: null });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=-3')).toEqual({ tokenId: null });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=1.5')).toEqual({ tokenId: null });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=1e3')).toEqual({ tokenId: null });
    expect(readRandomWalkLink('?randomwalk=1&tokenId=99999999999999999999')).toEqual({
      tokenId: null,
    });
  });

  it('is not a Random Walk link without the flag', () => {
    expect(readRandomWalkLink('')).toBeNull();
    expect(readRandomWalkLink('?tokenId=12')).toBeNull();
  });

  it('parses token ids strictly', () => {
    expect(parseTokenId(' 7 ')).toBe(7);
    expect(parseTokenId('')).toBeNull();
    expect(parseTokenId(null)).toBeNull();
    expect(parseTokenId(undefined)).toBeNull();
  });
});
