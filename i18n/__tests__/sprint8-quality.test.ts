import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { howItWorksContentEn, howItWorksContentZh } from '@/content/how-it-works';

interface FlatString {
  path: string;
  value: string;
}

function flattenStrings(value: unknown, prefix = ''): FlatString[] {
  if (typeof value === 'string') return [{ path: prefix, value }];
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => flattenStrings(child, `${prefix}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      flattenStrings(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

function loadCatalogs(locale: 'en' | 'zh'): FlatString[] {
  const directory = join(process.cwd(), 'messages', locale);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .flatMap((file) => {
      const namespace = file.replace(/\.json$/, '');
      const parsed: unknown = JSON.parse(readFileSync(join(directory, file), 'utf8'));
      return flattenStrings(parsed, namespace);
    });
}

function asMap(entries: readonly FlatString[]): Map<string, string> {
  return new Map(entries.map(({ path, value }) => [path, value]));
}

const enCatalog = asMap(loadCatalogs('en'));
const zhCatalog = asMap(loadCatalogs('zh'));
const catalogTooltipPaths = [...enCatalog.keys()].filter(
  (path) => /tooltip/i.test(path) && !/tooltipAria/i.test(path),
);

const enLongFormTooltips = asMap(
  flattenStrings(howItWorksContentEn, 'howItWorks').filter(({ path }) => /tooltip/i.test(path)),
);
const zhLongFormTooltips = asMap(
  flattenStrings(howItWorksContentZh, 'howItWorks').filter(({ path }) => /tooltip/i.test(path)),
);

const immutableAccessibleLabel =
  /^(?:ETH|CST|NFT|RWLK|ERC-20|ERC-721|ETH \+ RWLK|Layer 2|NFT #\{id\}|URL|ID|English|中文|GitHub|Discord|Arbiscan|MetaMask|WalletConnect|Coinbase Wallet|Safe|Uniswap|Axiom Zero|Chaos Zero|X \(Twitter\)|Cosmic Signature(?: NFT)?|Random Walk NFT|Protocol Guild|Arbitrum(?: One)?|Ethereum|[0-9#.:+%/ -]+)$/;

describe('Sprint 8 catalog quality gates', () => {
  it('keeps every tooltip-family key present and translated', () => {
    expect(catalogTooltipPaths.length).toBeGreaterThanOrEqual(130);

    for (const path of catalogTooltipPaths) {
      const en = enCatalog.get(path);
      const zh = zhCatalog.get(path);
      expect(zh).toBeDefined();
      expect(zh).not.toBe('');
      if (zh && immutableAccessibleLabel.test(zh)) {
        expect(zh).toMatch(immutableAccessibleLabel);
      } else {
        expect(zh).not.toBe(en);
        expect(zh).toMatch(/[\u3400-\u9fff，。：；？！、（）《》]/);
      }
    }
  });

  it('keeps structured long-form tooltip fields exhaustive and Chinese', () => {
    expect(zhLongFormTooltips.keys()).toEqual(enLongFormTooltips.keys());
    expect(zhLongFormTooltips.size).toBeGreaterThanOrEqual(10);

    for (const [path, zh] of zhLongFormTooltips) {
      expect(zh).not.toBe('');
      expect(zh).not.toBe(enLongFormTooltips.get(path));
      expect(zh).toMatch(/[\u3400-\u9fff]/);
    }
  });

  it('does not silently leave accessible-name and label keys in English', () => {
    const accessiblePaths = [...enCatalog.keys()].filter((path) =>
      /(?:^|\.)(?:[^.]*aria[^.]*|[^.]*label[^.]*)$/i.test(path),
    );
    expect(accessiblePaths.length).toBeGreaterThanOrEqual(150);

    for (const path of accessiblePaths) {
      const en = enCatalog.get(path) ?? '';
      const zh = zhCatalog.get(path);
      expect(zh).toBeDefined();
      expect(zh).not.toBe('');
      if (zh && immutableAccessibleLabel.test(zh)) {
        expect(zh).toMatch(immutableAccessibleLabel);
      } else {
        expect(zh).not.toBe(en);
        expect(zh).toMatch(/[\u3400-\u9fff，。：；？！、（）《》]/);
      }
    }
  });
});
