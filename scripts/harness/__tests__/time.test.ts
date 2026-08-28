import { advanceChainTimeTo, resolveChainTimeTarget } from '../director/time';

describe('resolveChainTimeTarget', () => {
  it('caps history seeding at wall time', () => {
    expect(
      resolveChainTimeTarget({
        current: 1_000n,
        requested: 2_000n,
        wall: 1_500n,
      }),
    ).toBe(1_500n);
  });

  it('allows explicit virtual-clock transitions beyond wall time', () => {
    expect(
      resolveChainTimeTarget({
        current: 1_000n,
        requested: 2_000n,
        wall: 1_500n,
        allowFuture: true,
      }),
    ).toBe(2_000n);
  });

  it('never moves a monotonic chain backwards', () => {
    expect(
      resolveChainTimeTarget({
        current: 2_000n,
        requested: 1_000n,
        wall: 3_000n,
      }),
    ).toBe(2_000n);
  });
});

describe('advanceChainTimeTo', () => {
  it('retries when interval mining consumes the first requested timestamp', async () => {
    const setNextBlockTimestamp = jest
      .fn()
      .mockRejectedValueOnce(new Error('timestamp already mined'))
      .mockResolvedValueOnce(undefined);
    const world = {
      publicClient: {
        getBlock: jest
          .fn()
          .mockResolvedValueOnce({ timestamp: 100n })
          .mockResolvedValueOnce({ timestamp: 100n })
          .mockResolvedValueOnce({ timestamp: 200n }),
      },
      testClient: {
        setNextBlockTimestamp,
        mine: jest.fn().mockResolvedValue(undefined),
      },
    };

    await expect(
      advanceChainTimeTo(world as never, 200n, { allowFuture: true }),
    ).resolves.toBeUndefined();
    expect(setNextBlockTimestamp).toHaveBeenCalledTimes(2);
    expect(world.testClient.mine).toHaveBeenCalledTimes(1);
  });

  it('surfaces the final interval-miner failure after bounded retries', async () => {
    const world = {
      publicClient: {
        getBlock: jest.fn().mockResolvedValue({ timestamp: 100n }),
      },
      testClient: {
        setNextBlockTimestamp: jest.fn().mockRejectedValue(new Error('timestamp race')),
        mine: jest.fn(),
      },
    };

    await expect(advanceChainTimeTo(world as never, 200n, { allowFuture: true })).rejects.toThrow(
      'timestamp race',
    );
    expect(world.testClient.setNextBlockTimestamp).toHaveBeenCalledTimes(3);
    expect(world.testClient.mine).not.toHaveBeenCalled();
  });
});
