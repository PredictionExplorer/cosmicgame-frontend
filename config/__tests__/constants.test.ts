import {
  DATA_POLL_INTERVAL_MS,
  STATS_POLL_INTERVAL_MS,
  HEADER_POLL_INTERVAL_MS,
  NOTIFICATION_AUTO_HIDE_MS,
  BID_GAS_LIMIT,
  ERC721_INTERFACE_ID,
} from '../constants';

describe('config/constants', () => {
  describe('DATA_POLL_INTERVAL_MS', () => {
    it('equals 12 000', () => {
      expect(DATA_POLL_INTERVAL_MS).toBe(12_000);
    });

    it('is a number', () => {
      expect(typeof DATA_POLL_INTERVAL_MS).toBe('number');
    });

    it('is positive', () => {
      expect(DATA_POLL_INTERVAL_MS).toBeGreaterThan(0);
    });
  });

  describe('STATS_POLL_INTERVAL_MS', () => {
    it('equals 5 000', () => {
      expect(STATS_POLL_INTERVAL_MS).toBe(5_000);
    });

    it('is a number', () => {
      expect(typeof STATS_POLL_INTERVAL_MS).toBe('number');
    });

    it('is positive', () => {
      expect(STATS_POLL_INTERVAL_MS).toBeGreaterThan(0);
    });
  });

  describe('HEADER_POLL_INTERVAL_MS', () => {
    it('equals 30 000', () => {
      expect(HEADER_POLL_INTERVAL_MS).toBe(30_000);
    });

    it('is a number', () => {
      expect(typeof HEADER_POLL_INTERVAL_MS).toBe('number');
    });

    it('is positive', () => {
      expect(HEADER_POLL_INTERVAL_MS).toBeGreaterThan(0);
    });
  });

  describe('NOTIFICATION_AUTO_HIDE_MS', () => {
    it('equals 5 000', () => {
      expect(NOTIFICATION_AUTO_HIDE_MS).toBe(5_000);
    });

    it('is a number', () => {
      expect(typeof NOTIFICATION_AUTO_HIDE_MS).toBe('number');
    });

    it('is positive', () => {
      expect(NOTIFICATION_AUTO_HIDE_MS).toBeGreaterThan(0);
    });
  });

  describe('BID_GAS_LIMIT', () => {
    it('equals 30 000 000n', () => {
      expect(BID_GAS_LIMIT).toBe(30_000_000n);
    });

    it('is a bigint', () => {
      expect(typeof BID_GAS_LIMIT).toBe('bigint');
    });

    it('is positive', () => {
      expect(BID_GAS_LIMIT).toBeGreaterThan(0n);
    });
  });

  describe('ERC721_INTERFACE_ID', () => {
    it('equals 0x80ac58cd', () => {
      expect(ERC721_INTERFACE_ID).toBe('0x80ac58cd');
    });

    it('is a string', () => {
      expect(typeof ERC721_INTERFACE_ID).toBe('string');
    });

    it('starts with 0x', () => {
      expect(ERC721_INTERFACE_ID).toMatch(/^0x/);
    });

    it('is a valid 4-byte hex selector', () => {
      expect(ERC721_INTERFACE_ID).toMatch(/^0x[0-9a-f]{8}$/);
    });
  });

  describe('interval ordering', () => {
    it('STATS_POLL_INTERVAL_MS <= DATA_POLL_INTERVAL_MS <= HEADER_POLL_INTERVAL_MS', () => {
      expect(STATS_POLL_INTERVAL_MS).toBeLessThanOrEqual(DATA_POLL_INTERVAL_MS);
      expect(DATA_POLL_INTERVAL_MS).toBeLessThanOrEqual(HEADER_POLL_INTERVAL_MS);
    });
  });

  describe('module exports', () => {
    it('exports exactly the expected constants', () => {
      const constants = require('../constants');
      const exportedKeys = Object.keys(constants).sort();
      expect(exportedKeys).toEqual([
        'BID_GAS_LIMIT',
        'DATA_POLL_INTERVAL_MS',
        'ERC721_INTERFACE_ID',
        'HEADER_POLL_INTERVAL_MS',
        'NOTIFICATION_AUTO_HIDE_MS',
        'STATS_POLL_INTERVAL_MS',
      ]);
    });
  });
});
