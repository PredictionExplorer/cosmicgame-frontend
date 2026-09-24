import { documentTitleOf } from '@/test-utils/metadata';

import { generateMetadata } from '../[id]/page';

const mockGestureRead = jest.fn();
jest.mock('../../../../../services/api', () => ({
  __esModule: true,
  default: { get_bid_info: (...args: unknown[]) => mockGestureRead(...args) },
}));

const props = (id: string) => ({ params: Promise.resolve({ locale: 'en', id }) });

describe('gesture/[id] metadata (D080)', () => {
  beforeEach(() => mockGestureRead.mockReset());

  it('names the gesture by its place and cycle, read once on the server', async () => {
    mockGestureRead.mockResolvedValue({ BidPosition: 1135, RoundNum: 2 });
    const metadata = await generateMetadata(props('29434'));
    expect(documentTitleOf(metadata)).toBe('Gesture #1135 · Cycle #2 · Cosmic Signature');
    expect(mockGestureRead).toHaveBeenCalledWith(29434);
  });

  it('names the record by its id when the gesture cannot be read', async () => {
    mockGestureRead.mockRejectedValue(new Error('offline'));
    const metadata = await generateMetadata(props('29435'));
    expect(documentTitleOf(metadata)).toBe('Gesture record 29435 · Cosmic Signature');
  });

  it('never asks the API about an id that is not a whole number', async () => {
    const metadata = await generateMetadata(props('abc'));
    expect(documentTitleOf(metadata)).toBe('Gesture record abc · Cosmic Signature');
    expect(mockGestureRead).not.toHaveBeenCalled();
  });
});
