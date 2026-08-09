import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';

import { reportError } from '@/utils/errors';

import { render, screen, checkA11y } from '@/test-utils';

import AppError from '../error';
import AllocationError from '../allocation/error';
import AnchoringError from '../anchoring/error';
import GalleryError from '../gallery/error';
import MyAllocationsError from '../my-allocations/error';
import MyAnchorsError from '../my-anchors/error';
import MyStatisticsError from '../my-statistics/error';
import MyTokensError from '../my-tokens/error';
import StatisticsError from '../statistics/error';

jest.mock('../../../../utils/errors', () => ({ reportError: jest.fn() }));

type Boundary = ComponentType<{ error: Error & { digest?: string }; reset: () => void }>;

/**
 * Every wallet-heavy segment plus the group-level fallback. `titleKey` is the
 * `errors` catalog key the next-intl test mock echoes back, so a copy/key
 * mismatch fails here rather than shipping an empty heading.
 */
const BOUNDARIES: ReadonlyArray<
  [name: string, Component: Boundary, context: string, title: string]
> = [
  ['app (group fallback, covers home)', AppError, 'app-route', 'errors.route.titles.app'],
  ['allocation', AllocationError, 'allocation-route', 'errors.route.titles.allocation'],
  ['anchoring', AnchoringError, 'anchoring-route', 'errors.route.titles.anchoring'],
  ['gallery', GalleryError, 'gallery-route', 'errors.route.titles.gallery'],
  [
    'my-allocations',
    MyAllocationsError,
    'my-allocations-route',
    'errors.route.titles.myAllocations',
  ],
  ['my-anchors', MyAnchorsError, 'my-anchors-route', 'errors.route.titles.myAnchors'],
  ['my-statistics', MyStatisticsError, 'my-statistics-route', 'errors.route.titles.myStatistics'],
  ['my-tokens', MyTokensError, 'my-tokens-route', 'errors.route.titles.myTokens'],
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each(BOUNDARIES)('%s route error boundary', (_name, Boundary, context, title) => {
  it('renders its fallback with the segment-specific title', () => {
    render(<Boundary error={new Error('boom')} reset={() => {}} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText('errors.route.message')).toBeInTheDocument();
  });

  it('reports the error once with the segment context', () => {
    const error = Object.assign(new Error('boom'), { digest: 'digest-1' });
    render(<Boundary error={error} reset={() => {}} />);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(error, context);
  });

  it('retries via reset', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    render(<Boundary error={new Error('boom')} reset={reset} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Boundary error={new Error('boom')} reset={() => {}} />);
    await checkA11y(container);
  });
});

describe('statistics route error boundary (shared component refactor)', () => {
  it('keeps its own copy and Sentry context', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    const error = new Error('boom');

    render(<StatisticsError error={error} reset={reset} />);

    expect(reportError).toHaveBeenCalledWith(error, 'statistics-route');
    expect(screen.getByText('Statistics failed to load')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
