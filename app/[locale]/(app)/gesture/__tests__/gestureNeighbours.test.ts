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
    { BidPosition: 1134, EvtLogId: 29470 },
    { BidPosition: 1135, EvtLogId: 29472 },
    { BidPosition: 1136, EvtLogId: 29475 },
  ];

  it('steps by position, not by record id', () => {
    expect(pickNeighbours(page, 1135)).toEqual({
      previous: { id: 29470, position: 1134 },
      next: { id: 29475, position: 1136 },
    });
  });

  it('has no previous gesture for the first and no next for the latest', () => {
    expect(pickNeighbours(page.slice(0, 2), 1135).next).toBeNull();
    expect(
      pickNeighbours(
        [
          { BidPosition: 1, EvtLogId: 1 },
          { BidPosition: 2, EvtLogId: 3 },
        ],
        1,
      ),
    ).toEqual({
      previous: null,
      next: { id: 3, position: 2 },
    });
  });
});
