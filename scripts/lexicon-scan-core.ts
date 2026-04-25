/**
 * Core scanner logic for the Cosmic Signature lexicon.
 *
 * Separate from the CLI entry point so unit tests can import these primitives
 * without triggering a filesystem walk or `process.exit`. The CLI
 * (scripts/lexicon-scan.ts) re-imports these and adds the walk and exit.
 *
 * Three independent matchers, each returning ScannerHit[]:
 *   - scanContent: string literals (original behavior).
 *   - scanJsxTextNodes: text rendered between JSX tags — catches user-visible
 *     text that string-literal scanning misses (e.g. `<span>Cosmic Staking</span>`).
 *   - scanIdentifiers: declared names containing a banned stem — guards against
 *     `useGestureForm`, `MyAnchors`, `mintPrice`, etc. leaking back into new code.
 *
 * Allow pragmas:
 *   // lexicon-allow-start: <reason>   — opens a block; all matchers skip until…
 *   // lexicon-allow-end                — …this line.
 *   // lexicon-allow-abi                — single-line allow for ABI calls
 *                                         (e.g. `contract.write.mint(...)`).
 *   // lexicon-allow-backend-type       — single-line allow for sealed backend
 *                                         wire-shape field names.
 *
 * Legitimate uses: FAQ denial copy that must literally say "Is this a lottery?",
 * internal developer-facing docs explaining what terms are banned and why,
 * and ABI / backend-shape names that cannot change without breaking external
 * contracts.
 */

/** A single banned-term hit inside a scanned file. */
export interface ScannerHit {
  /** 1-based line number of the hit. */
  line: number;
  /** The exact substring that matched (original case preserved). */
  term: string;
  /** The full string literal, JSX text segment, or identifier containing the hit. */
  literal: string;
}

/**
 * The default banned-term list for Cosmic Signature, derived from
 * marketing/cosmic-lexicon.md (including the 2026-04-23 revision that
 * expanded the ban list to cover UK / EU / Australian gambling statutes).
 */
// lexicon-allow-start: banned-term list for the scanner itself
export const DEFAULT_BANNED_TERMS: readonly string[] = [
  // Auction / bidding
  'bid',
  'bids',
  'bidding',
  'bidder',
  'bidders',
  'auction',
  'auctions',
  'Dutch auction',
  // Allocations / winners
  'prize',
  'prizes',
  'winner',
  'winners',
  'jackpot',
  'pot',
  // Stellar Selection / lottery triggers
  'raffle',
  'raffles',
  'lottery',
  'lotteries',
  'sweepstakes',
  'giveaway',
  'giveaways',
  'casino',
  // Gambling language
  'gambling',
  'gamble',
  'bet',
  'bets',
  'wager',
  'wagers',
  'odds',
  'luck',
  'lucky',
  'house edge',
  'ticket',
  'tickets',
  // Game framing (UK/Canada/EU gambling acts use "game" and "play" as root terms)
  'gaming',
  'player',
  'players',
  'compete',
  'competing',
  'competition',
  'contest',
  'tournament',
  // Securities / Howey
  'investor',
  'investors',
  'investment',
  'investments',
  'profit',
  'profits',
  'ROI',
  'dividend',
  'dividends',
  'yield',
  'earn',
  'earns',
  'earning',
  'earnings',
  'income',
  'tax-deductible',
  // Crypto-slang landmines
  'degen',
  'moon',
  'lambo',
  'ape',
  'apes',
  // Staking / yield
  'staker',
  'stakers',
  'staking',
  // Charity language
  'charity',
  'charities',
  'charitable',
  'donate',
  'donated',
  'donating',
  'donation',
  'donations',
  'donor',
  'donors',
  // Withdraw slang
  'cash out',
  // Imprint (minted → imprinted)
  'minted',
];
// lexicon-allow-end

