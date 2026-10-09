import enFormats from '@/messages/en/formats.json';
import enMeta from '@/messages/en/meta.json';
import enStatistics from '@/messages/en/statistics.json';
import enTables from '@/messages/en/tables.json';
import zhFormats from '@/messages/zh/formats.json';
import zhMeta from '@/messages/zh/meta.json';
import zhStatistics from '@/messages/zh/statistics.json';
import zhTables from '@/messages/zh/tables.json';

function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('Sprint 5 bilingual catalogs', () => {
  it('keeps complete statistics, table, and format parity', () => {
    expect(leafPaths(zhStatistics).sort()).toEqual(leafPaths(enStatistics).sort());
    expect(leafPaths(zhTables).sort()).toEqual(leafPaths(enTables).sort());
    expect(leafPaths(zhFormats).sort()).toEqual(leafPaths(enFormats).sort());
  });

  it('keeps the English statistics labels in sentence case around the coined terms', () => {
    expect(enStatistics.metrics.activePerformanceCycle.label).toBe('Active Performance Cycle');
    expect(enStatistics.metrics.contractBalance.label).toBe('Contract balance');
    expect(enStatistics.metrics.cosmicSignatureNftsImprinted.shortLabel).toBe('NFTs imprinted');
    expect(enStatistics.charts.endurance.description).toContain('The Endurance Champion has');
    expect(enTables.statisticsTooltips.allocationsSumEth).toContain('Allocations (all kinds)');
  });

  it('provides natural Chinese statistics and table copy', () => {
    expect(zhStatistics.metrics.activePerformanceCycle.label).toBe('当前演绎周期');
    expect(zhStatistics.metrics.uniqueRecipients.label).toBe('独立获配者');
    expect(zhStatistics.charts.frequency.openingExcluded).toContain('首小时');
    expect(zhTables.statisticsTooltips.allocationsSumEth).toContain('获配次数（全部类型）');
    expect(zhFormats.durationCompact.hours).toBe('小时');
  });

  it('covers every Sprint 5 metadata owner in both locales', () => {
    const keys = [
      'statistics',
      'statisticsParticipation',
      'statisticsTokens',
      'statisticsAnchoring',
      'statisticsActivity',
      'statisticsPerformance',
      'recipientHistory',
      'namedNfts',
      'nftDonations',
      'usedRwlkNfts',
      'userProfile',
      'userStellarSelectionEth',
      'userStellarSelectionNft',
      'systemEvent',
    ] as const;

    for (const key of keys) {
      expect(enMeta[key].title).toBeTruthy();
      expect(enMeta[key].description).toBeTruthy();
      expect(zhMeta[key].title).toBeTruthy();
      expect(zhMeta[key].description).toBeTruthy();
    }
  });
});
