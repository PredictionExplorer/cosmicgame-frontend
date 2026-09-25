import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { documentTitleOf } from '@/test-utils/metadata';

import { ApiReadError } from '@/services/api/readError';

import Page, { generateMetadata } from '../[id]/page';

const mockGestureRead = jest.fn();
jest.mock('../../../../../services/api', () => ({
  __esModule: true,
  default: { get_bid_info: (...args: unknown[]) => mockGestureRead(...args) },
}));

const mockDashboardRead = jest.fn();
jest.mock('../../publicDataReads', () => ({
  readDashboard: () => mockDashboardRead(),
}));

jest.mock('../[id]/GesturePage', () => ({
  __esModule: true,
  default: function GesturePage() {
    return null;
  },
}));

const props = (id: string) => ({ params: Promise.resolve({ locale: 'en', id }) });

interface GesturePageProps {
  gestureId?: number;
  serverLiveCycle?: number | null;
  children?: ReactNode;
}

/** The props the route hands the client page. */
function renderedPageProps(tree: ReactNode): GesturePageProps | undefined {
  if (!isValidElement(tree)) return undefined;
  const { props: elementProps } = tree as ReactElement<GesturePageProps>;
  if (typeof elementProps.gestureId === 'number') return elementProps;
  const children = Array.isArray(elementProps.children)
    ? elementProps.children
    : [elementProps.children];
  for (const child of children) {
    const found = renderedPageProps(child as ReactNode);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** The gesture id the route hands the client page. */
const renderedGestureId = (tree: ReactNode) => renderedPageProps(tree)?.gestureId;

describe('gesture/[id] metadata (D080)', () => {
  beforeEach(() => mockGestureRead.mockReset());

  it('names the gesture by its place and cycle, read once on the server', async () => {
    mockGestureRead.mockResolvedValue({ BidPosition: 1135, RoundNum: 2 });
    const metadata = await generateMetadata(props('29434'));
    expect(documentTitleOf(metadata)).toBe('Gesture #1135 · Cycle 2 · Cosmic Signature');
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
  beforeEach(() => {
    mockGestureRead.mockReset();
    mockDashboardRead.mockReset();
    mockDashboardRead.mockResolvedValue({ data: { CurRoundNum: 2 }, at: 0 });
  });

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

  it('hands the live cycle it read to the page, so the server HTML draws the final trail', async () => {
    mockGestureRead.mockResolvedValue({ BidPosition: 1135, RoundNum: 2 });
    const tree = await Page(props('29434'));
    expect(renderedPageProps(tree)?.serverLiveCycle).toBe(2);
  });

  it('leaves the trail to the client when the dashboard could not be read', async () => {
    mockDashboardRead.mockResolvedValue({ data: null, at: 0 });
    mockGestureRead.mockResolvedValue({ BidPosition: 1135, RoundNum: 2 });
    const tree = await Page(props('29434'));
    expect(renderedPageProps(tree)?.serverLiveCycle).toBeNull();
  });
});
