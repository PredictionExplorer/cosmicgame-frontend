/**
 * Series colours for charts and legends painted through SVG attributes or
 * inline styles, where a Tailwind class cannot reach (recharts `stroke` and
 * `fill`). Each reads a data token from styles/themes.css, so a gesture
 * method keeps one hue on every chart and in every palette
 * (docs/design-system.md → Data series). In class names use the matching
 * utilities instead: `bg-method-eth`, `text-method-cst`.
 */
export const GESTURE_METHOD_COLOR = {
  /** A gesture paid in ETH. */
  eth: 'hsl(var(--method-eth))',
  /** A gesture paid in ETH with a RandomWalk NFT. */
  ethRandomWalk: 'hsl(var(--method-eth-rwlk))',
  /** A gesture paid in CST. */
  cst: 'hsl(var(--method-cst))',
} as const;

export type GestureMethod = keyof typeof GESTURE_METHOD_COLOR;

/** The API's numeric `GestureType`: 0 ETH, 1 ETH with a RandomWalk NFT, 2 CST. */
const METHOD_BY_GESTURE_TYPE: Readonly<Partial<Record<number, GestureMethod>>> = {
  0: 'eth',
  1: 'ethRandomWalk',
  2: 'cst',
};

/** The series colour of a gesture by its `GestureType`; an unknown type draws as ETH. */
export function gestureMethodColor(gestureType: number): string {
  return GESTURE_METHOD_COLOR[METHOD_BY_GESTURE_TYPE[gestureType] ?? 'eth'];
}
