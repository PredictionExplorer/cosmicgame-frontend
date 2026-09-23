import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The focus indicator (styles/focus-ring.css) must stay visible where the
 * old box-shadow ring was lost: under `shadow-*` utilities, in forced-colors
 * mode, and on elements carrying Tailwind's bare `outline-none` reset.
 */

const css = readFileSync(resolve(__dirname, '..', 'focus-ring.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Index of the end of the `@layer base { … }` block. */
function layerBaseEnd(): number {
  const start = css.indexOf('@layer base {');
  expect(start).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return i;
  }
  throw new Error('unbalanced @layer base block');
}

describe('focus ring', () => {
  it('draws keyboard focus as an outline in the ring token, not a box-shadow', () => {
    const base = css.slice(css.indexOf('@layer base {'), layerBaseEnd());
    expect(base).toMatch(
      /:focus-visible \{\s*outline: var\(--focus-ring-width\) solid var\(--focus-ring-color\);/,
    );
    expect(base).not.toMatch(/outline:\s*none/);
    expect(base).not.toMatch(/box-shadow/);
  });

  it('keeps a system-coloured outline in forced-colors mode, outside any layer', () => {
    const forced = css.indexOf('@media (forced-colors: active)');
    expect(forced).toBeGreaterThan(layerBaseEnd());
    expect(css.slice(forced)).toMatch(
      /:focus-visible \{\s*outline: 2px solid Highlight !important;/,
    );
  });

  it('restores the outline style on elements with a bare outline-none reset', () => {
    const shim = css.indexOf(':where(.outline-none):focus-visible:not(.focus-ring-none)');
    expect(shim).toBeGreaterThan(layerBaseEnd());
    expect(css.slice(shim, css.indexOf('}', shim))).toContain('outline-style: solid !important');
  });

  it.each(['focus-ring-inset', 'focus-ring-within', 'focus-ring-none'])(
    'offers the %s utility',
    (utility) => {
      expect(css).toContain(`@utility ${utility} {`);
    },
  );
});
