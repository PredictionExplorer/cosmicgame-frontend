import { PATH_REWRITES, resolveNewPathToLegacy } from '@/lib/routeRewrites';

describe('proxy path rewrites', () => {
  describe('PATH_REWRITES table integrity', () => {
    it('has a stable, non-empty list of rules', () => {
      expect(PATH_REWRITES.length).toBeGreaterThanOrEqual(14);
    });

    it('every rule defines a regex and a transformer', () => {
      for (const rule of PATH_REWRITES) {
        expect(rule.newPath).toBeInstanceOf(RegExp);
        expect(typeof rule.toLegacy).toBe('function');
      }
    });

    it('every regex is anchored (start and end) to avoid unintended substring matches', () => {
      for (const rule of PATH_REWRITES) {
        expect(rule.newPath.source.startsWith('^')).toBe(true);
        expect(rule.newPath.source.endsWith('$')).toBe(true);
      }
    });
  });

  describe('resolveNewPathToLegacy', () => {
    it('returns null for the landing root', () => {
      expect(resolveNewPathToLegacy('/')).toBeNull();
    });

    it('returns null for an unrelated path', () => {
      expect(resolveNewPathToLegacy('/about')).toBeNull();
    });

    it('returns null for already-legacy paths', () => {
      expect(resolveNewPathToLegacy('/bid/1')).toBeNull();
      expect(resolveNewPathToLegacy('/prize')).toBeNull();
      expect(resolveNewPathToLegacy('/staking')).toBeNull();
      expect(resolveNewPathToLegacy('/current-round')).toBeNull();
    });

    describe('simple (non-dynamic) aliases', () => {
      it.each([
        ['/allocation', '/prize'],
        ['/allocation-finalized', '/prize-claimed'],
        ['/anchoring', '/staking'],
        ['/my-anchors', '/my-staking'],
        ['/my-allocations', '/my-winnings'],
        ['/public-goods-contributions-cg', '/charity-deposits-cg'],
        ['/public-goods-contributions-voluntary', '/charity-deposits-voluntary'],
        ['/public-goods-retrievals', '/charity-withdrawals'],
        ['/recipient-history', '/winning-history'],
        ['/coordination-changes', '/changed-parameters'],
      ])('rewrites %s -> %s', (newPath, legacyPath) => {
        expect(resolveNewPathToLegacy(newPath)).toBe(legacyPath);
      });
    });

    describe('dynamic aliases with captured segments', () => {
      it('rewrites /gesture/:id -> /bid/:id', () => {
        expect(resolveNewPathToLegacy('/gesture/42')).toBe('/bid/42');
        expect(resolveNewPathToLegacy('/gesture/0xdeadbeef')).toBe('/bid/0xdeadbeef');
      });

      it('rewrites /allocation/:id -> /prize/:id', () => {
        expect(resolveNewPathToLegacy('/allocation/42')).toBe('/prize/42');
      });

      it('rewrites /anchor-action/:isRwalk/:actionId -> /staking-action/:isRwalk/:actionId', () => {
        expect(resolveNewPathToLegacy('/anchor-action/0/7')).toBe('/staking-action/0/7');
        expect(resolveNewPathToLegacy('/anchor-action/1/abc')).toBe('/staking-action/1/abc');
      });
    });

    describe('/current-cycle handling', () => {
      it('rewrites bare /current-cycle to /current-round', () => {
        expect(resolveNewPathToLegacy('/current-cycle')).toBe('/current-round');
      });

      it('preserves sub-paths under /current-cycle/', () => {
        expect(resolveNewPathToLegacy('/current-cycle/details')).toBe('/current-round/details');
      });
    });

    describe('edge cases', () => {
      it('does not rewrite partial matches (e.g., /gesturefoo)', () => {
        expect(resolveNewPathToLegacy('/gesturefoo')).toBeNull();
      });

      it('does not rewrite missing dynamic segments', () => {
        // `/gesture` alone should not match `/gesture/:id` since the rule
        // requires a trailing segment.
        expect(resolveNewPathToLegacy('/gesture')).toBeNull();
        // `/allocation` alone IS a simple alias, so expect a rewrite.
        expect(resolveNewPathToLegacy('/allocation')).toBe('/prize');
      });

      it('is case-sensitive (Next.js path matching is)', () => {
        expect(resolveNewPathToLegacy('/ANCHORING')).toBeNull();
      });

      it('handles trailing slashes consistently (no rewrite for /anchoring/)', () => {
        // `/anchoring` is bare, `/anchoring/` is not in the ruleset.
        expect(resolveNewPathToLegacy('/anchoring/')).toBeNull();
      });
    });
  });
});
