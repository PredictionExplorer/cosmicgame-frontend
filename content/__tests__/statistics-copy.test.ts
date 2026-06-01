import { statisticsCopy } from '@/content/statistics-copy';

describe('statisticsCopy', () => {
  it('keeps every metric tooltip non-empty', () => {
    for (const metric of Object.values(statisticsCopy.metrics)) {
      expect(metric.tooltip.trim().length).toBeGreaterThan(20);
    }
  });

  it('keeps every statistics section explanation non-empty', () => {
    for (const explanation of Object.values(statisticsCopy.sections)) {
      expect(explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it('keeps every table header explanation non-empty', () => {
    for (const explanation of Object.values(statisticsCopy.tables)) {
      expect(explanation.trim().length).toBeGreaterThan(20);
    }
  });
});
