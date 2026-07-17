import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { extname, join, relative } from 'path';

const SCANNED_ROOTS = ['app', 'components', 'content', 'public'] as const;
const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.tsx', '.txt']);

const DISALLOWED_TERMS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\bCST NFTs?\b/i,
    reason: 'CST is the ERC-20 token; anchorable ERC-721 assets are Cosmic Signature NFTs.',
  },
  {
    pattern: /\bAnchored CST\b/i,
    reason: 'CST cannot be anchored; Cosmic Signature NFTs and RandomWalk NFTs can be anchored.',
  },
  {
    pattern: /\banchored CST (?:tokens?|NFTs?)\b/i,
    reason: 'Anchoring copy should name Cosmic Signature NFTs, not CST.',
  },
  {
    pattern: /\bDistribution per CST\b/i,
    reason: 'Anchor Distribution rates are per anchored Cosmic Signature NFT.',
  },
  {
    pattern: /\bCosmic Signature Tokens?\b/i,
    reason:
      'Bare Cosmic Signature Token(s) is ambiguous; use CST tokens or Cosmic Signature CST Token(s).',
  },
  {
    pattern: /\bCosmic Signature Token \(ERC-721\)\b/i,
    reason: 'Cosmic Signature Token is CST (ERC-20); ERC-721 assets are Cosmic Signature NFTs.',
  },
  {
    pattern: /\bCosmic Signature Token #\d*\b/i,
    reason: 'NFT detail copy should say Cosmic Signature NFT.',
  },
  {
    pattern: /\bCosmic Signature Token number\b/i,
    reason: 'NFT identifiers should be labeled as Cosmic Signature NFT IDs.',
  },
  {
    pattern: /\bCosmic Token\b/i,
    reason: 'Use CST tokens or Cosmic Signature CST Token(s) for the fungible token.',
  },
  {
    pattern: /\bAnchor Allocation Tokens\b/i,
    reason: 'RandomWalk anchoring rewards should be labeled Anchored-NFT Stellar Selection.',
  },
  {
    pattern: /\banchored to gestures\b/i,
    reason: 'RandomWalk NFTs are attached to ETH gestures; anchoring is a separate action.',
  },
  {
    pattern: /\bGesture with RandomWalk\b/i,
    reason: 'RandomWalk modifies an ETH gesture; label this flow ETH + RandomWalk.',
  },
  {
    pattern: /\ba RandomWalk gesture\b/i,
    reason: 'RandomWalk modifies an ETH gesture; label this flow ETH + RandomWalk.',
  },
  {
    pattern: /\bStellar Selection NFT Token\b/i,
    reason: 'Stellar Selection ERC-721 rewards should be called Cosmic Signature NFTs.',
  },
  {
    pattern: /\bAnchor RandomWalk NFT\b/i,
    reason: 'Use Anchored-NFT Stellar Selection for RandomWalk anchoring rewards.',
  },
  {
    pattern: /\bMy Cosmic Signature Tokens\b/,
    reason: 'The my-tokens page displays Cosmic Signature NFTs, not CST.',
  },
  {
    pattern: /\bNamed Cosmic Signature Tokens\b/,
    reason: 'Named ERC-721 assets should be called Cosmic Signature NFTs.',
  },
];

function productionTextFiles(): string[] {
  const files: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const relPath = relative(process.cwd(), fullPath);

      if (relPath.includes('__tests__') || relPath.includes('__mocks__')) {
        continue;
      }

      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (TEXT_EXTENSIONS.has(extname(fullPath))) {
        files.push(fullPath);
      }
    }
  };

  for (const root of SCANNED_ROOTS) {
    const fullRoot = join(process.cwd(), root);
    if (existsSync(fullRoot)) visit(fullRoot);
  }

  return files;
}

describe('asset terminology', () => {
  it('keeps CST, Cosmic Signature NFTs, and RandomWalk roles distinct in production copy', () => {
    const violations = productionTextFiles().flatMap((file) => {
      const content = readFileSync(file, 'utf8');
      const relPath = relative(process.cwd(), file);

      return DISALLOWED_TERMS.flatMap(({ pattern, reason }) => {
        const match = content.match(pattern);
        return match ? [`${relPath}: "${match[0]}" - ${reason}`] : [];
      });
    });

    expect(violations).toEqual([]);
  });
});
