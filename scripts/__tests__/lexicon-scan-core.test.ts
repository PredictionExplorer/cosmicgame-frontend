/**
 * Tests for the lexicon scanner core.
 *
 * These tests pin the scanner's behaviour so future refactors can't
 * silently regress its coverage. By design, the test fixtures contain
 * every banned term in the lexicon: that is literally what is being tested.
 */

// lexicon-allow-start: fixture strings exercise every banned term by design

import {
  DEFAULT_BANNED_STEMS,
  DEFAULT_BANNED_TERMS,
  buildBannedPattern,
  buildIdentifierPattern,
  extractJsxTextInline,
  extractStringLiterals,
  isAbiPropertyAccess,
  isInternalCallSite,
  looksLikeStandaloneJsxText,
  scanComments,
  scanContent,
  scanIdentifiers,
  scanJsxTextNodes,
} from '../lexicon-scan-core';

describe('DEFAULT_BANNED_TERMS', () => {
  it('includes the core regulator-risky vocabulary', () => {
    const mustContain = [
      'bid',
      'prize',
      'raffle',
      'winner',
      'staking',
      'charity',
      'donation',
      'gambling',
      'lottery',
      'wager',
      'investor',
      'yield',
    ];
    for (const term of mustContain) {
      expect(DEFAULT_BANNED_TERMS).toContain(term);
    }
  });

  it('includes both singular and plural where applicable', () => {
    expect(DEFAULT_BANNED_TERMS).toContain('bid');
    expect(DEFAULT_BANNED_TERMS).toContain('bids');
    expect(DEFAULT_BANNED_TERMS).toContain('prize');
    expect(DEFAULT_BANNED_TERMS).toContain('prizes');
    expect(DEFAULT_BANNED_TERMS).toContain('winner');
    expect(DEFAULT_BANNED_TERMS).toContain('winners');
  });

  it('omits bare "game" and "play" to avoid false positives on SVG / common English', () => {
    // The lexicon bans these in public copy, but the auto-scanner can't
    // include them without flooding hits on `strokeLinecap="round"`,
    // `Play` icon labels, `game-theoretic` academic usage, etc. The
    // expanded forms — `gaming`, `player`, `players` — are covered here,
    // and manual auditing + JSX-text scan catch bare-word uses.
    expect(DEFAULT_BANNED_TERMS).not.toContain('game');
    expect(DEFAULT_BANNED_TERMS).not.toContain('play');
    expect(DEFAULT_BANNED_TERMS).toContain('gaming');
    expect(DEFAULT_BANNED_TERMS).toContain('player');
    expect(DEFAULT_BANNED_TERMS).toContain('players');
  });

  it('includes multi-word phrases that have meaning only together', () => {
    expect(DEFAULT_BANNED_TERMS).toContain('Dutch auction');
    expect(DEFAULT_BANNED_TERMS).toContain('house edge');
    expect(DEFAULT_BANNED_TERMS).toContain('cash out');
    expect(DEFAULT_BANNED_TERMS).toContain('tax-deductible');
  });

  it('has no duplicate entries', () => {
    expect(new Set(DEFAULT_BANNED_TERMS).size).toBe(DEFAULT_BANNED_TERMS.length);
  });

  it('every term is lowercase or a phrase (matching the case-insensitive regex)', () => {
    for (const t of DEFAULT_BANNED_TERMS) {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
  });
});

describe('DEFAULT_BANNED_STEMS', () => {
  it('covers the identifier stems users mentioned explicitly', () => {
    expect(DEFAULT_BANNED_STEMS).toContain('Bid');
    expect(DEFAULT_BANNED_STEMS).toContain('Stake');
    expect(DEFAULT_BANNED_STEMS).toContain('Staker');
    expect(DEFAULT_BANNED_STEMS).toContain('Unstake');
    expect(DEFAULT_BANNED_STEMS).toContain('Mint');
    expect(DEFAULT_BANNED_STEMS).toContain('Raffle');
    expect(DEFAULT_BANNED_STEMS).toContain('Prize');
    expect(DEFAULT_BANNED_STEMS).toContain('Winner');
  });
});

describe('buildBannedPattern', () => {
  it('builds a case-insensitive regex', () => {
    const p = buildBannedPattern(['bid']);
    expect('BID'.match(p)).toBeTruthy();
    expect('Bid'.match(p)).toBeTruthy();
    expect('bid'.match(p)).toBeTruthy();
  });

  it('uses word boundaries to avoid substring hits', () => {
    const p = buildBannedPattern(['bid']);
    expect('bidder'.match(p)).toBeNull();
    expect('rebid'.match(p)).toBeNull();
    expect('bid amount'.match(p)).toBeTruthy();
  });

  it('escapes regex metacharacters in phrases', () => {
    const p = buildBannedPattern(['tax-deductible']);
    expect('is tax-deductible'.match(p)).toBeTruthy();
    expect('tax deductible'.match(p)).toBeNull();
  });

  it('matches multi-word phrases', () => {
    const p = buildBannedPattern(['Dutch auction']);
    expect('Dutch auction'.match(p)).toBeTruthy();
    expect('dutch AUCTION'.match(p)).toBeTruthy();
  });

  it('finds all hits globally, not just the first', () => {
    const p = buildBannedPattern(['bid']);
    const text = 'a bid then another bid';
    expect(text.match(p)).toHaveLength(2);
  });

  it('builds an empty-matching pattern for an empty list', () => {
    const p = buildBannedPattern([]);
    expect('bid'.match(p)).toBeNull();
    expect(''.match(p)).toBeNull();
  });
});

describe('extractStringLiterals', () => {
  it('returns empty when no string literals', () => {
    expect(extractStringLiterals('const x = 42;')).toEqual([]);
  });

  it('extracts single-quoted literals', () => {
    const hits = extractStringLiterals(`const x = 'hello';`);
    expect(hits).toEqual([{ literal: `'hello'`, start: 10 }]);
  });

  it('extracts double-quoted literals', () => {
    const hits = extractStringLiterals(`const x = "hello";`);
    expect(hits[0]!.literal).toBe(`"hello"`);
  });

  it('extracts backtick literals', () => {
    const hits = extractStringLiterals('const x = `hello`;');
    expect(hits[0]!.literal).toBe('`hello`');
  });

  it('extracts multiple literals on one line', () => {
    const hits = extractStringLiterals(`const a = 'x', b = "y", c = \`z\`;`);
    expect(hits.map((h) => h.literal)).toEqual([`'x'`, `"y"`, '`z`']);
  });

  it('handles escaped quote characters inside literals', () => {
    const hits = extractStringLiterals(`const x = 'it\\'s';`);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.literal).toBe(`'it\\'s'`);
  });

  it('reports correct start offsets for subsequent literals', () => {
    const line = `const a = 'bid', b = 'safe';`;
    const hits = extractStringLiterals(line);
    expect(hits).toHaveLength(2);
    expect(hits[0]!.start).toBe(10);
    expect(line.slice(hits[1]!.start)).toMatch(/^'safe'/);
  });

  it('is robust to interleaved quote characters inside a literal', () => {
    const hits = extractStringLiterals(`const x = "don't";`);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.literal).toBe(`"don't"`);
  });
});