/**
 * Stems matched inside identifier names by `scanIdentifiers`. These are
 * PascalCase canonical forms; matching is case-insensitive and respects
 * camelCase / snake_case boundaries inside the identifier.
 */
// lexicon-allow-start: banned-stem list for the scanner itself
export const DEFAULT_BANNED_STEMS: readonly string[] = [
  'Bid',
  'Bidder',
  'Bidders',
  'Bidding',
  'Stake',
  'Staked',
  'Staker',
  'Stakers',
  'Staking',
  'Unstake',
  'Unstaked',
  'Unstaking',
  'Mint',
  'Minted',
  'Minting',
  'Raffle',
  'Prize',
  'Prizes',
  'Winner',
  'Winners',
];
// lexicon-allow-end

/**
 * Builds a case-insensitive, word-boundary-aware regex from a list of
 * banned terms. Escapes regex metacharacters so "Dutch auction" matches
 * the literal phrase and "tax-deductible" matches the literal hyphen.
 */
export function buildBannedPattern(banned: readonly string[]): RegExp {
  if (banned.length === 0) {
    // An empty alternation `\b(|)\b` would match zero-width positions at
    // every word boundary, producing a flood of empty matches. Return a
    // pattern that matches nothing instead, so callers can safely chain.
    return /(?!)/g;
  }
  const escaped = banned.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

/**
 * Extracts string literals (single-quoted, double-quoted, and
 * backtick-quoted) from a single line of source code. Returns each literal
 * along with the zero-based column offset in the line so callers can
 * inspect what precedes the literal.
 */
export function extractStringLiterals(line: string): Array<{ literal: string; start: number }> {
  const result: Array<{ literal: string; start: number }> = [];
  const regex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    result.push({ literal: match[0]!, start: match.index });
  }
  return result;
}

/**
 * Decides whether a given string literal, at column `start` of `line`,
 * should be skipped because it represents an internal-only string (import
 * path, DOM element ID, test selector, etc.). Returns true to skip.
 *
 * The "prefix" is the text in the line immediately before the literal.
 * We match on the trimmed trailing tokens to identify the surrounding
 * call site.
 */
