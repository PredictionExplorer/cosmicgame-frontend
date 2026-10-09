import { newestAttachedFirst } from '../attachedWall';

describe('newestAttachedFirst', () => {
  it('orders by time, then by record id where the indexer gives no time', () => {
    const ordered = newestAttachedFirst([
      { RecordId: 1, TimeStamp: null },
      { RecordId: 4, TimeStamp: null },
      { RecordId: 2, TimeStamp: 200 },
      { RecordId: 3, TimeStamp: 100 },
    ]);
    expect(ordered.map((record) => record.RecordId)).toEqual([2, 3, 4, 1]);
  });
});
