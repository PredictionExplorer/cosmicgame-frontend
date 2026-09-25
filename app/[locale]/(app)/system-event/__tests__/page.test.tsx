import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { documentTitleOf } from '@/test-utils/metadata';

import Page, { generateMetadata } from '../[round]/[start]/[end]/page';
import SystemEventPage from '../[round]/[start]/[end]/SystemEventPage';
import { checkSystemEventWindow } from '../[round]/[start]/[end]/systemEventLink';
import { readSystemEventsSeed } from '../[round]/[start]/[end]/systemEventsSeed';

jest.mock('../[round]/[start]/[end]/SystemEventPage', () => ({
  __esModule: true,
  default: function SystemEventPage() {
    return null;
  },
}));
jest.mock('../[round]/[start]/[end]/systemEventLink', () => ({
  checkSystemEventWindow: jest.fn(),
}));
jest.mock('../[round]/[start]/[end]/systemEventsSeed', () => ({
  readSystemEventsSeed: jest.fn(),
}));

const mockCapCacheWindow = jest.fn();
jest.mock('@/lib/cacheWindow', () => ({
  capCacheWindow: (window: string) => mockCapCacheWindow(window),
}));

const mockCheck = checkSystemEventWindow as jest.MockedFunction<typeof checkSystemEventWindow>;
const mockSeed = readSystemEventsSeed as jest.MockedFunction<typeof readSystemEventsSeed>;

const props = (round: string, start: string, end: string) => ({
  params: Promise.resolve({ locale: 'en', round, start, end }),
});

/** The props the route hands the client page. */
function renderedPageProps(tree: ReactNode): Record<string, unknown> | undefined {
  if (!isValidElement(tree)) return undefined;
  const element = tree as ReactElement<{ children?: ReactNode }>;
  if (element.type === SystemEventPage) return element.props as Record<string, unknown>;
  const children = Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children];
  for (const child of children) {
    const found = renderedPageProps(child as ReactNode);
    if (found) return found;
  }
  return undefined;
}

const SEEDS = [{ queryKey: ['systemEvents', 200, 350], data: [], at: 0 }];

describe('system-event/[round]/[start]/[end] page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSeed.mockResolvedValue(SEEDS);
  });

  it('keeps a closed window for a day: its changes are final', async () => {
    mockCheck.mockResolvedValue({ status: 'canonical' });
    const tree = await Page(props('2', '200', '350'));
    expect(renderedPageProps(tree)).toEqual({ round: 2, start: 200, end: 350 });
    expect(mockCapCacheWindow).toHaveBeenCalledWith('final');
  });

  // A segment's notFound() reaches the browser as the bare error shell: the page renders the
  // window's not-found state on the server instead, and reads none of its events.
  it('renders a cycle with no window as the window’s not-found state', async () => {
    mockCheck.mockResolvedValue({ status: 'missing' });
    const tree = await Page(props('99', '1', '2'));
    expect(renderedPageProps(tree)).toEqual({ round: 99, start: 1, end: 2, missing: true });
    expect(mockSeed).not.toHaveBeenCalled();
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it.each([
    ['the mode list could not be read', { status: 'unchecked' as const }, SEEDS],
    ['the events could not be read', { status: 'canonical' as const }, []],
  ])('keeps a render a minute when %s', async (_case, check, seeds) => {
    mockCheck.mockResolvedValue(check);
    mockSeed.mockResolvedValue(seeds);
    await Page(props('2', '200', '350'));
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('titles a window that does not exist as its H1 does', async () => {
    mockCheck.mockResolvedValue({ status: 'missing' });
    const metadata = await generateMetadata(props('99', '1', '2'), Promise.resolve({}) as never);
    expect(documentTitleOf(metadata)).toBe(
      'This configuration window does not exist · Cosmic Signature',
    );
    expect(metadata.robots).toEqual(expect.objectContaining({ index: false }));
  });

  it('titles a window by its cycle', async () => {
    mockCheck.mockResolvedValue({ status: 'canonical' });
    const metadata = await generateMetadata(props('2', '200', '350'), Promise.resolve({}) as never);
    expect(documentTitleOf(metadata)).toMatch(/Cycle 2/);
  });
});
