import '@testing-library/jest-dom';
import { render } from '@/test-utils';

const mockPageview = jest.fn();
const mockEvent = jest.fn();
const mockUseReportWebVitals = jest.fn();

// Next's hook collects browser performance entries that jsdom does not provide.
// Exercise our registered reporter directly instead of simulating that collector.
jest.mock('next/web-vitals', () => ({
  useReportWebVitals: (...args: unknown[]) => mockUseReportWebVitals(...args),
}));

jest.mock('../../../../utils/analytics', () => ({
  GA_TRACKING_ID: 'G-TEST',
  pageview: (...args: unknown[]) => mockPageview(...args),
  event: (...args: unknown[]) => mockEvent(...args),
}));

const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useParams: () => ({}),
}));

// eslint-disable-next-line import/order -- must come after jest.mock
import { Analytics } from '@/app/analytics';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Analytics', () => {
  it('calls ga.pageview with the current pathname', () => {
    mockUsePathname.mockReturnValue('/gallery');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(<Analytics />);

    expect(mockPageview).toHaveBeenCalledWith('/gallery');
  });

  it('includes search params in the pageview URL', () => {
    mockUsePathname.mockReturnValue('/anchoring');
    // jsdom's URLSearchParams lacks the .size property, so we attach it manually
    const params = new URLSearchParams('tab=overview');
    Object.defineProperty(params, 'size', { value: 1 });
    mockUseSearchParams.mockReturnValue(params);

    render(<Analytics />);

    expect(mockPageview).toHaveBeenCalledWith('/anchoring?tab=overview');
  });

  it('renders nothing (returns null)', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    const { container } = render(<Analytics />);

    expect(container.innerHTML).toBe('');
  });

  it('keeps the vitals reporter stable when navigation rerenders analytics', () => {
    mockUsePathname.mockReturnValue('/gallery');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    const { rerender } = render(<Analytics />);
    const report = mockUseReportWebVitals.mock.calls[0]![0];
    expect(report).toEqual(expect.any(Function));

    mockUsePathname.mockReturnValue('/anchoring');
    const params = new URLSearchParams('tab=overview');
    Object.defineProperty(params, 'size', { value: 1 });
    mockUseSearchParams.mockReturnValue(params);
    rerender(<Analytics />);

    expect(mockPageview).toHaveBeenLastCalledWith('/anchoring?tab=overview');
    expect(mockUseReportWebVitals.mock.calls.length).toBeGreaterThan(1);
    for (const [callback] of mockUseReportWebVitals.mock.calls) {
      expect(callback).toBe(report);
    }
  });

  it.each([
    { name: 'CLS', value: 0.1234, expected: 123 },
    { name: 'LCP', value: 1234.6, expected: 1235 },
  ])('reports $name to GA4 with an integer value', ({ name, value, expected }) => {
    mockUsePathname.mockReturnValue('/gallery');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(<Analytics />);

    expect(mockUseReportWebVitals).toHaveBeenCalledWith(expect.any(Function));
    expect(mockEvent).not.toHaveBeenCalled();
    const report = mockUseReportWebVitals.mock.calls[0]![0];
    report({ name, id: 'metric-id', value });

    expect(mockEvent).toHaveBeenCalledTimes(1);
    expect(mockEvent).toHaveBeenCalledWith({
      action: name,
      category: 'web-vitals',
      label: 'metric-id',
      value: expected,
    });
  });
});
