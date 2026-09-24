import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { GESTURE_METHOD_COLOR, gestureMethodColor } from '../dataColors';

const themes = readFileSync(resolve(__dirname, '..', '..', '..', 'styles', 'themes.css'), 'utf8');

describe('gesture method colours', () => {
  it.each(Object.entries(GESTURE_METHOD_COLOR))(
    'paints %s from a method token every palette defines',
    (_method, color) => {
      const token = /^hsl\(var\((--method-[a-z-]+)\)\)$/.exec(color)?.[1];
      expect(token).toBeDefined();
      expect(themes).toMatch(new RegExp(`^\\s*${token}: var\\(--data-\\d\\);$`, 'm'));
    },
  );

  it('gives each method its own hue', () => {
    expect(new Set(Object.values(GESTURE_METHOD_COLOR)).size).toBe(3);
  });

  it.each([
    [0, GESTURE_METHOD_COLOR.eth],
    [1, GESTURE_METHOD_COLOR.ethRandomWalk],
    [2, GESTURE_METHOD_COLOR.cst],
    [-1, GESTURE_METHOD_COLOR.eth],
    [7, GESTURE_METHOD_COLOR.eth],
  ])('maps GestureType %i to its series colour', (gestureType, color) => {
    expect(gestureMethodColor(gestureType)).toBe(color);
  });
});
