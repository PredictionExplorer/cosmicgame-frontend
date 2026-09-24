/**
 * @jest-environment node
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import postcss, { type AtRule, type ChildNode, type Root, type Rule } from 'postcss';
import { compile } from 'tailwindcss';

/**
 * Site-wide guarantees in styles/global.css, styles/typography.css and
 * styles/tables.css that no component opts into, so nothing else would catch
 * their removal.
 */

const STYLES = resolve(__dirname, '..');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const globalSource = readFileSync(resolve(STYLES, 'global.css'), 'utf8');
const globalCss = strip(globalSource);
const typographyCss = strip(readFileSync(resolve(STYLES, 'typography.css'), 'utf8'));
const tablesCss = strip(readFileSync(resolve(STYLES, 'tables.css'), 'utf8'));

/** styles/global.css as Tailwind compiles it for `candidates`, parsed. */
async function compileGlobalCss(candidates: string[]): Promise<Root> {
  const compiler = await compile(globalSource, {
    base: STYLES,
    loadStylesheet: async (id, base) => {
      // Resolved from package.json: jest maps every `.css` specifier to a mock.
      const path =
        id === 'tailwindcss'
          ? resolve(dirname(require.resolve('tailwindcss/package.json')), 'index.css')
          : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
  });
  return postcss.parse(compiler.build(candidates));
}

/** Top-level rules in document order, each with the cascade layer it sits in. */
function topLevelRules(root: Root): Array<{ rule: Rule; layer: string | null }> {
  const rules: Array<{ rule: Rule; layer: string | null }> = [];
  const visit = (node: ChildNode, layer: string | null) => {
    if (node.type === 'rule') rules.push({ rule: node, layer });
    if (node.type === 'atrule' && node.nodes) {
      const inner = node.name === 'layer' ? node.params : layer;
      node.nodes.forEach((child) => visit(child, inner));
    }
  };
  root.nodes.forEach((node) => visit(node, null));
  return rules;
}

const DIMMED = [
  'text-muted-foreground/40',
  'text-muted-foreground/50',
  'text-muted-foreground/60',
  'text-white/40',
  'text-white/45',
];
/** The same class as a CSS selector: `.text-white\/40`. */
const classSelector = (name: string) => `.${name.replace(/[/[\]=:.]/g, (c) => `\\${c}`)}`;

describe('retired dimmed-text classes', () => {
  // Interactive controls pair a dimmed rest colour with a state colour
  // (`text-muted-foreground/50 hover:text-primary`, FAQ's copy-link buttons).
  const VARIANTS = [
    'hover:text-primary',
    'group-hover:text-primary',
    'focus-visible:text-foreground',
    'aria-selected:text-foreground',
    'data-[state=open]:text-foreground',
  ];
  let rules: Array<{ rule: Rule; layer: string | null }>;

  beforeAll(async () => {
    rules = topLevelRules(await compileGlobalCss([...DIMMED, ...VARIANTS]));
  });

  const shim = () => {
    const found = rules.filter(({ rule }) =>
      rule.some((node) => node.type === 'decl' && node.value === 'hsl(var(--subtle-foreground))'),
    );
    const match = found.find(({ rule }) => rule.selectors.includes(classSelector(DIMMED[0]!)));
    expect(match).toBeDefined();
    return match!;
  };

  it('render in the subtle tier, as the last word among the base utilities', () => {
    const { rule, layer } = shim();
    expect(layer).toBe('utilities');
    expect([...rule.selectors].sort()).toEqual(DIMMED.map(classSelector).sort());
    for (const name of DIMMED) {
      const generated = rules.findIndex(
        ({ rule: candidate, layer: candidateLayer }) =>
          candidateLayer === 'utilities' && candidate.selector === classSelector(name),
      );
      expect(generated).toBeGreaterThan(-1);
      expect(generated).toBeLessThan(rules.indexOf(shim()));
    }
  });

  it('carry single-class specificity, so every state variant still wins', () => {
    // Unlayered, the shim once beat every layered utility, hover: included.
    for (const selector of shim().rule.selectors) expect(selector).toMatch(/^\.(?:[\w-]|\\.)+$/);
    for (const variant of VARIANTS) {
      const generated = rules.find(({ rule }) => rule.selector === classSelector(variant));
      expect(generated?.layer).toBe('utilities');
      // Tailwind nests the state under the class: `&:hover`, `&[aria-selected="true"]`,
      // `&:is(:where(.group):hover *)`. The extra pseudo-class or attribute
      // outranks the shim's lone class.
      const nested = generated!.rule.first;
      expect(nested?.type).toBe('rule');
      expect((nested as Rule).selector).toMatch(/^&(?::|\[)/);
    }
  });
});

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
    const label = ruleBody(tablesCss, ".cs-table:not([data-layout='compact']) tbody td::before");
    expect(label).toContain('color: hsl(var(--subtle-foreground))');
    for (const size of fontSizes(label)) expect(size).toBeGreaterThanOrEqual(12);
  });

  it('keeps the starfield out from behind the widest hero content, the home desk', () => {
    // The home is the one `hero` backdrop page; its desk sits on the site's
    // content edge, `w-[min(100%-2*var(--gutter),…rem)]`.
    const home = readFileSync(resolve(STYLES, '..', 'app/[locale]/(app)/HomePage.tsx'), 'utf8');
    const desk = Number(/w-\[min\(100%-2\*var\(--gutter\),([\d.]+)rem\)\]/.exec(home)?.[1]);
    const column = Number(/var\(--starfield-column, ([\d.]+)rem\)/.exec(globalCss)?.[1]);
    expect(desk).toBeGreaterThan(0);
    expect(column).toBeGreaterThanOrEqual(desk);
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

  it('sets figures in Inter with tabular, lining numerals (no zero feature to promise)', () => {
    for (const tier of ['xl', 'lg', 'md', 'sm']) {
      const body = typographyCss.slice(typographyCss.indexOf(`@utility type-figure-${tier} {`));
      const rule = body.slice(0, body.indexOf('}'));
      expect(rule).toContain('font-variant-numeric: tabular-nums lining-nums;');
      // Named, not inherited: a figure inside a font-display or font-mono
      // parent would otherwise turn Clash (round zero) or JetBrains Mono.
      expect(rule).toContain('font-family: var(--body-font-stack)');
    }
  });

  it('keeps the Inter heading tiers in Inter inside a display or mono parent', () => {
    for (const tier of ['heading-3', 'title']) {
      const body = typographyCss.slice(typographyCss.indexOf(`@utility type-${tier} {`));
      expect(body.slice(0, body.indexOf('}'))).toContain('font-family: var(--body-font-stack)');
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

/** Every declaration Tailwind emits for `className`, media conditions included. */
async function declarationsFor(className: string): Promise<string> {
  const root = await compileGlobalCss([className]);
  const selector = `.${className.replace(/[[\].:/]/g, (char) => `\\${char}`)}`;
  const out: string[] = [];
  root.walkRules((rule) => {
    if (!rule.selector.split(',').some((part) => part.trim() === selector)) return;
    rule.walkDecls((decl) => {
      // Media conditions nested inside the rule or wrapping it, innermost last.
      const conditions: string[] = [];
      for (let node = decl.parent; node && node.type !== 'root'; node = node.parent) {
        if (node.type === 'atrule' && (node as AtRule).name === 'media') {
          conditions.unshift(`@media ${(node as AtRule).params}`);
        }
      }
      out.push(`${conditions.join(' ')} ${decl.prop}: ${decl.value}`.trim());
    });
  });
  return out.join('\n');
}

describe('touch targets on coarse pointers', () => {
  it('grows a standalone control to 44px with padding a negative margin hands back', async () => {
    const css = await declarationsFor('touch-hit-area');
    expect(css).toContain('@media (pointer: coarse) padding-block: var(--touch-pad-block)');
    expect(css).toContain(
      '@media (pointer: coarse) margin-block: calc(var(--touch-pad-block) * -1)',
    );
    expect(css).toContain(
      '@media (pointer: coarse) margin-inline: calc(var(--touch-pad-inline) * -1)',
    );
    expect(css).toContain('--touch-pad-block: max(0px, calc((2.75rem - 1.1em) / 2))');
  });

  it('gives box-laid text links a 24px floor that inline links never take', async () => {
    for (const className of ['link', 'link-quiet', 'link-entity', 'touch-link-target']) {
      const css = await declarationsFor(className);
      expect(css).toContain('@media (pointer: coarse) min-block-size: 1.5rem');
      expect(css).toContain('@media (pointer: coarse) min-inline-size: 1.5rem');
    }
  });
});

describe('links', () => {
  it('marks a record link at rest with a hairline in the rule colour', async () => {
    const css = await declarationsFor('link-entity');
    expect(css).toContain('text-decoration-line: underline');
    expect(css).toContain('text-decoration-color: hsl(var(--rule))');
    // Solid on hover and focus.
    expect(css).toContain('text-decoration-color: currentColor');
  });
});

describe('overlay motion', () => {
  it('animates entrances and exits only when motion is welcome', async () => {
    for (const className of ['animate-in', 'animate-out']) {
      const css = await declarationsFor(className);
      expect(css).toMatch(/^@media \(prefers-reduced-motion: no-preference\) animation: /m);
      expect(css).not.toMatch(/^animation:/m);
    }
  });

  it('turns the tailwindcss-animate modifiers into enter and exit values', async () => {
    expect(await declarationsFor('fade-in-0')).toContain('--tw-enter-opacity: calc(0 / 100)');
    expect(await declarationsFor('zoom-out-95')).toContain('--tw-exit-scale: calc(95 / 100)');
    expect(await declarationsFor('zoom-in-[0.98]')).toContain('--tw-enter-scale: 0.98');
    expect(await declarationsFor('slide-in-from-top-2')).toContain(
      '--tw-enter-translate-y: calc(var(--spacing) * 2 * -1)',
    );
    expect(await declarationsFor('slide-out-to-left')).toContain('--tw-exit-translate-x: -100%');
  });
});

describe('Korean display punctuation', () => {
  it('falls back to the self-hosted cut where no Korean face is installed', () => {
    // Regression: the alias listed local() faces only, so Android and Linux
    // readers, whose Korean face goes by no listed name, got Clash's heavy
    // square period back.
    const name = globalCss.indexOf("font-family: 'CS Korean Display Punctuation'");
    expect(name).toBeGreaterThan(-1);
    const face = globalCss.slice(
      globalCss.lastIndexOf('@font-face', name),
      globalCss.indexOf('}', name),
    );
    const url = face.match(/url\('([^']+)'\) format\('truetype'\)/)?.[1];
    expect(url).toBe('/fonts/noto-sans-kr/NotoSansKR-punctuation.ttf');
    expect(face.trimEnd().indexOf('url(')).toBeGreaterThan(face.lastIndexOf('local('));
    expect(existsSync(resolve(STYLES, '..', 'public', url!.slice(1)))).toBe(true);
  });
});
