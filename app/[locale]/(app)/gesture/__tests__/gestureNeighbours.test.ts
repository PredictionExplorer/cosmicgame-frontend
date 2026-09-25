import { neighbourWindow, pickNeighbours } from '../[id]/gestureNeighbours';

describe('neighbourWindow', () => {
  it('asks for the gestures just before and after a position (positions start at 1)', () => {
    expect(neighbourWindow(1135)).toEqual({ offset: 1133, limit: 3 });
  });

  it('asks for the first two gestures when the gesture is the cycle’s first', () => {
    expect(neighbourWindow(1)).toEqual({ offset: 0, limit: 2 });
  });
});

describe('pickNeighbours', () => {
  const page = [
    { BidPosition: 1134, EvtLogId: 29470, TimeStamp: 1_790_000_000, PrizeTime: 1_790_743_619 },
    { BidPosition: 1135, EvtLogId: 29472, TimeStamp: 1_790_003_600, PrizeTime: 1_790_747_291 },
    { BidPosition: 1136, EvtLogId: 29475, TimeStamp: 1_790_018_067, PrizeTime: 1_790_750_963 },
  ];

  it('steps by position, not by record id, and keeps when each was made', () => {
    expect(pickNeighbours(page, 1135)).toEqual({
      previous: {
        id: 29470,
        position: 1134,
        timestamp: 1_790_000_000,
        finalizationTime: 1_790_743_619,
      },
      next: {
        id: 29475,
        position: 1136,
        timestamp: 1_790_018_067,
        finalizationTime: 1_790_750_963,
      },
    });
  });

  it('has no previous gesture for the first and no next for the latest', () => {
    expect(pickNeighbours(page.slice(0, 2), 1135).next).toBeNull();
    const first = pickNeighbours(
      [
        { BidPosition: 1, EvtLogId: 1, TimeStamp: 10, PrizeTime: 100 },
        { BidPosition: 2, EvtLogId: 3, TimeStamp: 20, PrizeTime: 110 },
      ],
      1,
    );
    expect(first.previous).toBeNull();
    expect(first.next).toMatchObject({ id: 3, position: 2 });
  });

  it('reads a missing or zero time as unknown, never as the epoch', () => {
    const [row] = page;
    const { previous } = pickNeighbours([{ ...row!, TimeStamp: 0, PrizeTime: -1 }], 1135);
    expect(previous).toMatchObject({ timestamp: null, finalizationTime: null });
  });
});