export function isInternalCallSite(line: string, start: number): boolean {
  const prefix = line.slice(0, start);
  const trimmedPrefix = prefix.trimEnd();

  // Imports and bare require(): `import X from 'y'`, `require('y')`.
  if (/\b(?:from|require\s*\()\s*$/.test(trimmedPrefix)) return true;
  if (/\bimport\s*\(\s*$/.test(trimmedPrefix)) return true;

  // JSX / prop internal attributes: id, data-testid, className, sectionId,
  // data-*, key, htmlFor. These are internal DOM concerns.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*[:=]\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }
  // JSX attribute form: `data-testid={"..."}` or `id={"..."}`.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*=\s*\{\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }

  // Object literal shorthand for the above keys: `{ id: '...' }`,
  // `{ sectionId: '...' }`, `{ testId: '...' }`. We limit to cases where
  // the key is unambiguously an internal-identifier key.
  if (/\b(sectionId|testId|slotId|elementId|anchorId|hashAnchor)\s*:\s*$/.test(trimmedPrefix))
    return true;

  return false;
}

/** Tracks allow-block state across lines without leaking into callers. */
interface AllowState {
  inBlock: boolean;
}

/** Internal: is this line a pragma that opens/closes/singles an allow? */
interface LinePragma {
  opensBlock: boolean;
  closesBlock: boolean;
  allowsLine: boolean;
}

/**
 * Recognise a lexicon pragma in any common comment form:
 *   // lexicon-allow-*          (line comment)
 *   /&#42; lexicon-allow-* &#42;/     (block comment)
 *   {/&#42; lexicon-allow-* &#42;/}    (JSX comment)
 *   <!-- lexicon-allow-* -->    (HTML / markdown comment)
 *
 * The regex is case-insensitive and accepts leading whitespace and optional
 * `{` so callers can drop a pragma at the start of a comment in any file type.
 */
const PRAGMA_PREFIX = String.raw`(?:\/\/|\/\*|\{\/\*|<!--)\s*`;

/**
 * Strips string literals from a line before pragma detection so a literal
 * containing "// lexicon-allow-end" (as a test fixture, say) does not
 * inadvertently close an enclosing allow block.
 */
function stripStringLiterals(line: string): string {
  return line.replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, '""');
}

function readPragma(line: string): LinePragma {
  const cleaned = stripStringLiterals(line);
  const allowsLine = new RegExp(
    `${PRAGMA_PREFIX}lexicon-allow-(?:abi|backend-type|line)\\b`,
    'i',
  ).test(cleaned);
  return {
    opensBlock: new RegExp(`${PRAGMA_PREFIX}lexicon-allow-start`, 'i').test(cleaned),
    closesBlock: new RegExp(`${PRAGMA_PREFIX}lexicon-allow-end`, 'i').test(cleaned),
    allowsLine,
  };
}

/**
 * Scans the content of a single file for banned terms in user-visible
 * string literals. Returns an array of hits with line number, matched
 * term, and the literal containing it.
 *
 * Lines wrapped in `// lexicon-allow-start` / `// lexicon-allow-end`
 * pragmas are excluded, as are lines tagged with `// lexicon-allow-abi`
 * or `// lexicon-allow-backend-type`. Pure-comment lines (starting with
 * `//` or `*`) are also excluded so JSDoc mentioning a banned term is fine.
 */
export function scanContent(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Fast-path: skip whole `import` / `export from` lines. The literal-by-
    // literal isInternalCallSite guard also catches these, but the shortcut
    // avoids scanning long module-re-export blocks.
    if (/^\s*(?:import|export)\s/.test(line) && /\bfrom\s+['"`]/.test(line)) return;

    const literals = extractStringLiterals(line);
    for (const { literal, start } of literals) {
      if (isInternalCallSite(line, start)) continue;
      const matches = literal.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal });
        }
      }
    }
  });

  return hits;
}

/**
 * Extracts JSX text segments from a single line. A JSX text segment is the
 * text rendered between two adjacent JSX tags on the same line, e.g.
 * `<span>Hello World</span>` yields `Hello World`. JSX expression containers
 * (`{...}`) are excluded — they are regular TS/JS and covered by other
 * matchers. Empty and whitespace-only segments are filtered out.
 */
export function extractJsxTextInline(line: string): Array<{ text: string; start: number }> {
  const result: Array<{ text: string; start: number }> = [];
  const regex = />([^<>{}]+)</g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    const text = match[1]!;
    if (text.trim() === '') continue;
    result.push({ text, start: match.index + 1 });
  }
  return result;
}

/**
 * Heuristic check: does this trimmed line look like a standalone JSX text
 * node (i.e. a line between an opening and closing tag on adjacent lines)?
 *
 * Example that returns true:
 *   `  Cosmic Signature Staking`
 *
 * The line must:
 *   - contain an alphabetic run of 3+ characters,
 *   - contain at least one whitespace character (real JSX text is a phrase),
 *   - not contain tag/expression syntax,
 *   - not look like a TS object property row (`key: value,`),
 *   - not look like a property-access chain (`obj.prop`),
 *   - not end in a trailing comma (array/object literal row), and
 *   - not start with a reserved word.
 *
 * False positives here are still possible but the banned-term regex must
 * also match before a hit is reported, which filters most of the remainder.
 */
