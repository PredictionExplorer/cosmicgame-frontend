/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postcss, { type AtRule, type Rule } from 'postcss';

/**
 * The ledger's layout guarantees (styles/tables.css). Every table in the
 * app, migrated or not, gets these from the shared `.cs-table` markup, so
 * they are pinned here rather than in any one component's test.
 */

const css = readFileSync(resolve(__dirname, '..', 'tables.css'), 'utf8');
const root = postcss.parse(css);

function rulesIn(container: { each: (fn: (node: postcss.ChildNode) => void) => void }): Rule[] {
  const rules: Rule[] = [];
  container.each((node) => {
    if (node.type === 'rule') rules.push(node);
  });
  return rules;
}

const topRules = rulesIn(root);
const phone = root.nodes.find(
  (node): node is AtRule =>
    node.type === 'atrule' && node.name === 'media' && node.params.includes('max-width: 39.99em'),
);
const phoneRules = phone ? rulesIn(phone) : [];

function declaration(rules: Rule[], selector: string, property: string): string | undefined {
  for (const rule of rules) {
    if (!rule.selectors.includes(selector)) continue;
    let value: string | undefined;
    rule.walkDecls(property, (decl) => {
      value = decl.value;
    });
    if (value !== undefined) return value;
  }
  return undefined;
}

const RECORD = ".cs-table:not([data-layout='compact'])";

describe('styles/tables.css', () => {
  it('aligns headers and cells from one data attribute', () => {
    expect(declaration(topRules, ".cs-table :is(th, td)[data-align='end']", 'text-align')).toBe(
      'end',
    );
    expect(declaration(topRules, ".cs-table :is(th, td)[data-align='start']", 'text-align')).toBe(
      'start',
    );
  });

  it('sets numeric cells in tabular, lining figures', () => {
    expect(declaration(topRules, '.cs-table td[data-numeric]', 'font-variant-numeric')).toBe(
      'tabular-nums lining-nums slashed-zero',
    );
  });

  it('turns rows into records on phones unless the table is compact', () => {
    expect(phone).toBeDefined();
    expect(declaration(phoneRules, `${RECORD} tbody td`, 'display')).toBe('grid');
    expect(
      phoneRules.some((rule) => rule.selector.includes("[data-layout='compact'] tbody td")),
    ).toBe(false);
  });

  it('sets every record value at the end edge, so values never zig-zag', () => {
    expect(declaration(phoneRules, `${RECORD} tbody td > [data-slot='value']`, 'text-align')).toBe(
      'end',
    );
    expect(
      declaration(phoneRules, `${RECORD} tbody td[data-stack] > [data-slot='value']`, 'text-align'),
    ).toBe('start');
  });

  it('labels each value from its own cell, in sentence case at 13px', () => {
    const label = `${RECORD} tbody td::before`;
    expect(declaration(phoneRules, label, 'content')).toBe('attr(data-label)');
    expect(declaration(phoneRules, label, 'text-transform')).toBe('none');
    expect(declaration(phoneRules, label, 'font-size')).toBe('0.8125rem');
    expect(declaration(phoneRules, label, 'color')).toBe('hsl(var(--subtle-foreground))');
  });

  it('drops labelled blank lines and secondary columns on phones', () => {
    expect(declaration(phoneRules, `${RECORD} td[data-empty='true']`, 'display')).toBe('none');
    expect(declaration(phoneRules, ".cs-table td[data-priority='secondary']", 'display')).toBe(
      'none',
    );
  });

  it('keeps values at a readable size on phones', () => {
    // Values inherit the cell's 14px; nothing in the phone block shrinks them.
    expect(phone?.toString()).not.toMatch(/font-size:\s*0\.75rem/);
  });

  it('fades the edge of a table that scrolls, with no script', () => {
    const supports = root.nodes.find(
      (node): node is AtRule => node.type === 'atrule' && node.name === 'supports',
    );
    expect(supports?.params).toContain('animation-timeline');
    const scrollRules = rulesIn(supports!);
    expect(declaration(scrollRules, '.cs-table-scroll', 'animation-timeline')).toBe(
      'scroll(self inline)',
    );
    expect(declaration(scrollRules, '.cs-table-scroll', 'mask-image')).toContain(
      'var(--cs-table-fade-end)',
    );
    // A keyboard user scrolling the table sees all of it, focus ring included.
    expect(declaration(scrollRules, '.cs-table-scroll:focus-visible', 'mask-image')).toBe('none');
  });

  it('keeps real table geometry on paper', () => {
    const print = root.nodes.find(
      (node): node is AtRule => node.type === 'atrule' && node.params === 'print',
    );
    expect(print).toBeDefined();
    expect(declaration(rulesIn(print!), '.cs-table', 'display')).toBe('table');
  });
});
