import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  faqContentEn,
  findFaqItemByHash,
  findFaqItemById,
  getAllFaqItems,
  getFaqContent,
  getTotalFaqQuestionCount,
  type FAQCategory,
} from '@/content/faq';
import { protocolFacts } from '@/content/protocol-facts';
import faqMessagesEn from '@/messages/en/faq.json';

import { formatCount } from '@/utils/format/numbers';
import { routing } from '@/i18n/routing';

const faqCategories: readonly FAQCategory[] = faqContentEn.categories;
const popularQuestionIds = faqContentEn.popularQuestionIds;
const getAllItems = () => getAllFaqItems(faqContentEn);
const getTotalQuestionCount = () => getTotalFaqQuestionCount(faqContentEn);
const findItemById = (id: string) => findFaqItemById(faqContentEn, id);
const findItemByHash = (hash: string) => findFaqItemByHash(faqContentEn, hash);

const EXPECTED_CATEGORY_IDS = [
  'getting-started',
  'allocations-and-rewards',
  'game-mechanics',
  'tokens-and-nfts',
  'arbitrum-and-technical',
  'trust-and-governance',
] as const;

describe('FAQ answer paragraphs (V235)', () => {
  it('breaks the longest procedural answers into paragraphs in every locale', () => {
    for (const locale of routing.locales) {
      const content = getFaqContent(locale);
      for (const id of [
        'team-controls',
        'how-do-i-claim-my-allocation',
        'how-does-anchoring-work',
        'how-is-participation-cst-calculated',
      ]) {
        const answer = findFaqItemById(content, id)!.item.answer;
        expect(answer).toMatch(/\S\n\n\S/);
        // Same paragraph count in every locale: the breaks sit at the same sentences.
        expect(answer.split('\n\n')).toHaveLength(
          findFaqItemById(getFaqContent('en'), id)!.item.answer.split('\n\n').length,
        );
      }
    }
  });
});