export function looksLikeStandaloneJsxText(trimmed: string): boolean {
  if (trimmed.length === 0) return false;
  if (!/[A-Za-z]{3,}/.test(trimmed)) return false;
  if (/[<>{}()=;'"`/]/.test(trimmed)) return false;
  if (trimmed.startsWith('*')) return false;
  // Real JSX text is a phrase with whitespace, not a single DOM attribute
  // identifier like `data-special-allocation-leaders-print`.
  if (!/\s/.test(trimmed)) return false;
  // Object/property syntax: `key: value`, `key: value,`, object rows.
  if (/^[A-Za-z_$][A-Za-z0-9_$]*\s*:\s*[A-Za-z_$[{]/.test(trimmed)) return false;
  // Property-access chains: `obj.prop`, `obj.prop.more`.
  if (/[A-Za-z_$][A-Za-z0-9_$]*\.[A-Za-z_$]/.test(trimmed)) return false;
  // Trailing comma → clearly an array / object literal row.
  if (/,\s*$/.test(trimmed)) return false;
  // Reserved keywords that may start prose-like lines but are actually code.
  if (
    /^(import|export|const|let|var|function|class|interface|type|enum|if|else|return|for|while|switch|case|default|break|continue|try|catch|finally|throw|new|async|await|yield|do)\b/.test(
      trimmed,
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Scans JSX text (inline and standalone) for banned terms. Operates
 * line-by-line without a full AST — good enough to catch obvious leaks
 * like `<span>Cosmic Signature Staking</span>` that string-literal
 * scanning misses.
 *
 * Allow pragmas are honored identically to `scanContent`.
 */
export function scanJsxTextNodes(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Inline JSX text: `<span>Hello</span>`.
    const inline = extractJsxTextInline(line);
    for (const { text } of inline) {
      const matches = text.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: text });
        }
      }
    }

    // Standalone JSX text: a line between `<span>` and `</span>` on its own.
    if (looksLikeStandaloneJsxText(trimmed)) {
      const matches = trimmed.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: trimmed });
        }
      }
    }
  });

  return hits;
}

/**
 * Builds a case-insensitive regex that matches an identifier-like token
 * (camelCase, PascalCase, or snake_case) containing any of the given stems.
 *
 * The match includes the full identifier so reports show `useGestureForm`, not
 * just `Bid`. Word-boundary anchors keep ordinary English in comments from
 * firing — but comments are excluded by `scanIdentifiers` separately.
 */
export function buildIdentifierPattern(stems: readonly string[]): RegExp {
  if (stems.length === 0) return /(?!)/g;
  const escaped = stems.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // A "banned identifier" is a run of identifier chars that contains one of
  // the stems. We match the whole identifier so the reporter can cite it.
  return new RegExp(`\\b[A-Za-z0-9_]*(?:${escaped.join('|')})[A-Za-z0-9_]*\\b`, 'gi');
}

/**
 * Decides whether an identifier match inside `line` at column `start`
 * should be ignored because it is a property access on an external contract
 * — ABI methods (`.write.mint`, `.read.getMintPrice`) cannot be renamed
 * without breaking block explorers, subgraphs, and audit artifacts.
 *
 * Heuristic: the character immediately before the identifier is `.`, and
 * the line has a `// lexicon-allow-abi` marker. This is stricter than
 * matching any `.identifier` because we still want to flag accidental
 * `widget.stakingStatus` style regressions — those should be renamed.
 */
export function isAbiPropertyAccess(line: string, start: number): boolean {
  if (start === 0) return false;
  if (line[start - 1] !== '.') return false;
  return /\/\/\s*lexicon-allow-abi\b/i.test(line);
}

/** Keywords that mark a declaration position. */
const DECL_KEYWORDS = /\b(?:const|let|var|function|class|interface|type|enum|namespace)\s+$/;

/**
 * Returns true when the identifier at `start` in `line` is positioned as
 * an explicit top-level declaration (`const X`, `function X`, `type X`,
 * `interface X`, etc.). Returns false for:
 *   - property access (`obj.X`) — skipped by `isAbiPropertyAccess` and the
 *     surrounding scanner logic.
 *   - destructuring patterns (`const { BidderAddr } = data`) — these are
 *     backend field consumers; renaming them would desync from the wire
 *     format. The `lexicon-allow-backend-type` pragma is the escape hatch
 *     for declaring backend-shaped types; everything else relies on the
 *     allow-wrapped `services/api/types.ts`.
 *
 * We use a conservative check: one of the declaration keywords appears
 * within the prefix of the line immediately before whitespace + the name.
 */
