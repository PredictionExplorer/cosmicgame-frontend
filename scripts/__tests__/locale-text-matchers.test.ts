import {
  buildCjkSubstringPattern,
  buildLatinWordPattern,
  buildTermPattern,
  buildUnicodeStemPattern,
  buildUnicodeWordPattern,
  inflect,
  NEVER_MATCH,
} from '../locale-text-matchers';

const matches = (pattern: RegExp, text: string): string[] => text.match(pattern) ?? [];

// lexicon-allow-start: matcher fixtures quote banned vocabulary on purpose
describe('locale-text-matchers', () => {
  describe('buildLatinWordPattern', () => {
    it('is word-bounded and case-insensitive', () => {
      const pattern = buildLatinWordPattern(['bid']);
      expect(matches(pattern, 'Place a Bid now')).toEqual(['Bid']);
      expect(matches(pattern, 'forbidden bidding')).toEqual([]);
    });
  });

  describe('buildCjkSubstringPattern', () => {
    it('matches anywhere because CJK has no word boundaries', () => {
      expect(matches(buildCjkSubstringPattern(['抽奖']), '今日抽奖开始')).toEqual(['抽奖']);
    });
  });

  describe('buildUnicodeWordPattern', () => {
    const pattern = buildUnicodeWordPattern(['приз', 'гра']);

    it('matches whole Cyrillic words with case folding', () => {
      expect(matches(pattern, 'Головний Приз сезону')).toEqual(['Приз']);
      expect(matches(pattern, 'Це гра.')).toEqual(['гра']);
    });

    it('does not match inside longer words', () => {
      expect(matches(pattern, 'призначення адреси')).toEqual([]);
      expect(matches(pattern, 'графік і гравітація')).toEqual([]);
    });

    it('exists because \\b never sees a boundary around Cyrillic letters at all', () => {
      // Neither side of a Cyrillic word is an ASCII word character, so the
      // Latin matcher cannot find even a standalone Cyrillic word.
      expect(matches(buildLatinWordPattern(['приз']), 'головний приз')).toEqual([]);
      expect(matches(pattern, 'головний приз')).toEqual(['приз']);
    });

    it('treats digits and combining marks as word characters', () => {
      expect(matches(pattern, 'приз2')).toEqual([]);
      expect(matches(pattern, 'при\u0301з')).toEqual([]);
    });
  });

  describe('buildUnicodeStemPattern', () => {
    const pattern = buildUnicodeStemPattern(['лотере', 'аукціон']);

    it('covers every inflected suffix of a word-initial stem', () => {
      expect(matches(pattern, 'Лотерея, лотереї та лотерейний квиток')).toEqual([
        'Лотерея',
        'лотереї',
        'лотерейний',
      ]);
      expect(matches(pattern, 'на аукціоні')).toEqual(['аукціоні']);
    });

    it('requires the stem to start the word', () => {
      expect(matches(pattern, 'відлотерея')).toEqual([]);
    });

    it('reports the whole matched word so diagnostics show the real form', () => {
      expect(matches(buildUnicodeStemPattern(['виграш']), 'великий виграшний день')).toEqual([
        'виграшний',
      ]);
    });
  });

  describe('buildTermPattern', () => {
    it('dispatches on the matcher name', () => {
      expect(matches(buildTermPattern({ matcher: 'latin-word', terms: ['bet'] }), 'a bet')).toEqual(
        ['bet'],
      );
      expect(
        matches(buildTermPattern({ matcher: 'unicode-stem', terms: ['казино'] }), 'у казино'),
      ).toEqual(['казино']);
    });

    it('never matches anything for an empty term list', () => {
      for (const matcher of [
        'latin-word',
        'cjk-substring',
        'unicode-word',
        'unicode-stem',
      ] as const) {
        expect(buildTermPattern({ matcher, terms: [] })).toBe(NEVER_MATCH);
        expect(matches(buildTermPattern({ matcher, terms: [] }), 'anything at all')).toEqual([]);
      }
    });
  });

  describe('inflect', () => {
    it('expands a stem into explicit forms', () => {
      expect(inflect('приз', ['', 'и', 'у'])).toEqual(['приз', 'призи', 'призу']);
    });
  });
});
// lexicon-allow-end
