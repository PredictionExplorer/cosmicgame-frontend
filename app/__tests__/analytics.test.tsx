import '@testing-library/jest-dom';
import { render } from '@/test-utils';

const mockPageview = jest.fn();

jest.mock('../../utils/analytics', () => ({
  GA_TRACKING_ID: 'G-TEST',
  pageview: (...args: unknown[]) => mockPageview(...args),
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
});
