import type { ReactElement } from 'react';

import { render, screen, within } from '@/test-utils';

import { EmbedCycleNotStarted } from '../EmbedCycleNotStarted';
import EmbedEnduranceChart from '../EmbedEnduranceChart';
import EmbedEndurancePage, { generateMetadata } from '../page';

const mockReadDashboard = jest.fn();
const mockReadLeadLaneCount = jest.fn();
const mockCapCacheWindow = jest.fn();

jest.mock('@/app/[locale]/(app)/publicDataReads', () => ({
  readDashboard: () => mockReadDashboard(),
}));
jest.mock('../leadLaneCount', () => ({
  readLeadLaneCount: (...args: unknown[]) => mockReadLeadLaneCount(...args),
}));
jest.mock('@/lib/cacheWindow', () => ({
  capCacheWindow: (window: string) => mockCapCacheWindow(window),
}));
// The chart is a client component the page only hands its props to.
jest.mock('../EmbedEnduranceChart', () => ({ __esModule: true, default: () => null }));

const props = (round: string, locale = 'en') => ({
  params: Promise.resolve({ locale, round }),
});

const liveCycleIs = (cycle: number) =>
  mockReadDashboard.mockResolvedValue({ data: { CurRoundNum: cycle }, at: 0 });

beforeEach(() => {
  jest.clearAllMocks();
  mockReadLeadLaneCount.mockResolvedValue(19);
});

describe('the endurance embed of a cycle that has not opened', () => {
  it('renders the not-started view on the server, kept a minute, with no lane read', async () => {
    liveCycleIs(3);
    const element = (await EmbedEndurancePage(props('9'))) as ReactElement;
    expect(element.type).toBe(EmbedCycleNotStarted);
    expect(element.props).toEqual({ locale: 'en', cycle: 9, liveCycle: 3 });
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
    expect(mockReadLeadLaneCount).not.toHaveBeenCalled();
  });

  it('names the cycle that has not opened in the tab, never indexed', async () => {
    liveCycleIs(3);
    const metadata = await generateMetadata(props('9'));
    expect(metadata.title).toMatchObject({
      absolute: expect.stringContaining('allocation.missingCycle.notStarted.title(cycle=9)'),
    });
    expect(metadata.description).toBe('allocation.missingCycle.notStarted.body(cycle=9,live=3)');
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('says so in the chart’s place, under the window’s own frame, with the way to the live cycle', async () => {
    render(await EmbedCycleNotStarted({ locale: 'en', cycle: 9, liveCycle: 3 }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Endurance & Chrono timeline · Cycle 9',
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'allocation.missingCycle.notStarted.title(cycle=9)',
    );
    expect(
      screen.getByText('allocation.missingCycle.notStarted.body(cycle=9,live=3)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'allocation.missingCycle.currentCycle' }),
    ).toHaveAttribute('href', '/embed/endurance/3');
    // The source link leads to the section, not to a cycle it cannot show.
    const source = screen.getByRole('link', { name: /Open in Cosmic Signature/ });
    expect(source).toHaveAttribute('href', '/statistics/activity#cycle');
    expect(within(source).getByText(/opens in a new window/)).toBeInTheDocument();
  });
});

describe('the endurance embed of a cycle that has opened', () => {
  it.each([
    ['the live cycle', 3],
    ['a finalized cycle', 1],
  ])('renders %s’s chart with the server’s read, cached for its window', async (_label, cycle) => {
    liveCycleIs(3);
    const element = (await EmbedEndurancePage(props(String(cycle)))) as ReactElement;
    expect(element.type).toBe(EmbedEnduranceChart);
    expect(element.props).toEqual({ roundNum: cycle, seedLiveCycle: 3, expectedLanes: 19 });
    expect(mockReadLeadLaneCount).toHaveBeenCalledWith(cycle, 3);
    expect(mockCapCacheWindow).not.toHaveBeenCalled();
    const metadata = await generateMetadata(props(String(cycle)));
    expect(metadata.title).toMatchObject({
      absolute: expect.stringContaining(`Endurance & Chrono timeline · Cycle ${cycle}`),
    });
  });

  it('leaves the verdict to the browser when the dashboard read fails, and keeps that render a minute', async () => {
    mockReadDashboard.mockResolvedValue({ data: null, at: 0 });
    const element = (await EmbedEndurancePage(props('9'))) as ReactElement;
    expect(element.type).toBe(EmbedEnduranceChart);
    expect(element.props).toMatchObject({ roundNum: 9, seedLiveCycle: undefined });
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });
});