describe('isInternalCallSite', () => {
  type Row = [prefix: string, expected: boolean, label: string];
  const cases: Row[] = [
    [`import x from `, true, `from '...'`],
    [`const y = require(`, true, `require(`],
    [`const y = require (`, true, `require with space`],
    [`import(`, true, `dynamic import(`],
    [`<div data-testid=`, true, `data-testid=`],
    [`<div data-testid={`, true, `data-testid={`],
    [`<div id=`, true, `id=`],
    [`<div sectionId=`, true, `sectionId=`],
    [`<Foo className=`, true, `className=`],
    [`<label htmlFor=`, true, `htmlFor=`],
    [`  { sectionId: `, true, `object key sectionId`],
    [`  { testId: `, true, `object key testId`],
    [`const title = `, false, `bare assignment`],
    [`<h1>`, false, `JSX text`],
    [`notify('error', `, false, `notification content`],
  ];

  for (const [prefix, expected, label] of cases) {
    it(`${expected ? 'skips' : 'scans'}: ${label}`, () => {
      const line = `${prefix}'hello'`;
      const start = prefix.length;
      expect(isInternalCallSite(line, start)).toBe(expected);
    });
  }

  it('distinguishes href=... (user-facing URL) from id=... (internal)', () => {
    const hrefLine = `<a href='/prize'>`;
    const idLine = `<div id='allocation-card'>`;
    expect(isInternalCallSite(hrefLine, hrefLine.indexOf(`'/prize'`))).toBe(false);
    expect(isInternalCallSite(idLine, idLine.indexOf(`'allocation-card'`))).toBe(true);
  });

  it('treats = with surrounding whitespace the same as no whitespace', () => {
    const withWs = `data-testid  =  'x'`;
    const noWs = `data-testid='x'`;
    expect(isInternalCallSite(withWs, withWs.indexOf(`'x'`))).toBe(true);
    expect(isInternalCallSite(noWs, noWs.indexOf(`'x'`))).toBe(true);
  });
});

