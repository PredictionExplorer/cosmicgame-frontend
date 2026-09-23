import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Site-wide guarantees in styles/global.css and styles/typography.css that
 * no component opts into, so nothing else would catch their removal.
 */

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const globalCss = strip(readFileSync(resolve(__dirname, '..', 'global.css'), 'utf8'));
const typographyCss = strip(readFileSync(resolve(__dirname, '..', 'typography.css'), 'utf8'));

/** The declarations of the first rule whose selector contains `selector`. */
function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThan(-1);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
}

/** Font sizes (rem or px) declared anywhere in `body`, in px. */
function fontSizes(body: string): number[] {
  return [...body.matchAll(/font-size:\s*([\d.]+)(rem|px)/g)].map((m) =>
    m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]),
  );
}

describe('global typography guarantees', () => {
  it('renders the retired dimmed text classes in the subtle tier', () => {
    const shim = ruleBody(globalCss, '.text-muted-foreground\\/60');
    expect(shim).toContain('color: hsl(var(--subtle-foreground))');
    for (const cls of [
      'muted-foreground\\/40',
      'muted-foreground\\/50',
      'white\\/40',
      'white\\/45',
    ])
      expect(globalCss).toContain(`.text-${cls}`);
  });

  it('underlines unstyled links inside running text', () => {
    const body = ruleBody(globalCss, 'a:not([class]) {');
    expect(body).toContain('text-decoration-line: underline');
  });

  it('keeps bold Clash Display from closing its word spaces', () => {
    expect(ruleBody(globalCss, '.font-display:is(.font-bold')).toContain(
      'font-weight: var(--display-weight-strong)',
    );
    expect(ruleBody(globalCss, '.font-display {')).toContain(
      'word-spacing: var(--display-word-spacing)',
    );
  });

  it('keeps the mobile table-card label at 12px or more, in the subtle tier', () => {
    const label = ruleBody(globalCss, '.cs-table tbody td::before');
    expect(label).toContain('color: hsl(var(--subtle-foreground))');
    for (const size of fontSizes(label)) expect(size).toBeGreaterThanOrEqual(12);
  });

  it('shares one content edge on the --gutter token', () => {
    expect(ruleBody(globalCss, '@utility site-container')).toContain(
      'width: min(100% - 2 * var(--gutter), 80rem)',
    );
  });

  it('never sets readable text below the 12px floor in a type utility', () => {
    for (const size of fontSizes(typographyCss)) expect(size).toBeGreaterThanOrEqual(12);
  });

  it('drops case and tracking from eyebrows in Chinese, Japanese and Korean', () => {
    const eyebrow = typographyCss.slice(typographyCss.indexOf('@utility type-eyebrow'));
    const cjk = eyebrow.slice(eyebrow.indexOf(':lang(zh), :lang(ja), :lang(ko)'));
    const body = cjk.slice(cjk.indexOf('{') + 1, cjk.indexOf('}'));
    expect(body).toContain('letter-spacing: 0');
    expect(body).toContain('text-transform: none');
  });

  it('sets figures with tabular, lining numerals and a slashed zero', () => {
    for (const tier of ['xl', 'lg', 'md', 'sm']) {
      const body = typographyCss.slice(typographyCss.indexOf(`@utility type-figure-${tier} {`));
      expect(body.slice(0, body.indexOf('}'))).toContain(
        'font-variant-numeric: tabular-nums lining-nums slashed-zero',
      );
    }
  });

  it('reads display weight and tracking from the per-script tokens', () => {
    for (const tier of ['display-xl', 'display-lg', 'display-md', 'display-sm', 'heading-1']) {
      const start = typographyCss.indexOf(`@utility type-${tier} {`);
      const body = typographyCss.slice(start, typographyCss.indexOf('}', start));
      expect(body).toContain('font-weight: var(--display-weight)');
      expect(body).toContain('var(--display-tracking-scale)');
    }
  });
});
