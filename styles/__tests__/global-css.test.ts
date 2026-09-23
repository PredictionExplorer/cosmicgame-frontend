/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import postcss, { type ChildNode, type Root, type Rule } from 'postcss';
import { compile } from 'tailwindcss';

/**
 * Site-wide guarantees in styles/global.css and styles/typography.css that
 * no component opts into, so nothing else would catch their removal.
 */

const STYLES = resolve(__dirname, '..');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const globalSource = readFileSync(resolve(STYLES, 'global.css'), 'utf8');
const globalCss = strip(globalSource);
const typographyCss = strip(readFileSync(resolve(STYLES, 'typography.css'), 'utf8'));

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
