import { missingCycleState } from '../missingCycle';

describe('missingCycleState', () => {
  it('calls the cycle after the newest finalized one open', () => {
    expect(missingCycleState(2, 2)).toBe('open');
  });

  it('calls a cycle beyond the live one not started', () => {
    expect(missingCycleState(99, 2)).toBe('notStarted');
  });

  it('cannot tell while the live cycle is unknown, or for a cycle the list already finalized', () => {
    expect(missingCycleState(2, null)).toBe('unknown');
    expect(missingCycleState(1, 2)).toBe('unknown');
  });
});
