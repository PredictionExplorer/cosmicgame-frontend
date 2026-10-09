/**
 * @jest-environment node
 */
import { failedRead, readNow } from '../publicDataReads';

const mockCapCacheWindow = jest.fn();
jest.mock('@/lib/cacheWindow', () => ({
  capCacheWindow: (window: string) => mockCapCacheWindow(window),
}));

beforeEach(() => mockCapCacheWindow.mockReset());

describe('server reads behind the public headers', () => {
  it('times a read that answers, leaving the page its own cache window', async () => {
    const read = await readNow(async () => [1, 2, 3]);
    expect(read.data).toEqual([1, 2, 3]);
    expect(read.at).toBeGreaterThan(0);
    expect(mockCapCacheWindow).not.toHaveBeenCalled();
  });

  it('keeps a render whose read failed for a minute only, so a dash is not served for long', async () => {
    // Regression: a build's burst of 429s baked "—" into the gallery and
    // allocation headers for the whole five-minute window.
    const read = await readNow(async () => {
      throw new Error('Request failed with status code 429');
    });
    expect(read.data).toBeNull();
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('says so for any read that could not be made', async () => {
    await expect(failedRead()).resolves.toMatchObject({ data: null });
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });
});