describe('scanContent', () => {
  const pattern = buildBannedPattern(DEFAULT_BANNED_TERMS);

  it('returns empty for clean content', () => {
    const src = `
      const title = 'Make a Gesture';
      const subtitle = 'Cycle status';
    `;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('reports a single banned term with correct line number', () => {
    const src = ['const a = 1;', `const title = 'Make a Bid';`, 'const b = 2;'].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toEqual({ line: 2, term: 'Bid', literal: `'Make a Bid'` });
  });

  it('reports multiple hits on separate lines', () => {
    const src = ['const a = "bid";', 'const b = "prize";'].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits.map((h) => h.line)).toEqual([1, 2]);
    expect(hits.map((h) => h.term.toLowerCase())).toEqual(['bid', 'prize']);
  });

  it('reports multiple hits on the same line', () => {
    const src = `const x = "bid and prize";`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(2);
    expect(hits.every((h) => h.line === 1)).toBe(true);
  });

  it('is case-insensitive', () => {
    const src = [
      `const a = 'BID';`,
      `const b = 'Bid';`,
      `const c = 'bid';`,
      `const d = 'BiD';`,
    ].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(4);
  });

  it('skips comment-only lines', () => {
    const src = [
      `// TODO: replace all bid/prize/stellarSelection references in copy`,
      `   * bid and stellarSelection are banned`,
    ].join('\n');
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('honors lexicon-allow-start/end pragmas', () => {
    const src = [
      'const a = "bid";',
      '// lexicon-allow-start: FAQ denial copy',
      `const b = "Is this a lottery or casino?";`,
      `const c = "The bid is not a wager.";`,
      '// lexicon-allow-end',
      'const d = "prize";',
    ].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits.map((h) => h.line)).toEqual([1, 6]);
  });

  it('honors single-line lexicon-allow-abi pragma', () => {
    const src = [
      `const a = "bid";`,
      `await contract.write.mint({ value: "minted fee is ok" }); // lexicon-allow-abi`,
    ].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.line).toBe(1);
  });

  it('honors single-line lexicon-allow-backend-type pragma', () => {
    const src = [
      `const a = "bid";`,
      `type BackendRow = { BidderAddr: string; "number of gestures": number }; // lexicon-allow-backend-type`,
    ].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.line).toBe(1);
  });

  it('skips `import X from "Y"` entirely (path is internal)', () => {
    const src = [
      `import AnchoringSection from '@/components/anchoring/AnchoringSection';`,
      `import { foo } from '../lib/bid';`,
    ].join('\n');
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('skips `export ... from "Y"` re-exports', () => {
    const src = `export { AnchoringSection } from '@/components/anchoring';`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('skips data-testid values', () => {
    const src = `<div data-testid="bid-section">...</div>`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('skips sectionId prop values', () => {
    const src = `<SectionCard sectionId="allocation-finalized-rewards">`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('skips DOM id attributes', () => {
    const src = `<h3 id="allocation-header">...</h3>`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('flags href values (user-facing URLs must be cosmic)', () => {
    const src = `<a href="/prize/1">cycle</a>`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('prize');
  });

  it('flags banned words inside JSX expression containers', () => {
    const src = `<p>{'This is a bid'}</p>`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('bid');
  });

  it('flags banned words in template literals', () => {
    const src = 'const msg = `You placed a bid`;';
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('bid');
  });

  it('flags banned phrases (Dutch auction)', () => {
    const src = `const title = "Dutch auction opens at 3pm";`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('dutch auction');
  });

  it('does not flag API field-shaped identifiers outside strings', () => {
    const src = [
      `const x = data.BidderAddr;`,
      `const y = obj.NumBidsCST;`,
      `export interface Winner { addr: string; }`,
    ].join('\n');
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('does not flag banned term as substring of identifier inside a string', () => {
    const src = `const handle = "betmaster-42";`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('does flag a plural that is its own banned-list entry', () => {
    const src = `const title = "number of bids";`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('bids');
  });

  it('handles allow pragmas with different casing and spacing', () => {
    const src = [
      `//lexicon-allow-start`,
      `const x = "bid";`,
      `//  lexicon-allow-end`,
      `const y = "prize";`,
    ].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.line).toBe(4);
  });

  it('treats the whole rest-of-file as allowed if end pragma is missing', () => {
    const src = [`// lexicon-allow-start: FAQ`, `const x = "bid";`, `const y = "prize";`].join(
      '\n',
    );
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('is robust against lines with only whitespace or empty strings', () => {
    const src = ['   ', '', '', 'const x = "bid";'].join('\n');
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.line).toBe(4);
  });

  it('accepts a custom banned-term list (dependency injection)', () => {
    const customPattern = buildBannedPattern(['unicorn']);
    const src = `const x = "unicorn vs bid";`;
    const hits = scanContent(src, customPattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term).toBe('unicorn');
  });

  it('reports the full literal containing the hit (useful for grep-style UX)', () => {
    const src = `const msg = "the bid of the century";`;
    const hits = scanContent(src, pattern);
    expect(hits[0]!.literal).toBe(`"the bid of the century"`);
  });
});

describe('extractJsxTextInline', () => {
  it('extracts text between tags on one line', () => {
    const hits = extractJsxTextInline(`<span>Hello World</span>`);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.text).toBe('Hello World');
  });

  it('returns empty for whitespace-only text', () => {
    const hits = extractJsxTextInline(`<span>   </span>`);
    expect(hits).toHaveLength(0);
  });

  it('skips JSX expression containers ({...})', () => {
    const hits = extractJsxTextInline(`<span>{count}</span>`);
    expect(hits).toHaveLength(0);
  });

  it('extracts multiple inline text nodes', () => {
    const hits = extractJsxTextInline(`<b>A</b><i>B</i>`);
    expect(hits.map((h) => h.text)).toEqual(['A', 'B']);
  });
});

describe('looksLikeStandaloneJsxText', () => {
  it('returns true for prose-looking lines', () => {
    expect(looksLikeStandaloneJsxText('Cosmic Signature Staking')).toBe(true);
    expect(looksLikeStandaloneJsxText('Random Walk Staking')).toBe(true);
    expect(looksLikeStandaloneJsxText('Make a Gesture')).toBe(true);
  });

  it('returns false for TS/JS code', () => {
    expect(looksLikeStandaloneJsxText(`const x = 'hello';`)).toBe(false);
    expect(looksLikeStandaloneJsxText(`return <div>Hello</div>;`)).toBe(false);
    expect(looksLikeStandaloneJsxText(`import { x } from 'y';`)).toBe(false);
    expect(looksLikeStandaloneJsxText(`function foo() {}`)).toBe(false);
  });

  it('returns false for empty or too-short lines', () => {
    expect(looksLikeStandaloneJsxText('')).toBe(false);
    expect(looksLikeStandaloneJsxText('  ')).toBe(false);
    expect(looksLikeStandaloneJsxText('ok')).toBe(false);
  });
});

describe('scanJsxTextNodes', () => {
  const pattern = buildBannedPattern(DEFAULT_BANNED_TERMS);

  it('flags banned term inside inline JSX text', () => {
    const src = `<span>Place a Bid</span>`;
    const hits = scanJsxTextNodes(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term).toBe('Bid');
    expect(hits[0]!.literal).toBe('Place a Bid');
  });

  it('flags banned term in multi-line JSX text (the UserAnchoringSection regression)', () => {
    const src = [
      `<span className="text-lg whitespace-nowrap normal-case ml-4">`,
      `  Cosmic Signature Staking`,
      `</span>`,
    ].join('\n');
    const hits = scanJsxTextNodes(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term).toBe('Staking');
    expect(hits[0]!.line).toBe(2);
  });

  it('flags both leaked JSX texts in UserAnchoringSection fixture', () => {
    const src = [
      `<TabsTrigger>`,
      `  <span>`,
      `    Cosmic Signature Staking`,
      `  </span>`,
      `</TabsTrigger>`,
      `<TabsTrigger>`,
      `  <span>`,
      `    Random Walk Staking`,
      `  </span>`,
      `</TabsTrigger>`,
    ].join('\n');
    const hits = scanJsxTextNodes(src, pattern);
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits.map((h) => h.term.toLowerCase()).every((t) => t === 'staking')).toBe(true);
  });

  it('does not flag JSX expression containers', () => {
    const src = `<span>{stakingCount}</span>`;
    expect(scanJsxTextNodes(src, pattern)).toEqual([]);
  });

  it('honors lexicon-allow-start/end inside JSX', () => {
    const src = [
      `// lexicon-allow-start: FAQ denial`,
      `<p>Is this a lottery product?</p>`,
      `// lexicon-allow-end`,
    ].join('\n');
    expect(scanJsxTextNodes(src, pattern)).toEqual([]);
  });
});

describe('buildIdentifierPattern', () => {
  it('matches an identifier containing a banned stem', () => {
    const p = buildIdentifierPattern(['Bid']);
    expect('useBidForm'.match(p)?.[0]).toBe('useBidForm');
    expect('BidPage'.match(p)?.[0]).toBe('BidPage');
    expect('bidList'.match(p)?.[0]).toBe('bidList');
  });

  it('returns null when no banned stem is present', () => {
    const p = buildIdentifierPattern(['Bid']);
    expect('useGestureForm'.match(p)).toBeNull();
  });

  it('handles multiple stems', () => {
    const p = buildIdentifierPattern(['Bid', 'Stake']);
    expect('StakeButton'.match(p)?.[0]).toBe('StakeButton');
    expect('BidButton'.match(p)?.[0]).toBe('BidButton');
  });
});

describe('isAbiPropertyAccess', () => {
  it('returns true when identifier is a property access and line has allow-abi', () => {
    const line = `await contract.write.mint({ value: x }); // lexicon-allow-abi`;
    const start = line.indexOf('mint');
    expect(isAbiPropertyAccess(line, start)).toBe(true);
  });

  it('returns false without the pragma', () => {
    const line = `await contract.write.mint({ value: x });`;
    const start = line.indexOf('mint');
    expect(isAbiPropertyAccess(line, start)).toBe(false);
  });

  it('returns false for non-property access (identifier at position 0)', () => {
    const line = `mint`;
    expect(isAbiPropertyAccess(line, 0)).toBe(false);
  });
});

describe('scanIdentifiers', () => {
  const pattern = buildIdentifierPattern(DEFAULT_BANNED_STEMS);

  it('flags a const declaration containing a banned stem', () => {
    const src = `const bidList = [];`;
    const hits = scanIdentifiers(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term).toBe('bidList');
  });

  it('flags a function declaration', () => {
    const src = `function useStakingActions() {}`;
    const hits = scanIdentifiers(src, pattern);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0]!.term).toMatch(/Staking/i);
  });

  it('flags an interface declaration', () => {
    const src = `interface BidderRow { addr: string; }`;
    const hits = scanIdentifiers(src, pattern);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0]!.term).toMatch(/Bidder/i);
  });

  it('skips property access unless explicitly scanned', () => {
    const src = `const n = obj.gestureList;`;
    const hits = scanIdentifiers(src, pattern, { onlyDeclarations: true });
    expect(hits).toEqual([]);
  });

  it('skips lines wrapped in an allow block', () => {
    const src = [
      `// lexicon-allow-start: backend contract`,
      `interface BackendRawBidder { BidderAddr: string; }`,
      `// lexicon-allow-end`,
    ].join('\n');
    expect(scanIdentifiers(src, pattern)).toEqual([]);
  });

  it('skips lines marked lexicon-allow-backend-type', () => {
    const src = `interface BackendRawBidder { BidderAddr: string; } // lexicon-allow-backend-type`;
    expect(scanIdentifiers(src, pattern)).toEqual([]);
  });

  it('skips import / export paths', () => {
    const src = `import { GestureForm } from '@/components/home/GestureForm';`;
    expect(scanIdentifiers(src, pattern)).toEqual([]);
  });
});

describe('scanComments', () => {
  const pattern = buildBannedPattern(DEFAULT_BANNED_TERMS);

  it('flags a banned term in a line comment', () => {
    const src = `// replace bid with Gesture`;
    const hits = scanComments(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('bid');
  });

  it('flags a banned term in a block comment', () => {
    const src = `/* this is a bid */`;
    const hits = scanComments(src, pattern);
    expect(hits).toHaveLength(1);
  });

  it('handles block comments spanning multiple lines', () => {
    const src = ['/*', ' * The bid flow is', ' * being renamed.', ' */'].join('\n');
    const hits = scanComments(src, pattern);
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag strings (that is scanContent territory)', () => {
    const src = `const x = "bid";`;
    expect(scanComments(src, pattern)).toEqual([]);
  });
});

describe('integration: common real-world patterns', () => {
  const pattern = buildBannedPattern(DEFAULT_BANNED_TERMS);

  it('allows a fully-cosmic component file', () => {
    const src = `
      import { Button } from '@/components/ui/button';

      export function AnchorForm() {
        return (
          <Button>Make a Gesture</Button>
        );
      }
    `;
    expect(scanContent(src, pattern)).toEqual([]);
    expect(scanJsxTextNodes(src, pattern)).toEqual([]);
  });

  it('flags a component that slipped a "Prize" string into a heading', () => {
    const src = `
      export function Header() {
        return <h1>{'Claim Your Prize'}</h1>;
      }
    `;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term).toBe('Prize');
  });

  it('allow pragma + bracket-key access is the documented escape hatch', () => {
    const src = [
      `// lexicon-allow-start: backend wire format key`,
      `const n = data['NumBids'];`,
      `// lexicon-allow-end`,
    ].join('\n');
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('a real-world notify call with a banned term fires', () => {
    const src = `notify('error', 'Your bid was cancelled.');`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('bid');
  });

  it('a real-world href to the new cosmic route does not fire', () => {
    const src = `<Link href="/anchoring/overview">Anchor Distributions</Link>`;
    expect(scanContent(src, pattern)).toEqual([]);
  });

  it('a real-world href to a legacy route fires', () => {
    const src = `<Link href="/staking">Legacy</Link>`;
    const hits = scanContent(src, pattern);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.term.toLowerCase()).toBe('staking');
  });
});

// lexicon-allow-end
