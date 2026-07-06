import {
  faqCategories,
  popularQuestionIds,
  getAllItems,
  getTotalQuestionCount,
  findItemById,
  findItemByHash,
} from '../data/faq-data';

const EXPECTED_CATEGORY_IDS = [
  'getting-started',
  'allocations-and-rewards',
  'game-mechanics',
  'tokens-and-nfts',
  'arbitrum-and-technical',
  'trust-and-governance',
] as const;

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
});
