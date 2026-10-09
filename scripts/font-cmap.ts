/**
 * Font coverage helpers for the build and test scripts: which characters a
 * checked-in font can render. The SFNT reader itself lives in lib/og/sfnt.ts,
 * where the share cards also use it to measure their text.
 */
export { fontCodePoints, uncoveredCharacters } from '../lib/og/sfnt';
