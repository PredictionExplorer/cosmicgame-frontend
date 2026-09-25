import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { documentTitleOf } from '@/test-utils/metadata';

import { ApiReadError } from '@/services/api/readError';

import GestureLayout from '../[id]/layout';
import Page, { generateMetadata } from '../[id]/page';

const mockGestureRead = jest.fn();
jest.mock('../../../../../services/api', () => ({
  __esModule: true,
  default: { get_bid_info: (...args: unknown[]) => mockGestureRead(...args) },
}));

jest.mock('../[id]/GesturePage', () => ({
  __esModule: true,
  default: function GesturePage() {
    return null;
  },
}));

const props = (id: string) => ({ params: Promise.resolve({ locale: 'en', id }) });

/** The seeds the route hands the client's query cache. */
function renderedSeeds(tree: ReactNode): Array<{ absent?: boolean; data: unknown }> | undefined {
  if (!isValidElement(tree)) return undefined;
  const { props: elementProps } = tree as ReactElement<{
    seeds?: Array<{ absent?: boolean; data: unknown }>;
    children?: ReactNode;
  }>;
  if (Array.isArray(elementProps.seeds)) return elementProps.seeds;
  const children = Array.isArray(elementProps.children)
    ? elementProps.children
    : [elementProps.children];
  for (const child of children) {
    const found = renderedSeeds(child as ReactNode);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** The gesture id the route hands the client page. */
function renderedGestureId(tree: ReactNode): number | undefined {
  if (!isValidElement(tree)) return undefined;
  const { props: elementProps } = tree as ReactElement<{
    gestureId?: number;
    children?: ReactNode;
  }>;
  if (typeof elementProps.gestureId === 'number') return elementProps.gestureId;
  const children = Array.isArray(elementProps.children)
    ? elementProps.children
    : [elementProps.children];
  for (const child of children) {
    const found = renderedGestureId(child as ReactNode);
    if (found !== undefined) return found;
  }
  return undefined;
}

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

  it('names the record by its id when the API holds no such record (HTTP 400)', async () => {
    mockGestureRead.mockRejectedValue(new ApiReadError('Network response was not OK', 400));
    const metadata = await generateMetadata(props('40000'));
    expect(documentTitleOf(metadata)).toBe('Gesture record 40000 · Cosmic Signature');
  });

  it.each(['abc', '12abc', '-3', '1.5'])(
    'calls %s an invalid id and never asks the API about it',
    async (id) => {
      const metadata = await generateMetadata(props(id));
      // The page's own heading ("Invalid gesture ID"; the test catalog renders keys).
      expect(documentTitleOf(metadata)).toBe('gesture.invalid.title · Cosmic Signature');
      expect(mockGestureRead).not.toHaveBeenCalled();
    },
  );
});

describe('gesture/[id] page', () => {
  beforeEach(() => mockGestureRead.mockReset());

  it('parses the id as strictly as the metadata: "12abc" is invalid, never gesture 12', async () => {
    const tree = await Page(props('12abc'));
    expect(renderedGestureId(tree)).toBe(-1);
    expect(mockGestureRead).not.toHaveBeenCalled();
  });

  it('hands a whole-number id through', async () => {
    mockGestureRead.mockResolvedValue({ BidPosition: 1135, RoundNum: 2 });
    const tree = await Page(props('29434'));
    expect(renderedGestureId(tree)).toBe(29434);
  });
});

describe('gesture/[id] layout', () => {
  // Before the loading boundary streams, so the response is a real 404.
  it.each(['abc', '12abc', '-3', '1.5'])('answers %s with not found', async (id) => {
    await expect(
      GestureLayout({ children: 'page', params: Promise.resolve({ id }) }),
    ).rejects.toThrow();
  });

  it('renders the page for a whole-number id', async () => {
    await expect(
      GestureLayout({ children: 'page', params: Promise.resolve({ id: '29434' }) }),
    ).resolves.toBe('page');
  });
});

describe('gesture/[id] seed', () => {
  beforeEach(() => mockGestureRead.mockReset());

  it('seeds a record the API does not hold as absent, so the HTML says so', async () => {
    mockGestureRead.mockRejectedValue(new ApiReadError('Network response was not OK', 400));
    const seeds = renderedSeeds(await Page(props('40000')));
    expect(seeds?.[0]).toMatchObject({ data: null, absent: true });
  });

  it('seeds nothing absent when the read failed', async () => {
    mockGestureRead.mockRejectedValue(new Error('offline'));
    const seeds = renderedSeeds(await Page(props('40001')));
    expect(seeds?.[0]?.absent).toBe(false);
  });
});
