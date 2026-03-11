import { asWriteFn } from '../contractWrite';

describe('asWriteFn', () => {
  test('returns a callable function', () => {
    const fn = asWriteFn(() => Promise.resolve('0x123' as `0x${string}`));
    expect(typeof fn).toBe('function');
  });

  test('preserves the underlying function behavior', async () => {
    const original = jest.fn().mockResolvedValue('0xabc' as `0x${string}`);
    const wrapped = asWriteFn(original);
    const result = await wrapped('arg1', 'arg2');
    expect(result).toBe('0xabc');
    expect(original).toHaveBeenCalledWith('arg1', 'arg2');
  });

  test('passes through arguments correctly', async () => {
    const original = jest.fn().mockResolvedValue('0x0');
    const wrapped = asWriteFn(original);
    await wrapped([1, 'msg'], { value: 100n, gas: 200000n });
    expect(original).toHaveBeenCalledWith([1, 'msg'], { value: 100n, gas: 200000n });
  });

  test('returns a promise of hex string', async () => {
    const wrapped = asWriteFn(() => Promise.resolve('0xdeadbeef'));
    const result = await wrapped();
    expect(result).toMatch(/^0x/);
  });

  test('propagates errors from the underlying function', async () => {
    const wrapped = asWriteFn(() => Promise.reject(new Error('tx reverted')));
    await expect(wrapped()).rejects.toThrow('tx reverted');
  });

  test('accepts undefined/null input gracefully', () => {
    expect(() => asWriteFn(undefined)).not.toThrow();
    expect(() => asWriteFn(null)).not.toThrow();
  });

  test('works with no arguments', async () => {
    const original = jest.fn().mockResolvedValue('0x1');
    const wrapped = asWriteFn(original);
    await wrapped();
    expect(original).toHaveBeenCalledWith();
  });

  test('works with single object argument (gas override)', async () => {
    const original = jest.fn().mockResolvedValue('0x2');
    const wrapped = asWriteFn(original);
    await wrapped({ gas: 500000n });
    expect(original).toHaveBeenCalledWith({ gas: 500000n });
  });

  test('sequential calls are independent', async () => {
    const original = jest.fn().mockResolvedValueOnce('0xfirst').mockResolvedValueOnce('0xsecond');
    const wrapped = asWriteFn(original);
    expect(await wrapped('a')).toBe('0xfirst');
    expect(await wrapped('b')).toBe('0xsecond');
    expect(original).toHaveBeenCalledTimes(2);
  });
});