export function looksLikeDeclaration(line: string, start: number): boolean {
  const prefix = line.slice(0, start);
  return DECL_KEYWORDS.test(prefix);
}

/**
 * Scans for declared identifiers containing banned stems. Skips:
 *   - import/export lines (paths are handled by buildIdentifierPattern
 *     callers only for declarations, not property access).
 *   - Comment-only lines.
 *   - Lines inside `lexicon-allow-start/end` blocks.
 *   - Lines with `// lexicon-allow-abi` or `// lexicon-allow-backend-type`.
 *   - Property access like `obj.bidderAddr` (not a declaration).
 */
export function scanIdentifiers(
  content: string,
  pattern: RegExp,
  opts: { onlyDeclarations?: boolean } = {},
): ScannerHit[] {
  const { onlyDeclarations = true } = opts;
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;
    if (pragma.allowsLine) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (/^\s*(?:import|export)\s/.test(line) && /\bfrom\s+['"`]/.test(line)) return;

    // Reset global-regex lastIndex per line.
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const identifier = match[0];
      const start = match.index;
      if (isAbiPropertyAccess(line, start)) continue;
      if (onlyDeclarations && !looksLikeDeclaration(line, start)) continue;
      hits.push({ line: idx + 1, term: identifier, literal: identifier });
    }
  });

  return hits;
}

/** Extracts line and block comment content from a single line. */
export function extractComments(line: string): string[] {
  const out: string[] = [];
  // Block comments on the line.
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(line)) !== null) out.push(m[1]!);
  // Line comment at end of line (or whole line).
  const lineRe = /\/\/\s?(.*)$/;
  const lineMatch = lineRe.exec(line);
  if (lineMatch) out.push(lineMatch[1]!);
  return out;
}

/**
 * Scans only comment content for banned terms. Separate from
 * `scanContent` so CI can surface comment hits as warnings without failing
 * the build.
 */
export function scanComments(content: string, pattern: RegExp): ScannerHit[] {
  const lines = content.split('\n');
  const hits: ScannerHit[] = [];
  const state: AllowState = { inBlock: false };
  let inBlockComment = false;

  lines.forEach((line, idx) => {
    const pragma = readPragma(line);
    if (pragma.opensBlock) {
      state.inBlock = true;
      return;
    }
    if (pragma.closesBlock) {
      state.inBlock = false;
      return;
    }
    if (state.inBlock) return;

    // Multi-line block comments: crudely track /* ... */ across lines.
    let scanLine = line;
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) {
        // Whole line is inside a block comment.
        const matches = line.match(pattern);
        if (matches) for (const m of matches) hits.push({ line: idx + 1, term: m, literal: line });
        return;
      }
      const leading = line.slice(0, end);
      const matches = leading.match(pattern);
      if (matches) for (const m of matches) hits.push({ line: idx + 1, term: m, literal: leading });
      scanLine = line.slice(end + 2);
      inBlockComment = false;
    }

    // Look for /* ... (without */) to open a block spanning next lines.
    const openIdx = scanLine.indexOf('/*');
    if (openIdx !== -1 && scanLine.indexOf('*/', openIdx) === -1) {
      const commentStart = scanLine.slice(openIdx + 2);
      const matches = commentStart.match(pattern);
      if (matches)
        for (const m of matches) hits.push({ line: idx + 1, term: m, literal: commentStart });
      inBlockComment = true;
      return;
    }

    for (const comment of extractComments(scanLine)) {
      const matches = comment.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal: comment });
        }
      }
    }
  });

  return hits;
}