describe('FAQ Signature Allocation answer (V226)', () => {
  it('gives the allocation to whoever finalizes, with the Final Gesture window, in every locale', () => {
    const english = findFaqItemById(getFaqContent('en'), 'what-is-the-main-allocation')!.item
      .answer;
    expect(english).toMatch(/^The Signature Allocation goes to whoever finalizes the cycle\./);
    expect(english).not.toMatch(/received by the participant who made the Final Gesture/);

    for (const locale of routing.locales) {
      const { answer } = findFaqItemById(
        getFaqContent(locale),
        'what-is-the-main-allocation',
      )!.item;
      // The exclusive window, the share and the CST come from the facts, not typed copy.
      expect(answer).toContain(String(protocolFacts.finalGestureExclusivityHours));
      expect(answer).toContain(`${protocolFacts.mainEthPercentage}%`);
      expect(answer).toContain(formatCount(protocolFacts.specialAllocationCst, locale));
    }
  });

  it('formats every protocol amount through the locale layer, never a typed Intl tag', () => {
    for (const locale of routing.locales) {
      const source = readFileSync(
        path.join(process.cwd(), `content/faq/text.${locale}.ts`),
        'utf8',
      );
      expect(source).not.toMatch(/\.toLocaleString\(/);
    }
  });
});

describe('faq-data', () => {
  describe('data integrity', () => {
    it('has exactly 6 categories', () => {
      expect(faqCategories).toHaveLength(6);
    });

    it('all categories have items and no empty arrays', () => {
      for (const category of faqCategories) {
        expect(category.items).toBeDefined();
        expect(Array.isArray(category.items)).toBe(true);
        expect(category.items.length).toBeGreaterThan(0);
      }
    });

    it('all item IDs are unique across all categories', () => {
      const allIds = getAllItems().map((item) => item.id);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('every popular question ID exists in the data', () => {
      const allIds = new Set(getAllItems().map((item) => item.id));
      for (const id of popularQuestionIds) {
        expect(allIds.has(id)).toBe(true);
      }
    });

    it('popularQuestionIds has exactly 4 IDs', () => {
      expect(popularQuestionIds).toHaveLength(4);
    });
  });

  describe('category structure', () => {
    it('each category has required fields: id, title, description, icon, items', () => {
      for (const category of faqCategories) {
        expect(category).toHaveProperty('id');
        expect(typeof category.id).toBe('string');
        expect(category.id.length).toBeGreaterThan(0);

        expect(category).toHaveProperty('title');
        expect(typeof category.title).toBe('string');
        expect(category.title.length).toBeGreaterThan(0);

        expect(category).toHaveProperty('description');
        expect(typeof category.description).toBe('string');
        expect(category.description.length).toBeGreaterThan(0);

        expect(category).toHaveProperty('icon');
        expect(category.icon).toBeDefined();
        expect(category.icon).toBeTruthy();

        expect(category).toHaveProperty('items');
        expect(Array.isArray(category.items)).toBe(true);
      }
    });

    it('category IDs match expected set', () => {
      const actualIds = faqCategories.map((c) => c.id).sort();
      const expectedIds = [...EXPECTED_CATEGORY_IDS].sort();
      expect(actualIds).toEqual(expectedIds);
    });
  });

  describe('item structure', () => {
    it('all items have non-empty question and answer strings', () => {
      const allItems = getAllItems();
      for (const item of allItems) {
        expect(typeof item.question).toBe('string');
        expect(item.question.trim().length).toBeGreaterThan(0);
        expect(typeof item.answer).toBe('string');
        expect(item.answer.trim().length).toBeGreaterThan(0);
      }
    });

    it('all items have id, question, and answer', () => {
      const allItems = getAllItems();
      for (const item of allItems) {
        expect(item).toHaveProperty('id');
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(item).toHaveProperty('question');
        expect(item).toHaveProperty('answer');
      }
    });
  });

  describe('getAllItems', () => {
    it('returns flat array of all items across categories', () => {
      const items = getAllItems();
      const expectedCount = faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(items).toHaveLength(expectedCount);
    });

    it('returns correct total count matching sum of category items', () => {
      const items = getAllItems();
      const manualCount = faqCategories.flatMap((c) => c.items).length;
      expect(items.length).toBe(manualCount);
    });
  });

  describe('getTotalQuestionCount', () => {
    it('returns total count of all items', () => {
      const count = getTotalQuestionCount();
      const expected = faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);
      expect(count).toBe(expected);
    });

    it('matches getAllItems().length', () => {
      expect(getTotalQuestionCount()).toBe(getAllItems().length);
    });
  });

  describe('findItemById', () => {
    it('returns item and category for existing ID', () => {
      const result = findItemById('what-is-cosmic-signature');
      expect(result).toBeDefined();
      expect(result?.item).toBeDefined();
      expect(result?.category).toBeDefined();
      expect(result?.item.id).toBe('what-is-cosmic-signature');
      expect(result?.item.question).toContain('Cosmic Signature');
      expect(result?.category.id).toBe('getting-started');
    });

    it('returns correct category for item in allocations-and-rewards', () => {
      const result = findItemById('what-is-the-main-allocation');
      expect(result).toBeDefined();
      expect(result?.category.id).toBe('allocations-and-rewards');
    });

    it('returns undefined for non-existing ID', () => {
      const result = findItemById('non-existent-id-xyz');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const result = findItemById('');
      expect(result).toBeUndefined();
    });
  });

  describe('findItemByHash', () => {
    it('works with # prefix', () => {
      const result = findItemByHash('#main-allocation');
      expect(result).toBeDefined();
      expect(result?.item.hashAnchor).toBe('main-allocation');
      expect(result?.item.id).toBe('what-is-the-main-allocation');
    });

    it('works without # prefix', () => {
      const result = findItemByHash('main-allocation');
      expect(result).toBeDefined();
      expect(result?.item.hashAnchor).toBe('main-allocation');
    });

    it('finds by hashAnchor for main-allocation', () => {
      const result = findItemByHash('main-allocation');
      expect(result).toBeDefined();
      expect(result?.item.id).toBe('what-is-the-main-allocation');
    });

    it('finds by hashAnchor for endurance-champion', () => {
      const result = findItemByHash('endurance-champion');
      expect(result).toBeDefined();
      expect(result?.item.id).toBe('what-is-endurance-champion');
    });

    it('finds by hashAnchor for chrono-warrior', () => {
      const result = findItemByHash('chrono-warrior');
      expect(result).toBeDefined();
      expect(result?.item.id).toBe('what-is-chrono-warrior');
    });

    it('finds by id when used as hash (e.g. what-is-cosmic-signature)', () => {
      const result = findItemByHash('what-is-cosmic-signature');
      expect(result).toBeDefined();
      expect(result?.item.id).toBe('what-is-cosmic-signature');
    });

    it('finds by id with # prefix', () => {
      const result = findItemByHash('#what-is-cosmic-signature');
      expect(result).toBeDefined();
      expect(result?.item.id).toBe('what-is-cosmic-signature');
    });

    it('returns undefined for unknown hash', () => {
      const result = findItemByHash('unknown-hash-xyz');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty hash', () => {
      const result = findItemByHash('');
      expect(result).toBeUndefined();
    });
  });

  describe('typography (D085)', () => {
    const strings = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : value && typeof value === 'object'
          ? Object.values(value).flatMap(strings)
          : [];

    it('writes English apostrophes and quotes as typographic marks', () => {
      const copy = [
        ...getAllItems().flatMap((item) => [item.question, item.answer]),
        ...faqCategories.flatMap((category) => [category.title, category.description]),
        ...strings(faqMessagesEn),
      ];
      for (const text of copy) {
        expect(text).not.toMatch(/\w'\w/);
        expect(text).not.toMatch(/"/);
      }
    });

    it('names X one way, as the site footer does', () => {
      const copy = [...getAllItems().map((item) => item.answer), ...strings(faqMessagesEn)];
      for (const text of copy) expect(text).not.toMatch(/Twitter \/ X|X \/ Twitter/);
      expect(faqMessagesEn.contact.x).toBe('X (Twitter)');
    });
  });
});
